package handlers

import (
	"net/http"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/configuration"
	"github.com/app-nerds/nerdweb/v2"
	"github.com/sirupsen/logrus"
)

func VersionHandler(config *configuration.Config, logger *logrus.Entry) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    result := map[string]string{
      "version": config.Version,
    }

    nerdweb.WriteJSON(logger, w, http.StatusOK, result)
  }
}
