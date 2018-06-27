//go:generate esc -o ./www/www.go -pkg www -ignore DS_Store|README\.md|LICENSE|www\.go -prefix /www/ ./www
package main

import (
	"context"
	"encoding/json"
	"flag"
	"io/ioutil"
	"net/http"
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
	DEBUG_ASSETS   bool   = true
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
	httpServer.GET("/logentry", getLogEntries)
	httpServer.GET("/logentry/:id", getLogEntry)

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

func getLogEntries(ctx echo.Context) error {
	var err error
	var response *http.Response
	var rawResult []byte

	entries := make(logentry.LogEntryCollection, 0, 100)

	if response, err = fireplaceServerClient.Get(*serverURL + "/logentry"); err != nil {
		logger.WithError(err).Errorf("Error getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries")
	}

	if rawResult, err = ioutil.ReadAll(response.Body); err != nil {
		logger.WithError(err).Errorf("Error reading response body when getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries")
	}

	if err = json.Unmarshal(rawResult, &entries); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entries")
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling log entries")
	}

	return ctx.JSON(http.StatusOK, entries)
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

	if err = json.Unmarshal(rawResult, &entry); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entry %s", id)
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling log entry")
	}

	return ctx.JSON(http.StatusOK, entry)
}
