/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/app-nerds/fireplace/v2/cmd/fireplace-server/internal"
	"github.com/app-nerds/kit/v6/database"
	"github.com/app-nerds/kit/v6/datetime"
	"github.com/gorilla/mux"
	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
)

var (
	// Version is the version of this application. This is set at build time
	Version string = "development"
)

func main() {
	var (
		err                error
		config             internal.Config
		logger             *logrus.Entry
		db                 database.Database
		session            database.Session
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
	if session, err = database.Dial(config.DatabaseURL); err != nil {
		logger.WithError(err).Fatal("Error opening database connection")
	}

	db = session.DB("fireplace")
	defer session.Close()

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

	router.HandleFunc("/logentry", logEntryController.CreateLogEntry).Methods(http.MethodPost)
	router.HandleFunc("/logentry", logEntryController.GetLogEntries).Methods(http.MethodGet)
	router.HandleFunc("/logentry/{id}", logEntryController.GetLogEntry).Methods(http.MethodGet)
	router.HandleFunc("/logentry", logEntryController.DeleteLogEntries).Methods(http.MethodDelete)
	router.HandleFunc("/applicationname", logEntryController.GetApplicationNames).Methods(http.MethodGet)

	/*
	 * Run the server
	 */
	go func() {
		var err error

		logger.Info("Starting Fireplace Server...")

		httpServer = &http.Server{
			Handler:      router,
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

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = httpServer.Shutdown(ctx); err != nil {
		logger.Error("There was an error shutting down the server - %s", err.Error())
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
