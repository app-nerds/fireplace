package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/adampresley/fireplace/pkg/logentry"
	"github.com/adampresley/fireplace/pkg/logging"
	"github.com/dgraph-io/badger"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/sirupsen/logrus"
)

const (
	SERVER_VERSION string = "0.1.0"
	DATA_DIRECTORY string = "./database"
)

var logLevel = flag.String("loglevel", "info", "Level of logs to write. Valid values are 'debug', 'info', or 'error'. Default is 'info'")
var host = flag.String("host", "0.0.0.0:8999", "Address and port to bind this server to")

var logger *logrus.Entry
var db *badger.DB
var logEntryService *logentry.LogEntryService

func main() {
	var err error

	flag.Parse()

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())

	logger = logging.GetLogger(*logLevel, "Fireplace Server")

	/*
	 * Setup database
	 */
	if _, err := os.Stat(DATA_DIRECTORY); os.IsNotExist(err) {
		if err = os.Mkdir(DATA_DIRECTORY, os.ModePerm); err != nil {
			logger.WithError(err).Fatalf("Error creating data directory")
		}
	}

	options := badger.DefaultOptions
	options.Dir = DATA_DIRECTORY
	options.ValueDir = DATA_DIRECTORY

	if db, err = badger.Open(options); err != nil {
		logger.WithError(err).Fatalf("Unable to open database")
	}

	/*
	 * Setup services
	 */
	logEntryService = &logentry.LogEntryService{
		DB: db,
	}

	httpServer.POST("/logentry", createLogEntry)
	httpServer.GET("/logentry", getLogEntries)

	go func() {
		var err error

		logger.WithField("host", *host).Infof("Starting Fireplace Server v%s", SERVER_VERSION)

		if err = httpServer.Start(*host); err != nil {
			if err != http.ErrServerClosed {
				logger.WithError(err).Fatalf("Unable to start application")
			} else {
				logger.Infof("Shutting down the server...")
			}
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
		logger.Errorf("There was an error shutting down the server - %s", err.Error())
	}
}

func createLogEntry(ctx echo.Context) error {
	var err error
	var newID string
	entry := &logentry.LogEntry{}

	if err = ctx.Bind(&entry); err != nil {
		return ctx.String(http.StatusBadRequest, "Invalid log entry")
	}

	if newID, err = logEntryService.CreateLogEntry(entry); err != nil {
		logger.WithError(err).Errorf("Error creatig log entry in createLogEntry")
		return ctx.String(http.StatusInternalServerError, "Error creating log entry")
	}

	logger.WithField("id", string(newID)).Infof("New log entry captured")
	return ctx.String(http.StatusOK, string(newID))
}

func getLogEntries(ctx echo.Context) error {
	var err error
	totalRecords := 0
	result := make(logentry.LogEntryCollection, 0, 500)

	if result, totalRecords, err = logEntryService.GetLogEntries(); err != nil {
		return ctx.String(http.StatusInternalServerError, "Error getting log enries: "+err.Error())
	}

	logger.WithField("totalRecords", totalRecords).Infof("Log entries retrieved")
	return ctx.JSON(http.StatusOK, result)
}
