package internal

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

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
	db     *mongo.Database
}

/*
NewLogEntryService creates a new LogEntryService
*/
func NewLogEntryService(config Config, db *mongo.Database) LogEntryService {
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

	id := primitive.NewObjectID()

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

	c := s.db.Collection(DatabaseCollection)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if _, err = c.InsertOne(ctx, entry); err != nil {
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
		values []interface{}
	)

	result := make([]string, 0, 20)

	c := s.db.Collection(DatabaseCollection)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if values, err = c.Distinct(ctx, "application", bson.D{}); err != nil {
		return result, fmt.Errorf("error querying for application names in GetApplicationNames: %w", err)
	}

	for _, value := range values {
		stringValue, _ := value.(string)
		result = append(result, stringValue)
	}

	return result, nil
}

/*
GetLogEntries returns a collection of log entries that match a search criteria.
*/
func (s LogEntryService) GetLogEntries(filter pkg.LogEntryFilter) (pkg.LogEntryCollection, int, error) {
	var (
		err        error
		totalCount int64
		cursor     *mongo.Cursor
	)

	result := make(pkg.LogEntryCollection, 0, 500)

	c := s.db.Collection(DatabaseCollection)
	query := s.buildQueryFromFilters(filter)
	opts := options.Find().SetSort(bson.D{{"time", -1}})

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if totalCount, err = c.CountDocuments(ctx, query); err != nil {
		return result, 0, fmt.Errorf("error getting total count of records in GetLogEntries(): %w", err)
	}

	if filter.Page > 0 {
		skip := (filter.Page - 1) * s.config.PageSize
		opts = opts.SetSkip(int64(skip)).SetLimit(int64(s.config.PageSize))
	}

	if cursor, err = c.Find(ctx, query, opts); err != nil {
		return result, 0, fmt.Errorf("error querying for log entries in GetLogEntries(): %w", err)
	}

	index := 0

	for cursor.Next(ctx) {
		logEntry := &pkg.LogEntry{}

		if err = cursor.Decode(&logEntry); err != nil {
			return result, 0, fmt.Errorf("error getting log entry at index %d: %w", index, err)
		}

		result = append(result, logEntry)
		index++
	}

	return result, int(totalCount), nil
}

/*
GetLogEntry retrieves a single log entry by ID.
*/
func (s LogEntryService) GetLogEntry(id string) (pkg.LogEntry, error) {
	var (
		err    error
		bsonID primitive.ObjectID
	)

	result := pkg.LogEntry{}

	if bsonID, err = primitive.ObjectIDFromHex(id); err != nil {
		return result, fmt.Errorf("invalid log entry ID '%s': %w", id, err)
	}

	c := s.db.Collection(DatabaseCollection)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	response := c.FindOne(ctx, bson.D{{"_id", bsonID}})

	if response.Err() != nil && errors.Is(response.Err(), mongo.ErrNoDocuments) {
		return result, mongo.ErrNoDocuments
	}

	if response.Err() != nil {
		return result, fmt.Errorf("error getting log entry in GetLogEntry: %w", response.Err())
	}

	if err = response.Decode(&result); err != nil {
		return result, fmt.Errorf("error decoding log entry '%s' in GetLogEntry: %w", id, err)
	}

	return result, nil
}

func (s LogEntryService) buildQueryFromFilters(filter pkg.LogEntryFilter) bson.D {
	query := bson.D{}

	if filter.Application != "" {
		query = append(query, bson.E{Key: "application", Value: filter.Application})
	}

	if filter.Level != "" {
		query = append(query, bson.E{Key: "level", Value: filter.Level})
	}

	if filter.Search != "" {
		or := bson.A{
			bson.D{{"message", bson.M{"$regex": filter.Search, "$options": "im"}}},
			bson.D{{"details.value", bson.M{"$regex": filter.Search, "$options": "im"}}},
			bson.D{{"details.key", bson.M{"$regex": filter.Search, "$options": "im"}}},
		}

		query = append(query, bson.E{Key: "$or", Value: or})
	}

	// Searching by BOTH dates/times
	if !filter.DateFrom.IsZero() && !filter.DateTo.IsZero() {
		query = append(query, bson.E{
			Key:   "time",
			Value: bson.M{"$gte": primitive.NewDateTimeFromTime(filter.DateFrom)},
		})

		query = append(query, bson.E{
			Key:   "time",
			Value: bson.M{"$lt": primitive.NewDateTimeFromTime(filter.DateTo)},
		})
	} else if !filter.DateFrom.IsZero() {
		query = append(query, bson.E{
			Key:   "time",
			Value: bson.M{"$gte": primitive.NewDateTimeFromTime(filter.DateFrom)},
		})
	} else if !filter.DateTo.IsZero() {
		query = append(query, bson.E{
			Key:   "time",
			Value: bson.M{"$lt": primitive.NewDateTimeFromTime(filter.DateTo)},
		})
	}

	return query
}

/*
Delete removes log entries that are prior to the provided date/time.
*/
func (s LogEntryService) Delete(fromDate time.Time) (int, error) {
	var (
		err    error
		result *mongo.DeleteResult
	)

	query := bson.D{{"time", bson.D{{"$lt", fromDate}}}}

	c := s.db.Collection(DatabaseCollection)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	if result, err = c.DeleteMany(ctx, query); err != nil {
		return 0, fmt.Errorf("error deleting log entries from '%v': %w", fromDate, err)
	}

	return int(result.DeletedCount), err
}
