package logentry

import (
	"gopkg.in/mgo.v2/bson"
)

type CreateLogEntryRequest struct {
	Application string                       `json:"application"`
	Details     LogEntryDetailItemCollection `json:"details"`
	ID          bson.ObjectId
	Level       string `json:"level"`
	Message     string `json:"message"`
	Time        string `json:"time"`
}
