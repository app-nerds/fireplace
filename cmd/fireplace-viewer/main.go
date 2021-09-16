/*
 * Copyright (c) 2021. App Nerds LLC. All rights reserved
 */

package main

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"embed"
	"io"
	"io/fs"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/app-nerds/fireplace/v2/cmd/fireplace-viewer/internal"
	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/app-nerds/kit/v5/identity"
	"github.com/app-nerds/kit/v5/restclient2"
	"github.com/app-nerds/nerdweb"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

/*
LoginRequest is used to login to the Fireplace Viewer
*/
type LoginRequest struct {
	Password string `json:"password"`
}

var (
	Version         string = "development"
	config          internal.Config
	logger          *logrus.Entry
	fireplaceClient restclient2.RESTClient
	jwtService      identity.IJWTService

	//go:embed app
	appFs embed.FS

	//go:embed app/index.html
	indexHTML []byte

	//go:embed app/main.js
	mainJS []byte
)

func main() {
	var (
		err        error
		httpClient *http.Client
	)

	config = internal.GetConfig(Version)

	logger = logrus.New().WithField("who", "Fireplace Viewer")
	logger.WithFields(logrus.Fields{
		"version":      config.Version,
		"host":         config.Host,
		"fireplaceurl": config.FireplaceServerURL,
	}).Info("Welcome to Fireplace Viewer!")

	/*
	 * Setup fireplace server HTTP client
	 */
	if config.Cert != "" {
		certPool := loadCert(config.Cert)

		httpClient = &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					RootCAs: certPool,
				},
			},
		}
	} else {
		httpClient = &http.Client{}
	}

	fireplaceClient = restclient2.NewJSONClient(
		config.FireplaceServerURL,
		&restclient2.HTTPClient{
			Client: httpClient,
		},
	).WithAuthorization("Bearer " + config.FireplaceServerPassword)

	/*
	 * Setup JWT Service
	 */
	jwtService = identity.NewJWTService(&identity.JWTServiceConfig{
		AuthSalt:         config.JWTSecret,
		AuthSecret:       config.JWTSecret,
		Issuer:           "issuer://net.appnerds.fireplaceviewer",
		TimeoutInMinutes: 60,
	})

	/*
	 * Setup router mux and server
	 */
	auth := &authMiddleware{
		logger:     logger,
		jwtService: jwtService,
	}

	router := mux.NewRouter()
	router.Use(mux.CORSMethodMiddleware(router))

	router.HandleFunc("/login", login).Methods(http.MethodPost)

	staticFS := http.FileServer(getClientAppFileSystem(Version == "development"))

	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.Use(auth.Middleware)

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

		if config.Cert == "" {
			err = server.ListenAndServe()
		} else {
			err = server.ListenAndServeTLS(config.Cert+".crt", config.Cert+".key")
		}

		if err != http.ErrServerClosed {
			logger.WithError(err).Fatal("Unable to start application")
		} else {
			logger.Info("Shutting down the server...")
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

func handleError(err error, response *http.Response, errorResponse pkg.GenericResponse, message string, w http.ResponseWriter) {
	if err != nil {
		logger.WithError(err).Error(message)
		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: message,
		})
		return
	}

	if response.StatusCode > 299 {
		logger.WithField("errorResponse", errorResponse).Error(message)
		nerdweb.WriteJSON(logger, w, response.StatusCode, pkg.GenericResponse{
			Message: message,
		})
	}
}

func login(w http.ResponseWriter, r *http.Request) {
	var (
		err   error
		token string
	)

	loginRequest := LoginRequest{}

	if err = nerdweb.ReadJSONBody(r, &loginRequest); err != nil {
		logger.WithError(err).Error("Invalid login request")
		nerdweb.WriteJSON(logger, w, http.StatusBadRequest, pkg.GenericResponse{
			Message: "Invalid login request",
		})
		return
	}

	if loginRequest.Password != config.ServerPassword {
		logger.WithFields(logrus.Fields{
			"ip": nerdweb.RealIP(r),
		}).Error("Invalid password during login attempt")

		nerdweb.WriteJSON(logger, w, http.StatusUnauthorized, pkg.GenericResponse{
			Message: "Invalid password",
		})
		return
	}

	if token, err = jwtService.CreateToken(&identity.CreateTokenRequest{}); err != nil {
		logger.WithError(err).WithFields(logrus.Fields{
			"ip": nerdweb.RealIP(r),
		}).Error("error creating JWT token")

		nerdweb.WriteJSON(logger, w, http.StatusInternalServerError, pkg.GenericResponse{
			Message: "Error creating token",
		})
		return
	}

	result := map[string]string{
		"token": token,
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, result)
}

func getApplicationNames(w http.ResponseWriter, r *http.Request) {
	var (
		err      error
		response *http.Response
	)

	applicationNames := make([]string, 0, 50)
	errorResponse := pkg.GenericResponse{}

	if response, err = fireplaceClient.GET("/applicationname", &applicationNames, &errorResponse); err != nil || response.StatusCode > 299 {
		handleError(err, response, errorResponse, "Error getting application names", w)
		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, applicationNames)
}

func getLogEntry(w http.ResponseWriter, r *http.Request) {
	var (
		err      error
		response *http.Response
		logEntry pkg.LogEntry
	)

	vars := mux.Vars(r)
	errorResponse := pkg.GenericResponse{}

	if response, err = fireplaceClient.GET("/logentry/"+vars["id"], &logEntry, &errorResponse); err != nil || response.StatusCode > 299 {
		handleError(err, response, errorResponse, "Error getting log entry "+vars["id"], w)
		return
	}

	nerdweb.WriteJSON(logger, w, http.StatusOK, logEntry)
}

func getLogEntries(w http.ResponseWriter, r *http.Request) {
	var (
		err        error
		response   *http.Response
		logEntries pkg.GetLogEntriesResponse
	)

	errorResponse := pkg.GenericResponse{}
	queryParams := r.URL.Query()
	parameters := url.Values{}

	parameters.Set("page", queryParams.Get("page"))
	parameters.Set("search", queryParams.Get("search"))
	parameters.Set("application", queryParams.Get("application"))
	parameters.Set("level", queryParams.Get("level"))

	if response, err = fireplaceClient.GET("/logentry?"+parameters.Encode(), &logEntries, &errorResponse); err != nil || response.StatusCode > 299 {
		handleError(err, response, errorResponse, "Error getting log entries", w)
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

func loadCert(certFile string) *x509.CertPool {
	caCert, err := ioutil.ReadFile(certFile + ".crt")
	if err != nil {
		panic(err)
	}

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	return caCertPool
}
