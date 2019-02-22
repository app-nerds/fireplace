package logentry

import (
	"github.com/globalsign/mgo/bson"
)

type CreateLogEntryRequest struct {
	Application string                       `json:"application"`
	Details     LogEntryDetailItemCollection `json:"details"`
	ID          bson.ObjectId
	Level       string `json:"level"`
	Message     string `json:"message"`
	Time        string `json:"time"`
}
