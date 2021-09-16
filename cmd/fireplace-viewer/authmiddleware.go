package main

import (
	"net/http"
	"strings"

	"github.com/app-nerds/fireplace/v2/pkg"
	"github.com/app-nerds/kit/v5/identity"
	"github.com/app-nerds/nerdweb/v2"
	"github.com/sirupsen/logrus"
)

type authMiddleware struct {
	logger     *logrus.Entry
	jwtService identity.IJWTService
}

/*
NewAuthMiddleware creates a new authentication middleware struct
*/
func NewAuthMiddleware(logger *logrus.Entry, jwtService identity.IJWTService) *authMiddleware {
	return &authMiddleware{
		logger:     logger.WithField("who", "Authentication Middleware"),
		jwtService: jwtService,
	}
}

/*
Middleware is a middleware that authorizes Fireplace requests
*/
func (m *authMiddleware) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var (
			err error
		)

		authHeader := r.Header.Get("Authorization")
		authHeaderSplit := strings.Split(authHeader, " ")

		if len(authHeaderSplit) < 2 {
			nerdweb.WriteJSON(m.logger, w, http.StatusBadRequest, pkg.GenericResponse{
				Message: "Invalid authorization header",
			})
			return
		}

		token := authHeaderSplit[1]

		if _, err = m.jwtService.ParseToken(token); err != nil {
			m.logger.WithError(err).Error("Invalid JWT token")

			nerdweb.WriteJSON(m.logger, w, http.StatusForbidden, pkg.GenericResponse{
				Message: "Forbidden",
			})

			return
		}

		next.ServeHTTP(w, r)
	})
}
