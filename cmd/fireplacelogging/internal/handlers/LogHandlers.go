package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func ViewLogsHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title":          "View Logs",
			"RegularScripts": []string{},
			"ModuleScripts": []string{
				"/static/js/pages/view-logs.js",
			},
		}

		f.RenderTemplate(w, "view-logs.tmpl", data)
	}
}
