package handlers

import (
	"net/http"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/frame"
)

func ViewLogsHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := &model.ViewLogsData{
			JavascriptIncludes: []frame.JavascriptInclude{
				{Type: "module", Src: "/static/js/pages/view-logs.js"},
			},
		}

		f.RenderTemplate(w, "view-logs.tmpl", data)
	}
}
