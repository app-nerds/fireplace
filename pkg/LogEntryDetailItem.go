/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package pkg

/*
LogEntryDetailItem is a key/value pair
*/
type LogEntryDetailItem struct {
	Key   string `json:"key" bson:"key"`
	Value string `json:"value" bson:"value"`
}

/*
LogEntryDetailItemCollection is a collection of key/value pairs.
*/
type LogEntryDetailItemCollection []*LogEntryDetailItem
