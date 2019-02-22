package logentry

import (
	"time"

	"github.com/globalsign/mgo/bson"
)

type LogEntry struct {
	Application string                       `json:"application" bson:"application"`
	Details     LogEntryDetailItemCollection `json:"details" bson:"details"`
	ID          bson.ObjectId                `json:"id" bson:"_id"`
	Level       string                       `json:"level" bson:"level"`
	Message     string                       `json:"message" bson:"message"`
	Time        time.Time                    `json:"time" bson:"time"`
}

type LogEntryCollection []*LogEntry
