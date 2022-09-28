package handlers

import (
	"net/http"

	"github.com/app-nerds/frame"
)

func VersionHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		result := map[string]string{
			"version": f.Config.Version,
		}

		f.WriteJSON(w, http.StatusOK, result)
	}
}
