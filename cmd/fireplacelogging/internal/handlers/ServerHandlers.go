package handlers

import (
	"net/http"
	"strconv"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/services"
	"github.com/app-nerds/frame"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

func ManageServersHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data := &model.ManageServersData{
			JavascriptIncludes: []frame.JavascriptInclude{
				{Type: "module", Src: "/static/js/pages/manage-servers.js"},
			},
		}

		f.RenderTemplate(w, "manage-servers.tmpl", data)
	}
}

func EditServerHandler(f *frame.FrameApplication, serverService *services.ServerService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var (
			err error
			id  int
		)

		/*
		 * Get the ID from the URL path
		 */
		vars := mux.Vars(r)
		idString := vars["id"]

		if id, err = strconv.Atoi(idString); err != nil {
			f.Logger.WithError(err).Error("error converting server ID to int")
			f.WriteJSON(w, http.StatusBadRequest, f.CreateGenericErrorResponse("invalid server ID", err.Error(), ""))
			return
		}

		/*
		 * Setup our initial view data
		 */
		data := &model.EditServerData{
			JavascriptIncludes: []frame.JavascriptInclude{
				{Type: "application/javascript", Src: "/static/js/lib/quill/quill.min.js"},
				{Type: "module", Src: "/static/js/pages/edit-server.js"},
			},
			ID:     id,
			Server: model.Server{},
		}

		/*
		 * Finally, call the correct method. If we are just loading the page
		 * then go to the GET handler. If this is the user posting an edit
		 * then go to the POST handler.
		 */
		if r.Method == http.MethodGet {
			editServerGet(f, serverService, w, r, id, data)
		} else {
			editServerPost(f, serverService, w, r, id, data)
		}
	}
}

func editServerGet(f *frame.FrameApplication, serverService *services.ServerService, w http.ResponseWriter, r *http.Request, id int, data *model.EditServerData) {
	var (
		err error
	)

	memberInfo := f.GetMemberSession(r)

	if id > 0 {
		if data.Server, err = serverService.Get(uint(id), memberInfo.ID); err != nil {
			f.Logger.WithError(err).Error("error getting server information in EditServerHandler")
			f.UnexpectedError(w, r)
			return
		}
	}

	f.RenderTemplate(w, "edit-server.tmpl", data)
}

func editServerPost(f *frame.FrameApplication, serverService *services.ServerService, w http.ResponseWriter, r *http.Request, id int, data *model.EditServerData) {
	var (
		err    error
		server model.Server
		newID  int64
	)

	_ = r.ParseForm()

	f.Logger.WithFields(logrus.Fields{
		"form": r.Form,
		"id":   id,
	}).Info("form posted")

	memberInfo := f.GetMemberSession(r)

	server = model.Server{
		ID:          uint(id),
		Description: r.FormValue("description"),
		Password:    r.FormValue("password"),
		ServerName:  r.FormValue("serverName"),
		URL:         r.FormValue("url"),
	}

	if newID, err = serverService.Save(server, memberInfo.ID); err != nil {
		f.Logger.WithError(err).Error("error saving server")
		f.UnexpectedError(w, r)
		return
	}

	data.ID = int(newID)
	server.ID = uint(newID)
	data.Message = "Server created!"

	if id > 0 {
		data.Message = "Server updated!"
	}

	data.Server = server
	f.RenderTemplate(w, "edit-server.tmpl", data)
}

func GetDeleteServerHandler(f *frame.FrameApplication, serverService *services.ServerService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			getServerHandler(f, serverService, w, r)
		}

		if r.Method == http.MethodDelete {
			deleteServerHandler(f, serverService, w, r)
		}
	}
}

func getServerHandler(f *frame.FrameApplication, serverService *services.ServerService, w http.ResponseWriter, r *http.Request) {
	var (
		err    error
		server model.Server
		id     int
	)

	vars := mux.Vars(r)
	idString := vars["id"]

	if id, err = strconv.Atoi(idString); err != nil {
		f.Logger.WithError(err).Error("error converting server ID to int")
		f.WriteJSON(w, http.StatusBadRequest, f.CreateGenericErrorResponse("invalid server ID", err.Error(), ""))
		return
	}

	memberInfo := f.GetMemberSession(r)

	if server, err = serverService.Get(uint(id), memberInfo.ID); err != nil {
		f.Logger.WithError(err).Error("error getting server information in GetDeleteServerHandler")
		f.UnexpectedError(w, r)
		return
	}

	f.WriteJSON(w, http.StatusOK, server)
}

func deleteServerHandler(f *frame.FrameApplication, serverService *services.ServerService, w http.ResponseWriter, r *http.Request) {
	var (
		err error
		id  int
	)

	vars := mux.Vars(r)
	idString := vars["id"]

	if id, err = strconv.Atoi(idString); err != nil {
		f.Logger.WithError(err).Error("error converting server ID to int")
		f.WriteJSON(w, http.StatusBadRequest, f.CreateGenericErrorResponse("invalid server ID", err.Error(), ""))
		return
	}

	memberInfo := f.GetMemberSession(r)

	if err = serverService.Delete(uint(id), memberInfo.ID); err != nil {
		f.Logger.WithError(err).Errorf("error deleting server %s", idString)
		f.UnexpectedError(w, r)
		return
	}

	f.WriteJSON(w, http.StatusOK, f.CreateGenericSuccessResponse("deleted successfully"))
}

func GetServersHandler(f *frame.FrameApplication, serverService *services.ServerService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var (
			err    error
			result []model.Server
		)

		memberInfo := f.GetMemberSession(r)

		if result, err = serverService.Search(memberInfo.ID); err != nil {
			f.Logger.WithError(err).Error("error getting server list")
			f.WriteJSON(w, http.StatusInternalServerError, f.CreateGenericErrorResponse("error getting server list", err.Error(), ""))
			return
		}

		f.WriteJSON(w, http.StatusOK, result)
	}
}
