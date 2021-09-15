/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package pkg

import (
	"time"

	"github.com/globalsign/mgo/bson"
)

/*
LogEntry represents a single log entry in Fireplace.
*/
type LogEntry struct {
	Application string                       `json:"application" bson:"application"`
	Details     LogEntryDetailItemCollection `json:"details" bson:"details"`
	ID          bson.ObjectId                `json:"id" bson:"_id"`
	Level       string                       `json:"level" bson:"level"`
	Message     string                       `json:"message" bson:"message"`
	Time        time.Time                    `json:"time" bson:"time"`
}

/*
LogEntryCollection is a collection of LogEntry
*/
type LogEntryCollection []*LogEntry
