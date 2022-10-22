/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/app-nerds/fireplace/v2/cmd/fireplace-server/internal"
	"github.com/app-nerds/kit/v6/datetime"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	// Version is the version of this application. This is set at build time
	Version string = "development"
)

func main() {
	var (
		err      error
		config   internal.Config
		logger   *logrus.Entry
		ctx      context.Context
		cancel   context.CancelFunc
		dbClient *mongo.Client
		db       *mongo.Database
		// db                 database.Database
		// session            database.Session
		dateTimeService    datetime.IDateTimeParser
		logEntryService    internal.ILogEntryService
		logEntryController internal.ILogEntryController
		httpServer         *http.Server
		deleteLogsCron     *cron.Cron
	)

	config = internal.GetConfig(Version)

	logger = logrus.New().WithField("who", "Fireplace")
	logger.Logger.SetLevel(config.LogLevel)

	logger.WithFields(logrus.Fields{
		"version":  Version,
		"database": config.DatabaseURL,
		"host":     config.Host,
		"cert":     config.Cert,
		"loglevel": config.LogLevel,
	}).Info("Welcome to Fireplace Server!")

	/*
	 * Setup database
	 */
	ctx, cancel = context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	if dbClient, err = mongo.Connect(ctx, options.Client().ApplyURI(config.DatabaseURL)); err != nil {
		logger.WithError(err).Fatal("error opening database conenction")
	}

	defer dbClient.Disconnect(ctx)

	db = dbClient.Database("fireplace")

	if err = createIndexes(db); err != nil {
		logger.WithError(err).Fatal("error creating indexes")
	}

	/*
	 * Setup services
	 */
	dateTimeService = datetime.DateTimeParser{}

	logEntryService = internal.NewLogEntryService(
		config,
		db,
	)

	/*
	 * Setup controllers
	 */
	logEntryController = internal.NewLogEntryController(
		config,
		logger.WithField("who", "LogEntryController"),
		logEntryService,
	)

	/*
	 * Server routes
	 */
	router := mux.NewRouter()
	auth := NewAuthMiddleware(logger, config.Password)

	router.Use(auth.Middleware)

	// CORS
	headersOK := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization", "Host"})
	originsOK := handlers.AllowedOrigins([]string{"*"})
	methodsOK := handlers.AllowedMethods([]string{"OPTIONS", "POST", "GET", "DELETE"})

	router.HandleFunc("/logentry", logEntryController.CreateLogEntry).Methods(http.MethodPost, http.MethodOptions)
	router.HandleFunc("/logentry", logEntryController.GetLogEntries).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/logentry/{id}", logEntryController.GetLogEntry).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/logentry", logEntryController.DeleteLogEntries).Methods(http.MethodDelete, http.MethodOptions)
	router.HandleFunc("/applicationname", logEntryController.GetApplicationNames).Methods(http.MethodGet, http.MethodOptions)

	/*
	 * Run the server
	 */
	go func() {
		var err error

		logger.Info("Starting Fireplace Server...")

		httpServer = &http.Server{
			Handler:      handlers.CORS(headersOK, originsOK, methodsOK)(router),
			Addr:         config.Host,
			WriteTimeout: 30 * time.Second,
			ReadTimeout:  30 * time.Second,
		}

		if config.Cert == "" {
			err = httpServer.ListenAndServe()
		} else {
			err = httpServer.ListenAndServeTLS(config.Cert+".crt", config.Cert+".key")
		}

		if err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Unable to start application")
		} else {
			logger.Info("Shutting down the server...")
		}
	}()

	/*
	 * Run the delete logs cron
	 */
	logger.WithFields(logrus.Fields{
		"schedule":  config.CleanLogSchedule,
		"ageInDays": config.CleanLogIntervalDays,
	}).Info("Starting log entry cleaner")

	deleteLogsCron = cron.New()
	deleteLogsCron.AddFunc(config.CleanLogSchedule, deleteLogEntries(config.CleanLogIntervalDays, logger, logEntryService, dateTimeService))
	deleteLogsCron.Start()

	/*
	 * Setup shutdown handler
	 */
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt, syscall.SIGQUIT, syscall.SIGTERM)
	<-quit

	deleteLogsCron.Stop()

	ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = httpServer.Shutdown(ctx); err != nil {
		logger.Errorf("There was an error shutting down the server - %s", err.Error())
	}

	logger.Info("Server stopped")
}

func deleteLogEntries(cleanLogIntervalDays int, logger *logrus.Entry, logEntryService internal.ILogEntryService, dateTimeService datetime.IDateTimeParser) func() {
	return func() {
		var (
			err        error
			numDeleted int
			daysAgo    time.Time
		)

		daysAgo, _ = dateTimeService.DaysAgo(cleanLogIntervalDays)
		logger.Infof("Deleting log entries older than %s (UTC)...", daysAgo.Format("2006-01-02"))

		numDeleted, err = logEntryService.Delete(daysAgo)

		if err != nil {
			logger.WithError(err).WithFields(logrus.Fields{
				"intervalDays": cleanLogIntervalDays,
			}).Error("Error deleting old log entries")
			return
		}

		logger.WithFields(logrus.Fields{
			"numDeleted": numDeleted,
		}).Info("Deleted old records")
	}
}

func createIndexes(db *mongo.Database) error {
	var (
		err error
	)

	c := db.Collection(internal.DatabaseCollection)

	applicationIndex := mongo.IndexModel{Keys: bson.D{{Key: "application", Value: 1}}}
	levelIndex := mongo.IndexModel{Keys: bson.D{{Key: "level", Value: 1}}}
	timeIndex := mongo.IndexModel{Keys: bson.D{{Key: "time", Value: 1}}}
	applicationLevelIndex := mongo.IndexModel{Keys: bson.D{{Key: "application", Value: 1}, {Key: "level", Value: 1}}}

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute*10)
	defer cancel()

	indexes := []mongo.IndexModel{
		applicationIndex,
		levelIndex,
		timeIndex,
		applicationLevelIndex,
	}

	if _, err = c.Indexes().CreateMany(ctx, indexes); err != nil {
		return fmt.Errorf("error creating indexes: %w", err)
	}

	return nil
}
