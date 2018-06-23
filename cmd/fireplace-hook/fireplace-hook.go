package fireplacehook

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/adampresley/fireplace/pkg/logentry"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

type FireplaceHookConfig struct {
	Application  string
	FireplaceURL string
}

type FireplaceHook struct {
	client *http.Client
	config *FireplaceHookConfig
}

func NewFireplaceHook(config *FireplaceHookConfig) *FireplaceHook {
	return &FireplaceHook{
		client: &http.Client{},
		config: config,
	}
}

func (h *FireplaceHook) Fire(entry *logrus.Entry) error {
	var err error

	fmt.Printf("We are here\n")

	data := &logentry.LogEntry{
		Application: h.config.Application,
		Level:       entry.Level.String(),
		Time:        entry.Time.UTC().Format(time.RFC3339),
		Message:     entry.Message,
		Details:     make(logentry.LogEntryDetailItemCollection, 0, 10),
	}

	for key, value := range entry.Data {
		if errorData, isError := value.(error); logrus.ErrorKey == key && value != nil && isError {
			data.Details = append(data.Details, &logentry.LogEntryDetailItem{
				Key:   key,
				Value: errorData.Error(),
			})
		} else {
			data.Details = append(data.Details, &logentry.LogEntryDetailItem{
				Key:   key,
				Value: fmt.Sprintf("%v", value),
			})
		}
	}

	if err = h.send(data); err != nil {
		fmt.Printf("%s\n", err.Error())
		return errors.Wrapf(err, "Unable to write logrus entry in hook Fireplace Hook")
	}

	return nil
}

func (h *FireplaceHook) Levels() []logrus.Level {
	return []logrus.Level{
		logrus.PanicLevel,
		logrus.FatalLevel,
		logrus.ErrorLevel,
		logrus.WarnLevel,
		logrus.InfoLevel,
		logrus.DebugLevel,
	}
}

func (h *FireplaceHook) send(entry *logentry.LogEntry) error {
	var err error
	var entryJSON []byte

	if entryJSON, err = json.Marshal(entry); err != nil {
		return errors.Wrapf(err, "Error converting log entry to JSON")
	}

	reader := bytes.NewReader(entryJSON)

	if _, err = h.client.Post(h.config.FireplaceURL+"/logentry", "application/json", reader); err != nil {
		return errors.Wrapf(err, "Error sending log entry to Fireplace Server")
	}

	return nil
}
