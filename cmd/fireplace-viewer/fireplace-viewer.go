//go:generate esc -o ./www/www.go -pkg www -ignore DS_Store|README\.md|LICENSE|www\.go -prefix /www/ ./www
package main

import (
	"context"
	"encoding/json"
	"flag"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/adampresley/fireplace/cmd/fireplace-viewer/www"
	"github.com/adampresley/fireplace/pkg/logentry"
	"github.com/adampresley/fireplace/pkg/logging"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/sirupsen/logrus"
)

const (
	SERVER_VERSION string = "0.1.0"
	DEBUG_ASSETS   bool   = false
)

var logLevel = flag.String("loglevel", "info", "Level of logs to write. Valid values are 'debug', 'info', or 'error'. Default is 'info'")
var host = flag.String("host", "0.0.0.0:8090", "Address and port to bind this server to")
var serverURL = flag.String("serverurl", "http://0.0.0.0:8999", "Full HTTP address to a Fireplace Server instance")

var logger *logrus.Entry
var fireplaceServerClient *http.Client

func main() {
	var err error

	flag.Parse()
	logger = logging.GetLogger(*logLevel, "Fireplace Viewer")

	/*
	 * Setup fireplace server HTTP client
	 */
	fireplaceServerClient = &http.Client{}
	assetHandler := http.FileServer(www.FS(DEBUG_ASSETS))
	renderer := NewTemplateRenderer(DEBUG_ASSETS)

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())

	httpServer.Renderer = renderer

	httpServer.GET("/www/*", echo.WrapHandler(assetHandler))
	httpServer.GET("/", handleMainPage)
	httpServer.GET("/deleteoldentries", handleDeleteOldEntriesPage)
	httpServer.GET("/logentry", getLogEntries)
	httpServer.GET("/logentry/:id", getLogEntry)
	httpServer.DELETE("/logentry", delete)
	httpServer.GET("/applicationname", getApplicationNames)

	go func() {
		var err error

		logger.WithField("host", *host).Infof("Starting Fireplace Viewer v%s", SERVER_VERSION)

		if err = httpServer.Start(*host); err != nil {
			if err != http.ErrServerClosed {
				logger.WithError(err).Fatalf("Unable to start application")
			} else {
				logger.Infof("Shutting down the server...")
			}
		}
	}()

	/*
	 * Setup shutdown handler
	 */
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt, syscall.SIGQUIT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = httpServer.Shutdown(ctx); err != nil {
		logger.Errorf("There was an error shutting down the server - %s", err.Error())
	}
}

func handleMainPage(ctx echo.Context) error {
	var viewState = map[string]interface{}{
		"Title": "Home",
	}

	return ctx.Render(http.StatusOK, "mainLayout:main-page", viewState)
}

func handleDeleteOldEntriesPage(ctx echo.Context) error {
	var viewState = map[string]interface{}{
		"Title": "Delete Old Entries",
	}

	return ctx.Render(http.StatusOK, "mainLayout:delete-old-entries", viewState)
}

func getApplicationNames(ctx echo.Context) error {
	var err error
	var response *http.Response
	var rawResult []byte
	var applicationNames []string

	if response, err = fireplaceServerClient.Get(*serverURL + "/applicationname"); err != nil {
		logger.WithError(err).Errorf("Error getting application names")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	if rawResult, err = ioutil.ReadAll(response.Body); err != nil {
		logger.WithError(err).Errorf("Error reading response body when getting application names")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	if response.StatusCode != 200 {
		logger.WithField("result", string(rawResult)).Errorf("Error getting application names from Fireplace server")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	if err = json.Unmarshal(rawResult, &applicationNames); err != nil {
		logger.WithError(err).WithField("result", string(rawResult)).Errorf("Error unmarshalling application names")
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling application names")
	}

	return ctx.JSON(http.StatusOK, applicationNames)
}

func getLogEntries(ctx echo.Context) error {
	var err error
	var response *http.Response
	var rawResult []byte
	var serverResponse *logentry.GetLogEntriesResponse

	endpoint := *serverURL + "/logentry?page=" + ctx.QueryParam("page") +
		"&search=" + url.QueryEscape(ctx.QueryParam("search")) +
		"&application=" + url.QueryEscape(ctx.QueryParam("application")) +
		"&level=" + url.QueryEscape(ctx.QueryParam("level"))

	if response, err = fireplaceServerClient.Get(endpoint); err != nil {
		logger.WithError(err).Errorf("Error getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries")
	}

	if rawResult, err = ioutil.ReadAll(response.Body); err != nil {
		logger.WithError(err).Errorf("Error reading response body when getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries")
	}

	if response.StatusCode != 200 {
		logger.WithField("result", string(rawResult)).Errorf("Error getting log entries from Fireplace server")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries")
	}

	if err = json.Unmarshal(rawResult, &serverResponse); err != nil {
		logger.WithError(err).WithField("result", string(rawResult)).Errorf("Error unmarshalling log entries")
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling log entries")
	}

	return ctx.JSON(http.StatusOK, serverResponse)
}

func getLogEntry(ctx echo.Context) error {
	var err error
	var response *http.Response
	var rawResult []byte

	entry := &logentry.LogEntry{}
	id := ctx.Param("id")

	if response, err = fireplaceServerClient.Get(*serverURL + "/logentry/" + id); err != nil {
		logger.WithError(err).Errorf("Error getting log entry %s", id)
		return ctx.String(http.StatusInternalServerError, "Error getting log entry "+id)
	}

	if rawResult, err = ioutil.ReadAll(response.Body); err != nil {
		logger.WithError(err).Errorf("Error reading response body when getting log entry %s", id)
		return ctx.String(http.StatusInternalServerError, "Error getting log entry")
	}

	if response.StatusCode != http.StatusOK {
		return ctx.String(http.StatusInternalServerError, string(rawResult))
	}

	if err = json.Unmarshal(rawResult, &entry); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entry %s", id)
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling log entry")
	}

	return ctx.JSON(http.StatusOK, entry)
}

func delete(ctx echo.Context) error {
	var err error
	var request *http.Request
	var response *http.Response
	var rawResult []byte

	fromDate := ctx.QueryParam("fromDate")

	if request, err = http.NewRequest("DELETE", *serverURL+"/logentry?fromDate="+fromDate, nil); err != nil {
		logger.WithError(err).Errorf("Error creating DELETE request")
		return ctx.String(http.StatusInternalServerError, "Error creating delete request")
	}

	if response, err = fireplaceServerClient.Do(request); err != nil {
		logger.WithError(err).Errorf("Error asking Fireplace server to delete log entries")
		return ctx.String(http.StatusInternalServerError, "Error asking Fireplace server to delete log entries")
	}

	if rawResult, err = ioutil.ReadAll(response.Body); err != nil {
		logger.WithError(err).WithField("result", string(rawResult)).Errorf("Error reading response body")
		return ctx.String(http.StatusInternalServerError, "Error reading response body")
	}

	if response.StatusCode != http.StatusOK {
		return ctx.String(http.StatusInternalServerError, string(rawResult))
	}

	return ctx.String(http.StatusOK, string(rawResult))
}
