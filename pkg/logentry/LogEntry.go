package logentry

type LogEntry struct {
	Application string                       `json:"application"`
	Details     LogEntryDetailItemCollection `json:"details"`
	Level       string                       `json:"level"`
	Message     string                       `json:"message"`
	Time        string                       `json:"time"`
}

type LogEntryCollection []*LogEntry
