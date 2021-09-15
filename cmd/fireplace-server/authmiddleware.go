package main

import (
	"net/http"
	"strings"

	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/app-nerds/nerdweb/v2"
	"github.com/sirupsen/logrus"
)

type authMiddleware struct {
	logger   *logrus.Entry
	password string
}

/*
NewAuthMiddleware creates a new authentication middleware struct
*/
func NewAuthMiddleware(logger *logrus.Entry, password string) *authMiddleware {
	return &authMiddleware{
		logger:   logger.WithField("who", "Authentication Middleware"),
		password: password,
	}
}

/*
Middleware is a middleware that authorizes Fireplace requests
*/
func (m *authMiddleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		authHeaderSplit := strings.Split(authHeader, " ")

		if len(authHeaderSplit) < 2 {
			nerdweb.WriteJSON(m.logger, w, http.StatusBadRequest, pkg.GenericResponse{
				Message: "Invalid authorization header",
			})
			return
		}

		if authHeaderSplit[1] != m.password {
			nerdweb.WriteJSON(m.logger, w, http.StatusForbidden, pkg.GenericResponse{
				Message: "Forbidden",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}
