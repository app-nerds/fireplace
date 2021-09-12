package pkg

import (
	"github.com/globalsign/mgo/bson"
)

/*
CreateLogEntryRequest is used to create a new log entry.
*/
type CreateLogEntryRequest struct {
	Application string                       `json:"application"`
	Details     LogEntryDetailItemCollection `json:"details"`
	ID          bson.ObjectId
	Level       string `json:"level"`
	Message     string `json:"message"`
	Time        string `json:"time"`
}
