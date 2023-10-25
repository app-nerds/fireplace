package fireplaceslog

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/app-nerds/fireplace/v2/pkg"
)

type ConsoleLogFormat int

const (
	TextFormat ConsoleLogFormat = iota
	JSONFormat
)

type HandlerConfig struct {
	Application      string
	ConsoleLogFormat ConsoleLogFormat
	FireplaceURL     string
	Level            slog.Level
	Password         string
}

type FireplaceHandler struct {
	application      string
	consoleLogFormat ConsoleLogFormat
	fireplaceURL     string
	level            slog.Level
	password         string

	attrs []slog.Attr
	group string

	client  *http.Client
	console *slog.Logger
}

func NewFireplaceHandler(config HandlerConfig) *FireplaceHandler {
	result := &FireplaceHandler{
		application:      config.Application,
		consoleLogFormat: config.ConsoleLogFormat,
		fireplaceURL:     config.FireplaceURL,
		level:            config.Level,
		password:         config.Password,

		attrs: []slog.Attr{},
		group: "",

		client: &http.Client{
			Timeout: time.Second * 2,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
			},
		},
		console: slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			AddSource: false,
			Level:     config.Level,
		})),
	}

	return result
}

func (h *FireplaceHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return level >= h.level
}

func (h *FireplaceHandler) Handle(ctx context.Context, r slog.Record) error {
	args := []any{}
	argMap := map[string]string{}

	data := pkg.CreateLogEntryRequest{
		Application: h.application,
		Details:     []*pkg.LogEntryDetailItem{},
		Level:       r.Level.String(),
		Message:     r.Message,
		Time:        r.Time.UTC().Format(time.RFC3339),
	}

	/*
	 * First add logger-configured attributes, then add in
	 * any attributes from the log record.
	 */
	if h.attrs != nil {
		for _, attr := range h.attrs {
			argMap[attr.Key] = attr.Value.String()
		}
	}

	r.Attrs(func(a slog.Attr) bool {
		argMap[a.Key] = a.Value.String()
		return true
	})

	for key, value := range argMap {
		args = append(args, key, value)

		data.Details = append(data.Details, &pkg.LogEntryDetailItem{
			Key:   h.getDetailKey(key),
			Value: value,
		})
	}

	h.console.Log(ctx, r.Level, r.Message, args...)
	return h.send(data)
}

func (h *FireplaceHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	result := &FireplaceHandler{
		application:      h.application,
		fireplaceURL:     h.fireplaceURL,
		level:            h.level,
		password:         h.password,
		attrs:            attrs,
		group:            h.group,
		client:           h.client,
		console:          h.console,
		consoleLogFormat: h.consoleLogFormat,
	}

	return result
}

func (h *FireplaceHandler) WithGroup(name string) slog.Handler {
	result := &FireplaceHandler{
		application:      h.application,
		fireplaceURL:     h.fireplaceURL,
		level:            h.level,
		password:         h.password,
		attrs:            h.attrs,
		group:            name,
		client:           h.client,
		console:          h.console,
		consoleLogFormat: h.consoleLogFormat,
	}

	return result
}

func (h *FireplaceHandler) getDetailKey(key string) string {
	if h.group != "" {
		return h.group + "." + key
	}

	return key
}

func (h *FireplaceHandler) send(entry pkg.CreateLogEntryRequest) error {
	var (
		err       error
		entryJSON []byte
		request   *http.Request
		response  *http.Response
	)

	if entryJSON, err = json.Marshal(entry); err != nil {
		return fmt.Errorf("error converting log entry to JSON: %w", err)
	}

	reader := bytes.NewReader(entryJSON)

	if request, err = http.NewRequest(http.MethodPost, h.fireplaceURL+"/logentry", reader); err != nil {
		return fmt.Errorf("unable to create the HTTP request: %w", err)
	}

	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+h.password)

	if response, err = h.client.Do(request); err != nil {
		return fmt.Errorf("unable to send the log entry: %w", err)
	}

	defer response.Body.Close()
	return nil
}
