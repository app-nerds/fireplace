package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"gopkg.in/mgo.v2"

	"github.com/adampresley/fireplace/pkg/filters"
	"github.com/adampresley/fireplace/pkg/logentry"
	"github.com/adampresley/fireplace/pkg/logging"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/sirupsen/logrus"
)

const (
	SERVER_VERSION string = "0.1.0"
	DATA_DIRECTORY string = "./database"
	PAGE_SIZE      int    = 100
)

var logLevel = flag.String("loglevel", "info", "Level of logs to write. Valid values are 'debug', 'info', or 'error'. Default is 'info'")
var host = flag.String("host", "0.0.0.0:8999", "Address and port to bind this server to")

var logger *logrus.Entry

//var db *badger.DB
var db *mgo.Database
var session *mgo.Session
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
	if session, err = mgo.Dial("localhost:27017"); err != nil {
		logger.WithError(err).Fatalf("Error opening database connection")
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
	entry := &logentry.CreateLogEntryRequest{}

	if err = ctx.Bind(&entry); err != nil {
		logger.WithError(err).Errorf("Error binding create request")
		return ctx.String(http.StatusBadRequest, "Invalid log entry")
	}

	if newID, err = logEntryService.CreateLogEntry(entry); err != nil {
		logger.WithError(err).Errorf("Error creatig log entry in createLogEntry")
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

	logger.WithFields(logrus.Fields{"fromDate": ctx.QueryParam("fromDate"), "numRecords": numRecordsDeleted}).Infof("Deleted log entries")
	return ctx.String(http.StatusOK, strconv.Itoa(numRecordsDeleted)+" entries deleted")
}

func getApplicationNames(ctx echo.Context) error {
	var err error
	var applicationNames []string

	if applicationNames, err = logEntryService.GetApplicationNames(); err != nil {
		logger.WithError(err).Errorf("Error getting application names")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	return ctx.JSON(http.StatusOK, applicationNames)
}

func getLogEntries(ctx echo.Context) error {
	var err error
	totalRecords := 0
	var page int
	result := make(logentry.LogEntryCollection, 0, 500)

	filter := &filters.LogEntryFilter{
		Application: ctx.QueryParam("application"),
		Level:       ctx.QueryParam("level"),
		Search:      ctx.QueryParam("search"),
	}

	if page, err = strconv.Atoi(ctx.QueryParam("page")); err != nil {
		logger.WithError(err).WithField("requestedPage", ctx.QueryParam("page")).Errorf("Unable to get page info")
		page = 1
	}

	filter.Page = page

	if result, totalRecords, err = logEntryService.GetLogEntries(filter); err != nil {
		logger.WithError(err).WithField("filter", filter).Errorf("Error getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log enries: "+err.Error())
	}

	logger.WithFields(logrus.Fields{"totalRecords": totalRecords, "count": len(result), "page": page}).Infof("Log entries retrieved")

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

	logger.WithField("id", ctx.Param("id")).Infof("Retrieved log entry")
	return ctx.JSON(http.StatusOK, result)
}
