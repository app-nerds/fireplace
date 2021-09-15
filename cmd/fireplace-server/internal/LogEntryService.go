package internal

import (
	"fmt"
	"time"

	"github.com/app-nerds/kit/v5/database"
	"github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"

	"github.com/app-nerds/fireplace/v2/pkg"
)

/*
ILogEntryService describes methods for working with log entries in Fireplace
*/
type ILogEntryService interface {
	/*
	   CreateLogEntry creates a new log entry in the database
	*/
	CreateLogEntry(entryRequest pkg.CreateLogEntryRequest) (string, error)

	/*
	   GetApplicationNames retrieves a slice of strings that is a list of
	   application names. Every time a client writes a log to Fireplace
	   it provides the name of the application it came from. This result
	   is a unique list of those applications.
	*/
	GetApplicationNames() ([]string, error)

	/*
	   GetLogEntries returns a collection of log entries that match a search criteria.
	*/
	GetLogEntries(filter pkg.LogEntryFilter) (pkg.LogEntryCollection, int, error)

	/*
	   GetLogEntry retrieves a single log entry by ID.
	*/
	GetLogEntry(id string) (pkg.LogEntry, error)

	/*
	   Delete removes log entries that are prior to the provided date/time.
	*/
	Delete(fromDate time.Time) (int, error)
}

/*
LogEntryService provides methods for working with log entries in Fireplace
*/
type LogEntryService struct {
	config Config
	db     database.Database
}

/*
NewLogEntryService creates a new LogEntryService
*/
func NewLogEntryService(config Config, db database.Database) LogEntryService {
	return LogEntryService{
		config: config,
		db:     db,
	}
}

/*
CreateLogEntry creates a new log entry in the database
*/
func (s LogEntryService) CreateLogEntry(entryRequest pkg.CreateLogEntryRequest) (string, error) {
	var (
		err error
		t   time.Time
	)

	id := bson.NewObjectId()

	if t, err = time.Parse(time.RFC3339, entryRequest.Time); err != nil {
		return "", fmt.Errorf("error parsing time in create log entry request: %w", err)
	}

	entry := pkg.LogEntry{
		Application: entryRequest.Application,
		Details:     entryRequest.Details,
		ID:          id,
		Level:       entryRequest.Level,
		Message:     entryRequest.Message,
		Time:        t,
	}

	if err = s.db.C(DatabaseCollection).Insert(entry); err != nil {
		return "", fmt.Errorf("error writing log entry to database in CreateLogEntry: %w", err)
	}

	return id.Hex(), nil
}

/*
GetApplicationNames retrieves a slice of strings that is a list of
application names. Every time a client writes a log to Fireplace
it provides the name of the application it came from. This result
is a unique list of those applications.
*/
func (s LogEntryService) GetApplicationNames() ([]string, error) {
	var (
		err    error
		ok     bool
		values []struct {
			Application string `json:"application" bson:"application"`
		}
	)

	result := make([]string, 0, 20)
	seen := make(map[string]bool)

	if s.db.C(DatabaseCollection).Find(nil).Select(bson.M{"application": 1}).Sort("application").All(&values); err != nil {
		return result, fmt.Errorf("error querying for application names in GetApplicationNames: %w", err)
	}

	for _, value := range values {
		if _, ok = seen[value.Application]; !ok {
			result = append(result, value.Application)
			seen[value.Application] = true
		}
	}

	return result, nil
}

/*
GetLogEntries returns a collection of log entries that match a search criteria.
*/
func (s LogEntryService) GetLogEntries(filter pkg.LogEntryFilter) (pkg.LogEntryCollection, int, error) {
	var (
		err        error
		totalCount int
	)

	result := make(pkg.LogEntryCollection, 0, 500)

	query := s.buildQueryFromFilters(filter)
	recordSet := s.db.C(DatabaseCollection).Find(query).Sort("-time")

	if totalCount, err = recordSet.Count(); err != nil {
		return result, 0, fmt.Errorf("error getting total count of records in GetLogEntries: %w", err)
	}

	if filter.Page > 0 {
		skip := (filter.Page - 1) * s.config.PageSize
		recordSet.Skip(skip).Limit(s.config.PageSize)
	}

	if err = recordSet.All(&result); err != nil {
		return result, 0, fmt.Errorf("error getting log entries in LogEntryService: %w", err)
	}

	return result, totalCount, nil
}

/*
GetLogEntry retrieves a single log entry by ID.
*/
func (s LogEntryService) GetLogEntry(id string) (pkg.LogEntry, error) {
	var err error
	result := pkg.LogEntry{}

	if err = s.db.C(DatabaseCollection).FindId(bson.ObjectIdHex(id)).One(&result); err != nil {
		return result, fmt.Errorf("error getting log entry in LogEntryService for ID %s: %w", id, err)
	}

	return result, nil
}

func (s LogEntryService) buildQueryFromFilters(filter pkg.LogEntryFilter) bson.M {
	query := bson.M{}

	if filter.Application != "" {
		query["application"] = filter.Application
	}

	if filter.Level != "" {
		query["level"] = filter.Level
	}

	if filter.Search != "" {
		query["$or"] = []bson.M{
			bson.M{"message": bson.RegEx{filter.Search, "i"}},
			bson.M{"details": filter.Search},
		}
	}

	return query
}

/*
Delete removes log entries that are prior to the provided date/time.
*/
func (s LogEntryService) Delete(fromDate time.Time) (int, error) {
	var err error
	var changeInfo *mgo.ChangeInfo

	query := bson.M{
		"time": bson.M{"$lt": fromDate},
	}

	changeInfo, err = s.db.C(DatabaseCollection).RemoveAll(query)
	return changeInfo.Removed, err
}
