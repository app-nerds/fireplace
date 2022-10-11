package handlers

import (
	"net/http"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/frame"
	webapp "github.com/app-nerds/frame/pkg/web-app"
)

func ViewLogsHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := &model.ViewLogsData{
			JavascriptIncludes: []webapp.JavascriptInclude{
				{Type: "module", Src: "/pages/view-logs.js"},
			},
		}

		f.RenderTemplate(w, "view-logs.tmpl", data)
	}
}

func ManageServersHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := &model.ManageServersData{
			JavascriptIncludes: []webapp.JavascriptInclude{
				{Type: "module", Src: "/pages/manage-servers.js"},
			},
		}

		f.RenderTemplate(w, "manage-servers.tmpl", data)
	}
}
