package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func HomeHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title":          "Home",
			"RegularScripts": []string{},
			"ModuleScripts": []string{
				"/static/js/pages/home.js",
			},
		}

		f.RenderTemplate(w, "home.tmpl", data)
	}
}
