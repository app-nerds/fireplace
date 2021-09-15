package fireplacehook

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

/*
FireplaceHookConfig is used to configure a new Fireplace
Hook.
*/
type FireplaceHookConfig struct {
	Application  string
	FireplaceURL string
}

/*
FireplaceHook provides the ability to log to a Fireplace Server
from Logrus.
*/
type FireplaceHook struct {
	client *http.Client
	config *FireplaceHookConfig
}

/*
NewFireplaceHook creates a new Logrus hook that connects
to a Fireplace Server.
*/
func NewFireplaceHook(config *FireplaceHookConfig) *FireplaceHook {
	return &FireplaceHook{
		client: &http.Client{Timeout: time.Second * 2},
		config: config,
	}
}

/*
Fire is called when a lot entry is written. This happens automatically
for Logrus.
*/
func (h *FireplaceHook) Fire(entry *logrus.Entry) error {
	var err error

	data := &pkg.CreateLogEntryRequest{
		Application: h.config.Application,
		Level:       entry.Level.String(),
		Time:        entry.Time.UTC().Format(time.RFC3339),
		Message:     entry.Message,
		Details:     make(pkg.LogEntryDetailItemCollection, 0, 10),
	}

	for key, value := range entry.Data {
		if errorData, isError := value.(error); logrus.ErrorKey == key && value != nil && isError {
			data.Details = append(data.Details, &pkg.LogEntryDetailItem{
				Key:   key,
				Value: errorData.Error(),
			})
		} else {
			data.Details = append(data.Details, &pkg.LogEntryDetailItem{
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

/*
Levels returns a slice of all valid log levels
*/
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

func (h *FireplaceHook) send(entry *pkg.CreateLogEntryRequest) error {
	var err error
	var entryJSON []byte
	var response *http.Response

	if entryJSON, err = json.Marshal(entry); err != nil {
		return errors.Wrapf(err, "Error converting log entry to JSON")
	}

	reader := bytes.NewReader(entryJSON)

	if response, err = h.client.Post(h.config.FireplaceURL+"/logentry", "application/json", reader); err != nil {
		return errors.Wrapf(err, "Error sending log entry to Fireplace Server")
	}

	defer response.Body.Close()
	return nil
}
