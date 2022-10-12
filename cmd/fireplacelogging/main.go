/*
 * Copyright © 2022. App Nerds LLC All Rights Reserved
 */

package main

import (
	"embed"
	"net/http"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/handlers"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/frame"
	"github.com/app-nerds/frame/pkg/framesessions"
	siteauth "github.com/app-nerds/frame/pkg/site-auth"
	webapp "github.com/app-nerds/frame/pkg/web-app"
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

	//go:embed templates
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
		Database(&model.Server{}).
		AddWebApp(&webapp.WebAppConfig{
			AppFolder:         "app",
			AppFS:             appFS,
			PrimaryLayoutName: "layout",
			TemplateFS:        templateFS,
			SessionType:       framesessions.CookieSessionType,
			TemplateManifest: webapp.TemplateCollection{
				webapp.Template{Name: "layout.tmpl", IsLayout: true, UseLayout: ""},
				webapp.Template{Name: "home.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
				webapp.Template{Name: "view-logs.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
				webapp.Template{Name: "manage-servers.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
				webapp.Template{Name: "edit-server.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			},
		}).
		AddSiteAuth(siteauth.SiteAuthConfig{
			ContentTemplateName:   "content",
			HtmlPaths:             pathsThatShouldRedirectToLogin,
			LayoutName:            "layout",
			PathsExcludedFromAuth: pathsExcludedFromAuth,
		})

	app = app.SetupEndpoints(frame.Endpoints{
		frame.Endpoint{Path: "/", Methods: []string{http.MethodGet}, HandlerFunc: handlers.HomeHandler(app)},
		frame.Endpoint{Path: "/view-logs", Methods: []string{http.MethodGet}, HandlerFunc: handlers.ViewLogsHandler(app)},
		frame.Endpoint{Path: "/manage-servers", Methods: []string{http.MethodGet}, HandlerFunc: handlers.ManageServersHandler(app)},
		frame.Endpoint{Path: "/edit-server/{id}", Methods: []string{http.MethodGet, http.MethodPost}, HandlerFunc: handlers.EditServerHandler(app)},
		frame.Endpoint{Path: "/version", Methods: []string{http.MethodGet}, HandlerFunc: handlers.VersionHandler(app)},
		frame.Endpoint{Path: "/api/server", Methods: []string{http.MethodGet}, HandlerFunc: handlers.GetServersHandler(app)},
		frame.Endpoint{Path: "/api/server/{id}", Methods: []string{http.MethodGet, http.MethodDelete}, HandlerFunc: handlers.GetDeleteServerHandler(app)},
	})

	<-app.Start()
	app.Stop()
}
