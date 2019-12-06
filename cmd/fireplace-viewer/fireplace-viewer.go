/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */

//go:generate esc -o ./frontend.go -pkg main -ignore "DS_Store|LICENSE|www\.go|(.*?)\.md|(.*?)\.svg|(.*?)\.html" -prefix /app/ ./app
package main

import (
	"context"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/app-nerds/kit/v4/rendering"
	"github.com/app-nerds/kit/v4/restclient"
	"github.com/app-nerds/fireplace/cmd/fireplace-viewer/configuration"
	"github.com/app-nerds/fireplace/pkg/logentry"
	"github.com/app-nerds/fireplace/pkg/logging"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/sirupsen/logrus"
)

var logger *logrus.Entry
var fireplaceClient IFireplaceClient

func main() {
	var err error
	config := configuration.NewConfig("0.3.0")

	logger = logging.GetLogger(config.LogLevel, "Fireplace Viewer")

	/*
	 * Setup fireplace server HTTP client
	 */
	fireplaceClient = &FireplaceClient{
		IRestClient: &restclient.RestClient{
			BaseURL:    config.FireplaceServerURL,
			HTTPClient: &http.Client{},
		},
	}

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())

	if config.Debug {
		logger.Debug("Serving static assets from the filesystem")
		httpServer.Static("/app", "app")
	} else {
		logger.Debug("Service static assets from the binary")
		httpServer.GET("/app/*", echo.WrapHandler(http.FileServer(FS(config.Debug))))
	}

	httpServer.GET("/", handleMainPage)
	httpServer.GET("/logentry", getLogEntries)
	httpServer.GET("/logentry/:id", getLogEntry)
	httpServer.DELETE("/logentry", delete)
	httpServer.GET("/applicationname", getApplicationNames)

	go func() {
		var err error

		logger.WithFields(logrus.Fields{
			"serverVersion": config.ServerVersion,
			"debug":         config.Debug,
			"logLevel":      config.LogLevel,
		}).Infof("Starting Fireplace Viewer")

		if err = httpServer.Start("127.0.0.1:0"); err != nil {
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
		logger.WithError(err).Errorf("There was an error shutting down the server")
	}
}

func handleMainPage(ctx echo.Context) error {
	return ctx.HTML(http.StatusOK, `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<title>Fireplace</title>

	<link rel="shortcut icon" href="/app/assets/fireplace-viewer/images/fire_pit.ico" />
	<link rel="stylesheet" type="text/css" href="/app/assets/bootstrap/css/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="/app/assets/fireplace-viewer/css/styles.css" />
	<link rel="stylesheet" type="text/css" href="/app/assets/vue-loading-overlay/vue-loading-overlay.css" />
	<link rel="stylesheet" type="text/css" href="/app/assets/fontawesome/css/all.min.css" />
	<link rel="stylesheet" type="text/css" href="/app/assets/syncfusion/bootstrap4.css" />
</head>

<body>
	<div id="app"></div>

	<script src="/app/assets/babel/babel.min.js"></script>
	<script src="/app/assets/moment/moment.min.js"></script>
	<script src="/app/assets/vue/vue-2.6.10.js"></script>
	<script src="/app/assets/vuejs-datepicker/vuejs-datepicker.min.js"></script>
	<script src="/app/assets/vue-router/vue-router-3.1.3.min.js"></script>
	<script src="/app/assets/vuex/vuex-3.1.1.min.js"></script>
	<script src="/app/assets/vue-resource/vue-resource-1.5.1.min.js"></script>
	<script src="/app/assets/jquery/jquery-3.3.1.min.js"></script>
	<script src="/app/assets/popper/popper.min.js"></script>
	<script src="/app/assets/bootstrap/js/bootstrap.min.js"></script>
	<script src="/app/assets/vue-loading-overlay/vue-loading-overlay.js"></script>
	<script src="/app/assets/syncfusion/ej2-vue.min.js"></script>

	<script src="/app/main.js" type="module"></script>
	</body>
</html>
`
}

func getApplicationNames(ctx echo.Context) error {
	var err error
	var response *http.Response
	var applicationNames []string

	if response, err = fireplaceClient.GET("/applicationname", restclient.EmptyHTTPParameters); err != nil {
		logger.WithError(err).Errorf("Error getting application names")
		return ctx.String(http.StatusInternalServerError, "Error getting application names")
	}

	if err = fireplaceClient.GetResponseJSON(response, &applicationNames); err != nil {
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling application names")
	}

	return ctx.JSON(http.StatusOK, applicationNames)
}

func getLogEntries(ctx echo.Context) error {
	var err error
	var response *http.Response
	var logEntries *logentry.GetLogEntriesResponse

	parameters := restclient.HTTPParameters{
		"page":        ctx.QueryParam("page"),
		"search":      url.QueryEscape(ctx.QueryParam("search")),
		"application": url.QueryEscape(ctx.QueryParam("application")),
		"level":       url.QueryEscape(ctx.QueryParam("level")),
	}

	if response, err = fireplaceClient.GET("/logentry", parameters); err != nil {
		logger.WithError(err).Errorf("Error getting log entries")
		return ctx.String(http.StatusInternalServerError, "Error getting log entries")
	}

	if err = fireplaceClient.GetResponseJSON(response, &logEntries); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entries")
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling log entries")
	}

	return ctx.JSON(http.StatusOK, logEntries)
}

func getLogEntry(ctx echo.Context) error {
	var err error
	var response *http.Response
	entry := &logentry.LogEntry{}
	id := ctx.Param("id")

	if response, err = fireplaceClient.GET("/logentry/"+id, restclient.EmptyHTTPParameters); err != nil {
		logger.WithError(err).Errorf("Error getting log entry %s", id)
		return ctx.String(http.StatusInternalServerError, "Error getting log entry "+id)
	}

	if err = fireplaceClient.GetResponseJSON(response, &entry); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entry %s", id)
		return ctx.String(http.StatusInternalServerError, "Error unmarshalling log entry")
	}

	return ctx.JSON(http.StatusOK, entry)
}

func delete(ctx echo.Context) error {
	var err error
	var response *http.Response

	parameters := restclient.HTTPParameters{
		"fromDate": ctx.QueryParam("fromDate"),
	}

	if response, err = fireplaceClient.DELETE("/logentry", parameters); err != nil {
		logger.WithError(err).Errorf("Error asking Fireplace server to delete log entries")
		return ctx.String(http.StatusInternalServerError, "Error asking Fireplace server to delete log entries")
	}

	return ctx.String(http.StatusOK, fireplaceClient.GetResponseString(response))
}
