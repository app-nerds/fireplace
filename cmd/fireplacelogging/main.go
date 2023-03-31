/*
 * Copyright © 2022. App Nerds LLC All Rights Reserved
 */

package main

import (
	"embed"
	"net/http"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/handlers"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/services"
	"github.com/app-nerds/frame"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

/*
 * These constants are used for environment configuration and
 * logging setup.
 */
const (
	AppName string = "Fireplace Logging"
)

var (
	Version = "development"

	//go:embed app
	appFS embed.FS

	//go:embed frontend-templates
	templateFS embed.FS
)

func main() {
	var (
		app *frame.FrameApplication
	)

	pathsExcludedFromAuth := []string{
		"/", "/version",
	}

	pathsThatShouldRedirectToLogin := []string{
		"/view-logs", "/manage-servers", "/edit-server",
	}

	app = frame.NewFrameApplication(AppName, Version).
		AddWebApp(&frame.WebAppConfig{
			AppFolder:         "app",
			AppFS:             appFS,
			PrimaryLayoutName: "layout",
			TemplateFS:        templateFS,
			SessionType:       frame.CookieSessionType,
			TemplateManifest: frame.TemplateCollection{
				frame.Template{Name: "layout.tmpl", IsLayout: true, UseLayout: ""},
				frame.Template{Name: "home.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
				frame.Template{Name: "view-logs.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
				frame.Template{Name: "manage-servers.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
				frame.Template{Name: "edit-server.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			},
		}).
		Database("database-migrations").
		AddSiteAuth(frame.SiteAuthConfig{
			ContentTemplateName:   "content",
			HtmlPaths:             pathsThatShouldRedirectToLogin,
			LayoutName:            "layout",
			PathsExcludedFromAuth: pathsExcludedFromAuth,
		})

	/*
	 * Setup services
	 */
	serverService := services.NewServerService(services.ServerServiceConfig{
		DB: app.DB,
	})
	/*
	 * Setup endpoints
	 */
	app = app.SetupEndpoints(frame.Endpoints{
		frame.Endpoint{Path: "/", Methods: []string{http.MethodGet}, HandlerFunc: handlers.HomeHandler(app)},
		frame.Endpoint{Path: "/view-logs", Methods: []string{http.MethodGet}, HandlerFunc: handlers.ViewLogsHandler(app)},
		frame.Endpoint{Path: "/manage-servers", Methods: []string{http.MethodGet}, HandlerFunc: handlers.ManageServersHandler(app)},
		frame.Endpoint{Path: "/edit-server/{id}", Methods: []string{http.MethodGet, http.MethodPost}, HandlerFunc: handlers.EditServerHandler(app, serverService)},
		frame.Endpoint{Path: "/version", Methods: []string{http.MethodGet}, HandlerFunc: handlers.VersionHandler(app)},
		frame.Endpoint{Path: "/api/server", Methods: []string{http.MethodGet}, HandlerFunc: handlers.GetServersHandler(app, serverService)},
		frame.Endpoint{Path: "/api/server/{id}", Methods: []string{http.MethodGet, http.MethodDelete}, HandlerFunc: handlers.GetDeleteServerHandler(app, serverService)},
	})

	<-app.Start()
	app.Stop()
}
