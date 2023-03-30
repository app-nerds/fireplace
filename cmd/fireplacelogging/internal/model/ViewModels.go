package model

import "github.com/app-nerds/frame"

type ViewLogsData struct {
	frame.JavascriptIncludes
}

type ManageServersData struct {
	frame.JavascriptIncludes
}

type EditServerData struct {
	frame.JavascriptIncludes

	ID      int
	Server  Server
	Message string
}
