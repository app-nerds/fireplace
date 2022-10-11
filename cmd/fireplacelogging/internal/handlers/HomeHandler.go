package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func HomeHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		f.RenderTemplate(w, "home.tmpl", nil)
	}
}
