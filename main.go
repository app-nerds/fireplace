package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/app-nerds/kit/v5/database"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"

	"github.com/app-nerds/fireplace/api/logentry/logentry_controllers"
	"github.com/app-nerds/fireplace/api/logentry/logentry_services"
)

var Version string = "development"

const (
	PAGE_SIZE int = 100
)

func main() {
	var err error
	var config *viper.Viper
	var logger *logrus.Entry
	var logLevel logrus.Level
	var db database.Database
	var session database.Session
	var logEntryService logentry_services.LogEntryService
	var logEntryController logentry_controllers.ILogEntryController

	config = getConfig(Version)

	if logLevel, err = logrus.ParseLevel(config.GetString("server.loglevel")); err != nil {
		panic("Invalid log level")
	}

	logger = logrus.New().WithField("who", "Fireplace")
	logger.Logger.SetLevel(logLevel)

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())

	logger.WithFields(logrus.Fields{
		"version":  Version,
		"database": config.GetString("database.url"),
		"host":     config.GetString("server.host"),
		"loglevel": config.GetString("server.loglevel"),
	}).Info("Welcome to Fireplace Server!")

	/*
	 * Setup database
	 */
	if session, err = database.Dial(config.GetString("database.url")); err != nil {
		logger.WithError(err).Fatal("Error opening database connection")
	}

	db = session.DB("fireplace")
	defer session.Close()

	/*
	 * Setup services
	 */
	logEntryService = logentry_services.NewLogEntryService(logentry_services.LogEntryServiceConfig{
		DB:       db,
		PageSize: PAGE_SIZE,
	})

	/*
	 * Setup controllers
	 */
	logEntryController = logentry_controllers.NewLogEntryController(logentry_controllers.LogEntryControllerConfig{
		Logger:          logger.WithField("who", "LogEntryController"),
		LogEntryService: logEntryService,
		PageSize:        PAGE_SIZE,
	})

	/*
	 * Server routes
	 */
	httpServer.POST("/logentry", logEntryController.CreateLogEntry)
	httpServer.GET("/logentry", logEntryController.GetLogEntries)
	httpServer.GET("/logentry/:id", logEntryController.GetLogEntry)
	httpServer.DELETE("/logentry", logEntryController.DeleteLogEntries)
	httpServer.GET("/applicationname", logEntryController.GetApplicationNames)

	/*
	 * Run the server
	 */
	go func() {
		var err error

		logger.WithField("host", config.GetString("server.host")).Infof("Starting Fireplace Server version %s", Version)

		err = httpServer.Start(config.GetString("server.host"))

		if err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Unable to start application")
		} else {
			logger.Info("Shutting down the server...")
		}
	}()

	/*
	 * Setup shutdown handler
	 */
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt, syscall.SIGQUIT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = httpServer.Shutdown(ctx); err != nil {
		logger.Error("There was an error shutting down the server - %s", err.Error())
	}

	logger.Info("Server stopped")
}
