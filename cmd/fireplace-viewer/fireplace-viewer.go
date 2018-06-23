//go:generate esc -o ./www/www.go -pkg www -ignore DS_Store|README\.md|LICENSE|www\.go -prefix /www/ ./www
package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/adampresley/fireplace/pkg/logging"
	"github.com/adampresley/logrusviewer/cmd/logrusviewer/www"
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

	httpServer := echo.New()
	httpServer.HideBanner = true
	httpServer.Use(middleware.CORS())

	httpServer.GET("/www/*", echo.WrapHandler(assetHandler))
	httpServer.GET("/", handleMainPage)

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

}
