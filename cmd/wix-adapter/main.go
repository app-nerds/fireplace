package main

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/app-nerds/frame"
	"github.com/app-nerds/kit/v6/restclient"
)

var Version = "development"

const appName = "fireplace-wix-adapter"

var (
	fireplaceClient restclient.RESTClient
)

type WixLogEntry struct {
	Timestamp        time.Time         `json:"timestamp"`
	ReceiveTimestamp time.Time         `json:"receiveTimestamp"`
	Severity         string            `json:"severity"`
	InsertID         string            `json:"insertId"`
	Labels           WixLabels         `json:"labels"`
	Operation        WixOperation      `json:"operation"`
	SourceLocation   WixSourceLocation `json:"sourceLocation"`
	JSONPayload      WixPayload        `json:"jsonPayload"`
}

type WixLabels struct {
	SiteURL   string `json:"siteUrl"`
	Namespace string `json:"namespace"`
	TenantID  string `json:"tenantId"`
	ViewMode  string `json:"viewMode"`
	Revision  string `json:"revision"`
}

type WixOperation struct {
	ID       string `json:"id"`
	Producer string `json:"producer"`
}

type WixSourceLocation struct {
	File string `json:"file"`
	Line int    `json:"line"`
}

type WixPayload struct {
	Message string `json:"message"`
}

func main() {
	app := frame.NewFrameApplication(appName, Version)
	app.SetupEndpoints(frame.Endpoints{
		frame.Endpoint{Path: "/log", Methods: []string{http.MethodPost}, HandlerFunc: handleLog(app)},
	})

	connectToFireplace(app)

	<-app.Start()
	app.Stop()
}

func handleLog(app *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var (
			err      error
			logEntry WixLogEntry
		)

		if err = app.ReadJSONBody(r, &logEntry); err != nil {
			app.Logger.WithError(err).Error("error unmarshalling log entry body")
			app.WriteJSON(w, http.StatusBadRequest, app.CreateGenericErrorResponse("Error reading log entry body", err.Error(), ""))
			return
		}

		fireplaceLogEntry := convertPayloadToFireplace(logEntry)
		sendLogEntry(app, fireplaceLogEntry)

		app.WriteJSON(w, http.StatusOK, app.CreateGenericSuccessResponse("ok"))
	}
}

func convertPayloadToFireplace(payload WixLogEntry) pkg.LogEntry {
	result := pkg.LogEntry{
		Application: getApplicationName(payload),
		Details:     getDetails(payload),
		Level:       getLevel(payload),
		Message:     payload.JSONPayload.Message,
		Time:        payload.Timestamp,
	}

	return result
}

func getApplicationName(payload WixLogEntry) string {
	stringURL := payload.Labels.SiteURL
	u, err := url.Parse(stringURL)

	if err != nil {
		return stringURL
	}

	return u.Host
}

func getDetails(payload WixLogEntry) pkg.LogEntryDetailItemCollection {
	result := pkg.LogEntryDetailItemCollection{
		{Key: "namespace", Value: payload.Labels.Namespace},
		{Key: "viewMode", Value: payload.Labels.ViewMode},
		{Key: "file", Value: payload.SourceLocation.File},
		{Key: "line", Value: strconv.Itoa(payload.SourceLocation.Line)},
	}

	return result
}

func getLevel(payload WixLogEntry) string {
	switch payload.Severity {
	case "WARNING":
		return "warn"

	case "ERROR":
		return "error"

	default:
		return "info"
	}
}

func connectToFireplace(app *frame.FrameApplication) {
	fireplaceClient = restclient.NewJSONClient(restclient.JSONClientConfig{
		BaseURL:    app.Config.FireplaceURL,
		DebugMode:  false,
		HTTPClient: &restclient.HTTPClient{Client: &http.Client{Timeout: time.Second * 3}},
		Logger:     app.Logger,
	}).WithAuthorization(fmt.Sprintf("Bearer %s", app.Config.FireplacePassword))
}

func sendLogEntry(app *frame.FrameApplication, logEntry pkg.LogEntry) {
	var (
		receiver pkg.GenericResponse
	)
	_, _ = fireplaceClient.POST("/logentry", logEntry, &receiver, &receiver)
}
