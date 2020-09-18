package logentry_controllers

import (
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/app-nerds/fireplace/api/filter/filter_models"
	"github.com/app-nerds/fireplace/api/logentry/logentry_models"
	"github.com/app-nerds/fireplace/api/logentry/logentry_services"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
)

type ILogEntryController interface {
	CreateLogEntry(ctx echo.Context) error
	DeleteLogEntries(ctx echo.Context) error
	GetApplicationNames(ctx echo.Context) error
	GetLogEntries(ctx echo.Context) error
	GetLogEntry(ctx echo.Context) error
}

type LogEntryControllerConfig struct {
	Logger          *logrus.Entry
	LogEntryService logentry_services.ILogEntryService
	PageSize        int
}

type LogEntryController struct {
	Logger          *logrus.Entry
	LogEntryService logentry_services.ILogEntryService
	PageSize        int
}

func NewLogEntryController(config LogEntryControllerConfig) LogEntryController {
	return LogEntryController{
		Logger:          config.Logger,
		LogEntryService: config.LogEntryService,
		PageSize:        config.PageSize,
	}
}

func (c LogEntryController) CreateLogEntry(ctx echo.Context) error {
	var err error
	var newID string
	entry := &logentry_models.CreateLogEntryRequest{}

	if err = ctx.Bind(&entry); err != nil {
		c.Logger.WithError(err).Error("Error binding create request")
		return ctx.String(http.StatusBadRequest, "Invalid log entry")
	}

	if newID, err = c.LogEntryService.CreateLogEntry(entry); err != nil {
		c.Logger.WithError(err).Error("Error creating log entry in createLogEntry")
		return ctx.String(http.StatusInternalServerError, "Error creating log entry")
	}

	c.Logger.WithFields(logrus.Fields{"id": newID, "application": entry.Application}).Infof("New log entry captured")
	return ctx.String(http.StatusOK, newID)
}

func (c LogEntryController) DeleteLogEntries(ctx echo.Context) error {
	var err error
	var initialFromDate time.Time
	var fromDate time.Time
	var numRecordsDeleted int

	if initialFromDate, err = time.Parse("1/2/2006", ctx.QueryParam("fromDate")); err != nil {
		return ctx.String(http.StatusBadRequest, "Invalid fromDate value")
	}

	fromDate = initialFromDate.Add(24 * time.Hour)

	if numRecordsDeleted, err = c.LogEntryService.Delete(fromDate); err != nil {
		return ctx.String(http.StatusInternalServerError, "Error deleting log entries: "+err.Error())
	}

	c.Logger.WithFields(logrus.Fields{"fromDate": ctx.QueryParam("fromDate"), "numRecords": numRecordsDeleted}).Info("Deleted log entries")
	return ctx.String(http.StatusOK, strconv.Itoa(numRecordsDeleted)+" entries deleted")
}

func (c LogEntryController) GetApplicationNames(ctx echo.Context) error {
	var err error
	var applicationNames []string

	if applicationNames, err = c.LogEntryService.GetApplicationNames(); err != nil {
		c.Logger.WithError(err).Error("Error getting application names")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	return ctx.JSON(http.StatusOK, applicationNames)
}

func (c LogEntryController) GetLogEntries(ctx echo.Context) error {
	var err error
	totalRecords := 0
	var page int
	result := make(logentry_models.LogEntryCollection, 0, 500)

	application, _ := url.QueryUnescape(ctx.QueryParam("application"))
	search, _ := url.QueryUnescape(ctx.QueryParam("search"))

	filter := &filter_models.LogEntryFilter{
		Application: application,
		Level:       ctx.QueryParam("level"),
		Search:      search,
	}

	if page, err = strconv.Atoi(ctx.QueryParam("page")); err != nil {
		c.Logger.WithError(err).WithField("requestedPage", ctx.QueryParam("page")).Error("Unable to get page info")
		page = 1
	}

	filter.Page = page

	if result, totalRecords, err = c.LogEntryService.GetLogEntries(filter); err != nil {
		c.Logger.WithError(err).WithField("filter", filter).Error("Error getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries: "+err.Error())
	}

	c.Logger.WithFields(logrus.Fields{"totalRecords": totalRecords, "count": len(result), "page": page}).Info("Log entries retrieved")

	response := &logentry_models.GetLogEntriesResponse{
		LogEntries: result,
		TotalCount: totalRecords,
		Count:      len(result),
		PageSize:   c.PageSize,
	}

	return ctx.JSON(http.StatusOK, response)
}

func (c LogEntryController) GetLogEntry(ctx echo.Context) error {
	var err error
	result := &logentry_models.LogEntry{}

	if result, err = c.LogEntryService.GetLogEntry(ctx.Param("id")); err != nil {
		return ctx.String(http.StatusInternalServerError, "Error getting log entry "+ctx.Param("id"))
	}

	c.Logger.WithField("id", ctx.Param("id")).Info("Retrieved log entry")
	return ctx.JSON(http.StatusOK, result)
}
