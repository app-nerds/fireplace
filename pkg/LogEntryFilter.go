/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package pkg

/*
LogEntryFilter provides a way to filter log entries when searching.
*/
type LogEntryFilter struct {
	Application string `json:"application"`
	Level       string `json:"level"`
	Page        int    `json:"page"`
	Search      string `json:"search"`
}
