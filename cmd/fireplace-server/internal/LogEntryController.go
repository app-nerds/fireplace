package internal

import (
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/app-nerds/nerdweb/v2"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

/*
ILogEntryController describes handlers for working with Log Entries in Fireplace Server
*/
type ILogEntryController interface {
	/*
	   CreateLogEntry creates a new log entry and stores it in the database.
	*/
	CreateLogEntry(w http.ResponseWriter, r *http.Request)

	/*
	   DeleteLogEntries deletes all log entries prior to the provided date/time.
	*/
	DeleteLogEntries(w http.ResponseWriter, r *http.Request)

	/*
	   GetApplicationNames returns an array of application names that have written
	   log entries into Fireplace.
	*/
	GetApplicationNames(w http.ResponseWriter, r *http.Request)

	/*
	   GetLogEntries retrieves log entries. A caller may filter results by providing
	   various query parameters.
	*/
	GetLogEntries(w http.ResponseWriter, r *http.Request)

	/*
	   GetLogEntry retrieves a single log entry by ID
	*/
	GetLogEntry(w http.ResponseWriter, r *http.Request)
}

/*
LogEntryController provides handlers for working with Log Entries in Fireplace Server
*/
type LogEntryController struct {
	config          Config
	logger          *logrus.Entry
	logEntryService ILogEntryService
}

/*
NewLogEntryController creates a new LogEntryController
*/
func NewLogEntryController(config Config, logger *logrus.Entry, logEntryService ILogEntryService) LogEntryController {
	return LogEntryController{
		config:          config,
		logger:          logger,
		logEntryService: logEntryService,
	}
}

/*
CreateLogEntry creates a new log entry and stores it in the database.
*/
func (c LogEntryController) CreateLogEntry(w http.ResponseWriter, r *http.Request) {
	var (
		err   error
		newID string
		entry pkg.CreateLogEntryRequest
	)

	if err = nerdweb.ReadJSONBody(r, &entry); err != nil {
		c.logger.WithError(err).Error("Error reading body in CreateLogEntry")
		nerdweb.WriteJSON(c.logger, w, http.StatusBadRequest, pkg.GenericResponse{
			Message: "Invalid log entry in request",
		})
		return
	}

	if newID, err = c.logEntryService.CreateLogEntry(entry); err != nil {
		c.logger.WithError(err).Error("Error creating log entry in CreateLogEntry")
		nerdweb.WriteJSON(c.logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: "Error creating log entry",
		})
		return
	}

	c.logger.WithFields(logrus.Fields{
		"id":          newID,
		"application": entry.Application,
	}).Info("New log entry captured")

	nerdweb.WriteJSON(c.logger, w, http.StatusOK, pkg.GenericResponse{
		Message: newID,
	})
}

/*
DeleteLogEntries deletes all log entries prior to the provided date/time.
*/
func (c LogEntryController) DeleteLogEntries(w http.ResponseWriter, r *http.Request) {
	var (
		err               error
		initialFromDate   time.Time
		fromDate          time.Time
		numRecordsDeleted int
	)

	queryValues := r.URL.Query()

	if initialFromDate, err = time.Parse("1/2/2006", queryValues.Get("fromDate")); err != nil {
		if initialFromDate, err = time.Parse("2006-01-02", queryValues.Get("fromDate")); err != nil {
			nerdweb.WriteJSON(c.logger, w, http.StatusBadRequest, pkg.GenericResponse{
				Message: "Invalid fromDate value. Valid formats are: '1/2/2006', '2006-01-02'",
			})
			return
		}
	}

	fromDate = initialFromDate.Add(24 * time.Hour)

	if numRecordsDeleted, err = c.logEntryService.Delete(fromDate); err != nil {
		nerdweb.WriteJSON(c.logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: "Error deleting log entries: " + err.Error(),
		})
		return
	}

	c.logger.WithFields(logrus.Fields{
		"fromDate":   queryValues.Get("fromDate"),
		"numRecords": numRecordsDeleted,
	}).Info("Deleted log entries")

	nerdweb.WriteJSON(c.logger, w, http.StatusOK, pkg.GenericResponse{
		Message: strconv.Itoa(numRecordsDeleted) + " entries deleted",
	})
}

/*
GetApplicationNames returns an array of application names that have written
log entries into Fireplace.
*/
func (c LogEntryController) GetApplicationNames(w http.ResponseWriter, r *http.Request) {
	var (
		err              error
		applicationNames []string
	)

	if applicationNames, err = c.logEntryService.GetApplicationNames(); err != nil {
		c.logger.WithError(err).Error("Error getting application names")
		nerdweb.WriteJSON(c.logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: "Error getting application names",
		})
		return
	}

	nerdweb.WriteJSON(c.logger, w, http.StatusOK, applicationNames)
}

/*
GetLogEntries retrieves log entries. A caller may filter results by providing
various query parameters.
*/
func (c LogEntryController) GetLogEntries(w http.ResponseWriter, r *http.Request) {
	var (
		err      error
		page     int
		dateFrom time.Time
		dateTo   time.Time
	)

	totalRecords := 0
	result := make(pkg.LogEntryCollection, 0, 500)

	queryValues := r.URL.Query()
	application, _ := url.QueryUnescape(queryValues.Get("application"))
	search, _ := url.QueryUnescape(queryValues.Get("search"))
	dateFromString, _ := url.QueryUnescape(queryValues.Get("dateFrom"))
	dateToString, _ := url.QueryUnescape(queryValues.Get("dateTo"))

	if dateFromString != "" {
		if dateFrom, err = time.Parse("2006-01-02T15:04:05Z", dateFromString); err != nil {
			c.logger.WithError(err).Error("invalid format in dateFrom")
			nerdweb.WriteJSON(c.logger, w, http.StatusBadRequest, pkg.GenericResponse{
				Message: "Invalid value for argument 'dateFrom'. Format is YYYY-MM-DDTHH:mm:ssZ",
			})
			return
		}
	}

	if dateToString != "" {
		if dateTo, err = time.Parse("2006-01-02T15:04:05Z", dateToString); err != nil {
			c.logger.WithError(err).Error("invalid format in dateTo")
			nerdweb.WriteJSON(c.logger, w, http.StatusBadRequest, pkg.GenericResponse{
				Message: "Invalid value for argument 'dateTo'. Format is YYYY-MM-DDTHH:mm:ssZ",
			})
			return
		}
	}

	filter := pkg.LogEntryFilter{
		Application: application,
		Level:       queryValues.Get("level"),
		Search:      search,
	}

	if dateFromString != "" {
		filter.DateFrom = dateFrom
	}

	if dateToString != "" {
		filter.DateTo = dateTo
	}

	if page, err = strconv.Atoi(queryValues.Get("page")); err != nil {
		c.logger.WithError(err).WithField("requestedPage", queryValues.Get("page")).Error("Unable to get page info")
		page = 1
	}

	filter.Page = page

	if result, totalRecords, err = c.logEntryService.GetLogEntries(filter); err != nil {
		c.logger.WithError(err).WithField("filter", filter).Error("Error getting log entries")
		nerdweb.WriteJSON(c.logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: "Error getting log entries: " + err.Error(),
		})
		return
	}

	c.logger.WithFields(logrus.Fields{
		"totalRecords": totalRecords,
		"count":        len(result),
		"page":         page,
	}).Info("Log entries retrieved")

	response := pkg.GetLogEntriesResponse{
		LogEntries: result,
		TotalCount: totalRecords,
		Count:      len(result),
		PageSize:   c.config.PageSize,
	}

	nerdweb.WriteJSON(c.logger, w, http.StatusOK, response)
}

/*
GetLogEntry retrieves a single log entry by ID
*/
func (c LogEntryController) GetLogEntry(w http.ResponseWriter, r *http.Request) {
	var (
		err error
	)

	vars := mux.Vars(r)
	result := pkg.LogEntry{}

	if result, err = c.logEntryService.GetLogEntry(vars["id"]); err != nil {
		nerdweb.WriteJSON(c.logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: "Error getting log etnry " + vars["id"],
		})
		return
	}

	c.logger.WithField("id", vars["id"]).Info("Retrieved log entry")
	nerdweb.WriteJSON(c.logger, w, http.StatusOK, result)
}
