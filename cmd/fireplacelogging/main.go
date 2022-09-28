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

	//go:embed app
	appFS embed.FS

	//go:embed templates
	templateFS embed.FS
)

func main() {
	app := frame.NewFrameApplication(AppName, Version).
		Templates(templateFS, "templates", frame.TemplateCollection{
			frame.Template{Name: "layout.tmpl", IsLayout: true, UseLayout: ""},
			frame.Template{Name: "home.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			frame.Template{Name: "error.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			frame.Template{Name: "unauthorized.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			frame.Template{Name: "login.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			frame.Template{Name: "account-pending.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
			frame.Template{Name: "view-logs.tmpl", IsLayout: false, UseLayout: "layout.tmpl"},
		})

	app = app.Database(&model.Server{}).
		CookieSessions("fireplacelogging", 86400*2).
		AccountAwaitingApprovalPath("/account-pending").
		UnauthorizedPath("/unauthorized").
		UnexpectedErrorPath("/error").
		WithGoogleAuth("email", "profile").
		SetupExternalAuth(
			[]string{"/", "/login", "/unauthorized", "/account-pending", "/static", "/auth", "/version"},
			[]string{"/view-logs", "/manage-servers", "/edit-server"},
		).
		WebAppFolder("app")

	app = app.SetupEndpoints(appFS, frame.Endpoints{
		frame.Endpoint{Path: "/", Methods: []string{http.MethodGet}, HandlerFunc: handlers.HomeHandler(app)},
		frame.Endpoint{Path: "/login", Methods: []string{http.MethodGet}, HandlerFunc: handlers.LoginHandler(app)},
		frame.Endpoint{Path: "/account-pending", Methods: []string{http.MethodGet}, HandlerFunc: handlers.AccountPendingHandler(app)},
		frame.Endpoint{Path: "/error", Methods: []string{http.MethodGet}, HandlerFunc: handlers.ErrorHandler(app)},
		frame.Endpoint{Path: "/unauthorized", Methods: []string{http.MethodGet}, HandlerFunc: handlers.UnauthorizedHandler(app)},
		frame.Endpoint{Path: "/view-logs", Methods: []string{http.MethodGet}, HandlerFunc: handlers.ViewLogsHandler(app)},
		frame.Endpoint{Path: "/version", Methods: []string{http.MethodGet}, HandlerFunc: handlers.VersionHandler(app)},
		frame.Endpoint{Path: "/api/server", Methods: []string{http.MethodGet}, HandlerFunc: handlers.GetServersHandler(app)},
		frame.Endpoint{Path: "/api/server/{id}", Methods: []string{http.MethodGet}, HandlerFunc: handlers.GetServerHandler(app)},
	})

	<-app.Start()
	app.Stop()
}
