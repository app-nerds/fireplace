package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func ViewLogsHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"scripts": []map[string]interface{}{
				{
					"type": "module",
					"src":  "/pages/view-logs.js",
				},
			},
		}

		f.RenderTemplate(w, "view-logs.tmpl", data)
	}
}
