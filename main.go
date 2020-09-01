package main

import (
	"context"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/app-nerds/kit/v4/database"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"

	"github.com/app-nerds/fireplace/pkg/filters"
	"github.com/app-nerds/fireplace/pkg/logentry"
	"github.com/app-nerds/fireplace/pkg/logging"
)

var Version string = "development"

const (
	PAGE_SIZE int = 100
)

var logger *logrus.Entry
var config *viper.Viper
var db database.Database
var session database.Session
var logEntryService *logentry.LogEntryService

func main() {
	var err error

	config = viper.New()
	config.Set("version", Version)
	config.SetDefault("server.host", "0.0.0.0:8999")
	config.BindEnv("server.host", "FIREPLACE_SERVER_HOST")
	config.SetDefault("server.loglevel", "debug")
	config.BindEnv("server.loglevel", "FIREPLACE_SERVER_LOGLEVEL")
	config.SetDefault("database.url", "mongodb://localhost:27017")
	config.BindEnv("database.url", "FIREPLACE_DATABASE_URL")

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())

	logger = logging.GetLogger(config.GetString("server.loglevel"), "Fireplace Server")
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

	/*
	 * Setup services
	 */
	logEntryService = &logentry.LogEntryService{
		DB:       db,
		PageSize: PAGE_SIZE,
	}

	httpServer.POST("/logentry", createLogEntry)
	httpServer.GET("/logentry", getLogEntries)
	httpServer.GET("/logentry/:id", getLogEntry)
	httpServer.DELETE("/logentry", deleteLogEntries)
	httpServer.GET("/applicationname", getApplicationNames)

	go func() {
		var err error

		logger.WithField("host", config.GetString("server.host")).Infof("Starting Fireplace Server v%s", Version)

		if err = httpServer.Start(config.GetString("server.host")); err != nil {
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
	entry := &logentry.CreateLogEntryRequest{}

	if err = ctx.Bind(&entry); err != nil {
		logger.WithError(err).Error("Error binding create request")
		return ctx.String(http.StatusBadRequest, "Invalid log entry")
	}

	if newID, err = logEntryService.CreateLogEntry(entry); err != nil {
		logger.WithError(err).Error("Error creating log entry in createLogEntry")
		return ctx.String(http.StatusInternalServerError, "Error creating log entry")
	}

	logger.WithFields(logrus.Fields{"id": newID, "application": entry.Application}).Infof("New log entry captured")
	return ctx.String(http.StatusOK, newID)
}

func deleteLogEntries(ctx echo.Context) error {
	var err error
	var initialFromDate time.Time
	var fromDate time.Time
	var numRecordsDeleted int

	if initialFromDate, err = time.Parse("1/2/2006", ctx.QueryParam("fromDate")); err != nil {
		return ctx.String(http.StatusBadRequest, "Invalid fromDate value")
	}

	fromDate = initialFromDate.Add(24 * time.Hour)

	if numRecordsDeleted, err = logEntryService.Delete(fromDate); err != nil {
		return ctx.String(http.StatusInternalServerError, "Error deleting log entries: "+err.Error())
	}

	logger.WithFields(logrus.Fields{"fromDate": ctx.QueryParam("fromDate"), "numRecords": numRecordsDeleted}).Info("Deleted log entries")
	return ctx.String(http.StatusOK, strconv.Itoa(numRecordsDeleted)+" entries deleted")
}

func getApplicationNames(ctx echo.Context) error {
	var err error
	var applicationNames []string

	if applicationNames, err = logEntryService.GetApplicationNames(); err != nil {
		logger.WithError(err).Error("Error getting application names")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	return ctx.JSON(http.StatusOK, applicationNames)
}

func getLogEntries(ctx echo.Context) error {
	var err error
	totalRecords := 0
	var page int
	result := make(logentry.LogEntryCollection, 0, 500)

	application, _ := url.QueryUnescape(ctx.QueryParam("application"))
	search, _ := url.QueryUnescape(ctx.QueryParam("search"))

	filter := &filters.LogEntryFilter{
		Application: application,
		Level:       ctx.QueryParam("level"),
		Search:      search,
	}

	if page, err = strconv.Atoi(ctx.QueryParam("page")); err != nil {
		logger.WithError(err).WithField("requestedPage", ctx.QueryParam("page")).Error("Unable to get page info")
		page = 1
	}

	filter.Page = page

	if result, totalRecords, err = logEntryService.GetLogEntries(filter); err != nil {
		logger.WithError(err).WithField("filter", filter).Error("Error getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries: "+err.Error())
	}

	logger.WithFields(logrus.Fields{"totalRecords": totalRecords, "count": len(result), "page": page}).Info("Log entries retrieved")

	response := &logentry.GetLogEntriesResponse{
		LogEntries: result,
		TotalCount: totalRecords,
		Count:      len(result),
		PageSize:   PAGE_SIZE,
	}

	return ctx.JSON(http.StatusOK, response)
}

func getLogEntry(ctx echo.Context) error {
	var err error
	result := &logentry.LogEntry{}

	if result, err = logEntryService.GetLogEntry(ctx.Param("id")); err != nil {
		return ctx.String(http.StatusInternalServerError, "Error getting log entry "+ctx.Param("id"))
	}

	logger.WithField("id", ctx.Param("id")).Info("Retrieved log entry")
	return ctx.JSON(http.StatusOK, result)
}
