package filters

type LogEntryFilter struct {
	Application string `json:"application"`
	Level       string `json:"level"`
	Page        int    `json:"page"`
	Search      string `json:"search"`
}
