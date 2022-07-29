//go:generate go run github.com/99designs/gqlgen generate

/*
 * Copyright © 2022. App Nerds LLC All Rights Reserved
 */

package main

import (
	"context"
	"embed"
	"net/http"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/graph"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/graph/generated"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/configuration"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/handlers"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/nerdweb/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

/*
 * These constants are used for environment configuration and
 * logging setup.
 */
const (
	AppName string = "fireplacelogging"
)

var (
	Version = "development"

	config *configuration.Config
	logger *logrus.Entry

	//go:embed app
	appFs embed.FS

	//go:embed app/index.html
	indexHTML []byte

	//go:embed app/main.js
	mainJS []byte

	//go:embed app/manifest.json
	manifestJSON []byte
)

func main() {
	var (
		err error
		db  *gorm.DB
	)

	/*
	 * Setup configuration and logging
	 */
	config = configuration.NewConfig(AppName, Version)
	logger = logrus.New().WithFields(logrus.Fields{
		"who":     AppName,
		"version": Version,
	})
	logger.Logger.SetLevel(config.GetLogLevel())

	if db, err = gorm.Open(postgres.Open(config.DSN), &gorm.Config{}); err != nil {
		logger.WithError(err).Fatal("unable to connect to the database")
	}

	logger.WithField("host", config.ServerHost).Info("starting server...")
	spaConfig := nerdweb.DefaultSPAConfig(config.ServerHost, Version, appFs, indexHTML, mainJS, manifestJSON)

	graphQLServer := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{
		DB:     db,
		Config: config,
	}}))

	_ = db.AutoMigrate(&model.Server{}, &model.Member{})

	spaConfig.Endpoints = nerdweb.Endpoints{
		{Path: "/version", Methods: []string{http.MethodGet}, HandlerFunc: handlers.VersionHandler(config, logger)},
		{Path: "/query", Methods: []string{http.MethodPost}, Handler: graphQLServer},
	}

	_, server := nerdweb.NewSPARouterAndServer(spaConfig)

	/*
	 * Start the server
	 */
	go func() {
		err := server.ListenAndServe()

		if err != nil && err != http.ErrServerClosed {
			logger.WithError(err).Fatal("error starting server")
		}
	}()

	<-nerdweb.WaitForKill()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err = server.Shutdown(ctx); err != nil {
		logger.WithError(err).Fatal("error shutting down server")
	}

	logger.Info("server stopped")
}
