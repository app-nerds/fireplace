package logentry

import (
	"time"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	"github.com/adampresley/fireplace/pkg/filters"
	"github.com/pkg/errors"
)

type LogEntryService struct {
	DB       *mgo.Database
	PageSize int
}

func (s *LogEntryService) CreateLogEntry(entryRequest *CreateLogEntryRequest) (string, error) {
	var err error
	var t time.Time

	id := bson.NewObjectId()

	if t, err = time.Parse(time.RFC3339, entryRequest.Time); err != nil {
		return "", errors.Wrapf(err, "Error parsing time in create log entry request")
	}

	entry := &LogEntry{
		Application: entryRequest.Application,
		Details:     entryRequest.Details,
		ID:          id,
		Level:       entryRequest.Level,
		Message:     entryRequest.Message,
		Time:        t,
	}

	if err = s.DB.C("logentries").Insert(entry); err != nil {
		return "", errors.Wrapf(err, "Error writing log entry to database")
	}

	return id.Hex(), nil
}

func (s *LogEntryService) GetLogEntries(filter *filters.LogEntryFilter) (LogEntryCollection, int, error) {
	var err error
	var totalCount int
	result := make(LogEntryCollection, 0, 500)

	query := s.buildQueryFromFilters(filter)
	recordSet := s.DB.C("logentries").Find(query).Sort("-time")

	if totalCount, err = recordSet.Count(); err != nil {
		return result, 0, errors.Wrapf(err, "Error getting total count of records in GetLogEntries")
	}

	if filter.Page > 0 {
		skip := (filter.Page - 1) * s.PageSize
		recordSet.Skip(skip).Limit(s.PageSize)
	}

	if err = recordSet.All(&result); err != nil {
		return result, 0, errors.Wrapf(err, "Error getting log entries in LogEntryService")
	}

	return result, totalCount, nil
}

func (s *LogEntryService) GetLogEntry(id string) (*LogEntry, error) {
	var err error
	result := &LogEntry{}

	if err = s.DB.C("logentries").FindId(bson.ObjectIdHex(id)).One(&result); err != nil {
		return result, errors.Wrapf(err, "Error getting log entry in LogEntryService for ID %s", id)
	}

	return result, nil
}

func (s *LogEntryService) buildQueryFromFilters(filter *filters.LogEntryFilter) bson.M {
	query := bson.M{}

	if filter.Application != "" {
		query["application"] = filter.Application
	}

	if filter.Level != "" {
		query["level"] = filter.Level
	}

	if filter.Search != "" {
		query["$or"] = bson.D{
			bson.DocElem{Name: "message", Value: bson.M{"$regex": "/" + filter.Search + "/i"}},
			bson.DocElem{Name: "details", Value: filter.Search},
		}
	}

	return query
}
