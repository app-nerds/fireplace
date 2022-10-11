package model

import webapp "github.com/app-nerds/frame/pkg/web-app"

type ViewLogsData struct {
	webapp.JavascriptIncludes
}

type ManageServersData struct {
	webapp.JavascriptIncludes
}

type EditServerData struct {
	webapp.JavascriptIncludes

	ID      int
	Server  *Server
	Message string
}
