package logentry

type GetLogEntriesResponse struct {
	Count      int                `json:"count"`
	LogEntries LogEntryCollection `json:"logEntries"`
	PageSize   int                `json:"pageSize"`
	TotalCount int                `json:"totalCount"`
}
