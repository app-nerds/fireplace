package logentry

type LogEntryDetailItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type LogEntryDetailItemCollection []*LogEntryDetailItem
