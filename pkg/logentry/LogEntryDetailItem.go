package logentry

type LogEntryDetailItem struct {
	Key   string `json:"key" bson:"key"`
	Value string `json:"value" bson:"value"`
}

type LogEntryDetailItemCollection []*LogEntryDetailItem
