/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
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

	"github.com/app-nerds/fireplace/v2/cmd/fireplace-viewer/configuration"
	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/app-nerds/kit/v5/restclient2"
	"github.com/app-nerds/nerdweb"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

var (
	Version         string = "development"
	logger          *logrus.Entry
	fireplaceClient restclient2.JSONClient

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
	fireplaceClient = restclient2.NewJSONClient(
		config.FireplaceServerURL,
		&restclient2.HTTPClient{
			Client: &http.Client{},
		},
	)

	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))
	staticFS := http.FileServer(getClientAppFileSystem(Version == "development"))

	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/logentry", getLogEntries).Methods(http.MethodGet)
	apiRouter.HandleFunc("/logentry/{id}", getLogEntry).Methods(http.MethodGet)

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

func handleError(ok bool, notOKStatus int, errorResponse pkg.GenericResponse, message string, w http.ResponseWriter) {
	if !ok {
		logger.WithField("errorResponse", errorResponse).Error(message)
		nerdweb.WriteJSON(logger, w, notOKStatus, pkg.GenericResponse{
			Message: message,
		})
	}
}

func getApplicationNames(w http.ResponseWriter, r *http.Request) {
	var (
		ok bool
	)

	applicationNames := make([]string, 0, 50)
	errorResponse := pkg.GenericResponse{}

	if ok, _ = fireplaceClient.GET("/applicationname", &applicationNames, &errorResponse); !ok {
		handleError(ok, http.StatusInternalServerError, errorResponse, "Error getting application names", w)
		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, applicationNames)
}

func getLogEntry(w http.ResponseWriter, r *http.Request) {
	var (
		ok            bool
		logEntry      pkg.LogEntry
		errorResponse pkg.GenericResponse
	)

	vars := mux.Vars(r)

	if ok, _ = fireplaceClient.GET("/logentry/"+vars["id"], &logEntry, &errorResponse); !ok {
		handleError(ok, http.StatusInternalServerError, errorResponse, "Error getting log entry "+vars["id"], w)
		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, logEntry)
}

func getLogEntries(w http.ResponseWriter, r *http.Request) {
	var (
		ok            bool
		logEntries    pkg.GetLogEntriesResponse
		errorResponse pkg.GenericResponse
	)

	queryParams := r.URL.Query()
	parameters := url.Values{}

	parameters.Set("page", queryParams.Get("page"))
	parameters.Set("search", queryParams.Get("search"))
	parameters.Set("application", queryParams.Get("application"))
	parameters.Set("level", queryParams.Get("level"))

	if ok, _ = fireplaceClient.GET("/logentry?"+parameters.Encode(), &logEntries, &errorResponse); !ok {
		handleError(ok, http.StatusInternalServerError, errorResponse, "Error getting log entries", w)
		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, logEntries)
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
