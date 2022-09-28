package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func LoginHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title":          "Login",
			"RegularScripts": []string{},
			"ModuleScripts":  []string{},
		}

		f.RenderTemplate(w, "login.tmpl", data)
	}
}
