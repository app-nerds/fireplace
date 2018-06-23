package logentry

import (
	"bytes"
	"encoding/gob"
	"sort"
	"time"

	"github.com/dgraph-io/badger"
	uuid "github.com/nu7hatch/gouuid"
	"github.com/pkg/errors"
)

type LogEntryService struct {
	DB *badger.DB
}

func (s *LogEntryService) generateGUID() string {
	uuid, _ := uuid.NewV4()
	return uuid.String()
}

func (s *LogEntryService) decode(value []byte) (*LogEntry, error) {
	var err error
	var result *LogEntry

	decoder := gob.NewDecoder(bytes.NewReader(value))

	if err = decoder.Decode(&result); err != nil {
		return nil, errors.Wrapf(err, "Unable to decode value")
	}

	return result, nil
}

func (s *LogEntryService) encode(value interface{}) ([]byte, error) {
	var err error
	var result bytes.Buffer

	encoder := gob.NewEncoder(&result)

	if err = encoder.Encode(value); err != nil {
		return nil, errors.Wrapf(err, "Unable to encode value")
	}

	return result.Bytes(), nil
}

func (s *LogEntryService) CreateLogEntry(entry *LogEntry) (string, error) {
	var err error
	var encoded []byte

	id := []byte(s.generateGUID())

	if encoded, err = s.encode(entry); err != nil {
		return "", errors.Wrapf(err, "Error encoding log entry in LogEntryService")
	}

	err = s.DB.Update(func(transaction *badger.Txn) error {
		return transaction.Set(id, encoded)
	})

	if err != nil {
		return "", errors.Wrapf(err, "Error writing log entry to database")
	}

	return string(id), nil
}

func (s *LogEntryService) GetLogEntries() (LogEntryCollection, int, error) {
	var err error
	totalRecords := 0
	result := make(LogEntryCollection, 0, 500)

	err = s.DB.View(func(transaction *badger.Txn) error {
		var err error
		var value []byte

		options := badger.DefaultIteratorOptions
		options.PrefetchSize = 10

		iterator := transaction.NewIterator(options)
		defer iterator.Close()

		for iterator.Rewind(); iterator.Valid(); iterator.Next() {
			var newLogEntry *LogEntry
			item := iterator.Item()

			key := string(item.Key())
			if value, err = item.Value(); err != nil {
				return errors.Wrapf(err, "Error getting value for key %s", key)
			}

			if newLogEntry, err = s.decode(value); err != nil {
				return errors.Wrapf(err, "Unable to decode value for key %s", key)
			}

			totalRecords++
			result = append(result, newLogEntry)
		}

		return nil
	})

	if err != nil {
		return result, 0, errors.Wrapf(err, "Error getting log entries in LogEntryService")
	}

	// TODO: Fix sorting. Still not working
	s.sortLogEntries(result)
	return result, totalRecords, nil
}

func (s *LogEntryService) sortLogEntries(entries LogEntryCollection) {
	sort.Slice(entries, func(i, j int) bool {
		entryTime1, _ := time.Parse(entries[i].Time, time.RFC3339)
		entryTime2, _ := time.Parse(entries[j].Time, time.RFC3339)

		return entryTime1.Before(entryTime2)
	})
}
