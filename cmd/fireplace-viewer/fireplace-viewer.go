//go:generate esc -o ./www.go -pkg main -ignore DS_Store|LICENSE|www\.go|(.*?)\.md|(.*?)\.svg -prefix /www/ ./www
package main

import (
	"context"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"code.appninjas.biz/appninjas/kit/rendering"
	"code.appninjas.biz/appninjas/kit/restclient"
	"github.com/adampresley/fireplace/cmd/fireplace-viewer/configuration"
	"github.com/adampresley/fireplace/pkg/logentry"
	"github.com/adampresley/fireplace/pkg/logging"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
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

	assetHandler := http.FileServer(FS(config.Debug))
	renderer := rendering.NewRenderer(logger)

	renderer.AddTemplates(
		&rendering.Template{
			Name:        "main",
			PageContent: FSMustString(config.Debug, "/www/fireplace-viewer/pages/main.gohtml"),
		},
	)

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())
	httpServer.Renderer = renderer

	httpServer.GET("/www/*", echo.WrapHandler(assetHandler))
	httpServer.GET("/", handleMainPage)

	httpServer.GET("/logentry", getLogEntries)
	httpServer.GET("/logentry/:id", getLogEntry)
	httpServer.DELETE("/logentry", delete)
	httpServer.GET("/applicationname", getApplicationNames)

	go func() {
		var err error

		logger.WithFields(logrus.Fields{
			"host":          config.Host,
			"serverVersion": config.ServerVersion,
			"debug":         config.Debug,
			"logLevel":      config.LogLevel,
		}).Infof("Starting Fireplace Viewer")

		if err = httpServer.Start(config.Host); err != nil {
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
	viewModel := struct {
		Title string
	}{
		Title: "Home",
	}

	return ctx.Render(http.StatusOK, "main", viewModel)
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
