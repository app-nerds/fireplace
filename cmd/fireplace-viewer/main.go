/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */

package main

import (
	"context"
	"embed"
	"io"
	"io/fs"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/app-nerds/fireplace-viewer/configuration"
	"github.com/app-nerds/kit/v4/restclient"
	"github.com/app-nerds/nerdweb"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"

	"github.com/app-nerds/fireplace/api/logentry/logentry_models"
)

var (
	Version         string = "development"
	logger          *logrus.Entry
	fireplaceClient IFireplaceClient

	//go:embed app
	appFs embed.FS

	//go:embed app/index.html
	indexHTML []byte

	//go:embed app/main.js
	mainJS []byte
)

func main() {
	var err error

	config := configuration.NewConfig(Version)

	logger = logrus.New().WithField("who", "Fireplace Viewer")
	logger.WithFields(logrus.Fields{
		"version":      config.ServerVersion,
		"host":         config.Host,
		"fireplaceurl": config.FireplaceServerURL,
	}).Info("Welcome to Fireplace Viewer!")

	/*
	 * Setup fireplace server HTTP client
	 */
	fireplaceClient = &FireplaceClient{
		IRestClient: &restclient.RestClient{
			BaseURL:    config.FireplaceServerURL,
			HTTPClient: &http.Client{},
		},
	}

	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))
	staticFS := http.FileServer(getClientAppFileSystem(Version == "development"))

	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/logentry", getLogEntries).Methods(http.MethodGet)
	apiRouter.HandleFunc("/logentry/{id}", getLogEntry).Methods(http.MethodGet)
	apiRouter.HandleFunc("/logentry", deleteLogEntries).Methods(http.MethodDelete)

	apiRouter.HandleFunc("/applicationname", getApplicationNames).Methods(http.MethodGet)
	router.PathPrefix("/static/").Handler(staticFS).Methods(http.MethodGet)
	router.HandleFunc(`/{path:[a-zA-Z0-9\-_\/\.]*}`, rootHandler)

	server := &http.Server{
		Addr:         config.Host,
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 30,
		IdleTimeout:  time.Second * 60,
		Handler:      router,
	}

	go func() {
		var err error

		logger.Infof("Starting Fireplace Viewer")

		if err = server.ListenAndServe(); err != nil {
			if err != http.ErrServerClosed {
				logger.WithError(err).Fatal("Unable to start application")
			} else {
				logger.Info("Shutting down the server...")
			}
		}
	}()

	/*
	 * Setup shutdown handler
	 */
	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt, syscall.SIGQUIT, syscall.SIGTERM, syscall.SIGINT, syscall.SIGHUP)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = server.Shutdown(ctx); err != nil {
		logger.WithError(err).Error("There was an error shutting down the server")
	}

	logger.Info("Server shutdown")
	os.Exit(0)
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch path {
	case "/main.js":
		w.Header().Set("Content-Type", "text/javascript")
		_, _ = w.Write(getFile("main.js"))

	default:
		if strings.Index(path, ".") > -1 {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		_, _ = w.Write(getFile("index.html"))
	}
}

func getApplicationNames(w http.ResponseWriter, r *http.Request) {
	var (
		err              error
		response         *http.Response
		applicationNames []string
	)

	if response, err = fireplaceClient.GET("/applicationname", restclient.EmptyHTTPParameters); err != nil {
		logger.WithError(err).Errorf("Error getting application names")

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error getting application names",
		})

		return
	}

	if err = fireplaceClient.GetResponseJSON(response, &applicationNames); err != nil {
		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error unmarshalling application names",
		})

		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, applicationNames)
}

func getLogEntry(w http.ResponseWriter, r *http.Request) {
	var (
		err      error
		response *http.Response
		logEntry *logentry_models.LogEntry
	)

	vars := mux.Vars(r)

	if response, err = fireplaceClient.GET("/logentry/"+vars["id"], nil); err != nil {
		logger.WithError(err).Errorf("Error getting log entries")

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error getting log entries",
		})

		return
	}

	if err = fireplaceClient.GetResponseJSON(response, &logEntry); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entry %s", vars["id"])

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error unmarshalling log entry",
		})

		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, logEntry)
}

func getLogEntries(w http.ResponseWriter, r *http.Request) {
	var (
		err        error
		response   *http.Response
		logEntries *logentry_models.GetLogEntriesResponse
	)

	queryParams := r.URL.Query()

	parameters := restclient.HTTPParameters{
		"page":        queryParams.Get("page"),
		"search":      url.QueryEscape(queryParams.Get("search")),
		"application": url.QueryEscape(queryParams.Get("application")),
		"level":       url.QueryEscape(queryParams.Get("level")),
	}

	if response, err = fireplaceClient.GET("/logentry", parameters); err != nil {
		logger.WithError(err).Errorf("Error getting log entries")

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error getting log entries",
		})

		return
	}

	if err = fireplaceClient.GetResponseJSON(response, &logEntries); err != nil {
		logger.WithError(err).Errorf("Error unmarshalling log entries")

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error unmarshalling log entry",
		})

		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, logEntries)
}

func deleteLogEntries(w http.ResponseWriter, r *http.Request) {
	var (
		err error
	)

	queryParams := r.URL.Query()

	parameters := restclient.HTTPParameters{
		"fromDate": queryParams.Get("fromDate"),
	}

	if _, err = fireplaceClient.DELETE("/logentry", parameters); err != nil {
		logger.WithError(err).Errorf("Error asking Fireplace server to delete log entries")

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, ErrorResponse{
			Message: "Error asking Fireplace server to delete log entries",
		})

		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusNoContent, "")
}

func getClientAppFileSystem(useOS bool) http.FileSystem {
	if useOS {
		f := os.DirFS("app")
		fsys := http.FS(f)
		return fsys
	}

	fsys, err := fs.Sub(appFs, "app")

	if err != nil {
		panic("unable to load application static assets: " + err.Error())
	}

	return http.FS(fsys)
}

func getFile(fileName string) []byte {
	if Version == "development" {
		f, _ := os.Open("app/" + fileName)
		b, _ := io.ReadAll(f)
		return b
	}

	if fileName == "main.js" {
		return mainJS
	}

	return indexHTML
}
