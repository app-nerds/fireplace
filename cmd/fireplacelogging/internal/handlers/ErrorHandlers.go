package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func AccountPendingHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title":          "Account Pending",
			"RegularScripts": []string{},
			"ModuleScripts":  []string{},
		}

		f.RenderTemplate(w, "account-pending.tmpl", data)
	}
}

func ErrorHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title":          "Error",
			"RegularScripts": []string{},
			"ModuleScripts":  []string{},
		}

		f.RenderTemplate(w, "error.tmpl", data)
	}
}

func UnauthorizedHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := map[string]interface{}{
			"Title":          "Unauthorized",
			"RegularScripts": []string{},
			"ModuleScripts":  []string{},
		}

		f.RenderTemplate(w, "unauthorized.tmpl", data)
	}
}
