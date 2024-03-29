/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package pkg

/*
GetLogEntriesResponse is returned when a client searches for log entries.
*/
type GetLogEntriesResponse struct {
	Count      int                `json:"count"`
	LogEntries LogEntryCollection `json:"logEntries"`
	PageSize   int                `json:"pageSize"`
	TotalCount int                `json:"totalCount"`
}
