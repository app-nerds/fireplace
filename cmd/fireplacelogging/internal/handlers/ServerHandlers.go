package handlers

import (
	"net/http"
	"strconv"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/frame"
	webapp "github.com/app-nerds/frame/pkg/web-app"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func EditServerHandler(f *frame.FrameApplication) http.HandlerFunc {
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
			JavascriptIncludes: []webapp.JavascriptInclude{
				{Type: "application/javascript", Src: "/static/js/lib/quill/quill.min.js"},
				{Type: "module", Src: "/static/js/pages/edit-server.js"},
			},
			ID:     id,
			Server: &model.Server{},
		}

		/*
		 * Finally, call the correct method. If we are just loading the page
		 * then go to the GET handler. If this is the user posting an edit
		 * then go to the POST handler.
		 */
		if r.Method == http.MethodGet {
			editServerGet(f, w, r, id, data)
		} else {
			editServerPost(f, w, r, id, data)
		}
	}
}

func editServerGet(f *frame.FrameApplication, w http.ResponseWriter, r *http.Request, id int, data *model.EditServerData) {
	var (
		queryResult *gorm.DB
	)

	if id > 0 {
		data.Server.ID = uint(id)
		queryResult = f.DB.Find(&data.Server)

		if queryResult.Error != nil {
			f.Logger.WithError(queryResult.Error).Error("error getting server information in EditServerHandler")
			f.UnexpectedError(w, r)
			return
		}
	}

	f.RenderTemplate(w, "edit-server.tmpl", data)
}

func editServerPost(f *frame.FrameApplication, w http.ResponseWriter, r *http.Request, id int, data *model.EditServerData) {
	var (
		queryResult *gorm.DB
		server      *model.Server
	)

	_ = r.ParseForm()

	f.Logger.WithFields(logrus.Fields{
		"form": r.Form,
		"id":   id,
	}).Info("form posted")

	server = &model.Server{}

	/*
	 * If we are updated, get the existing data
	 */
	if id > 0 {
		server.ID = uint(id)
		queryResult = f.DB.Find(&server)

		if queryResult.Error != nil {
			f.Logger.WithError(queryResult.Error).Error("error getting server information in EditServerHandler")
			f.UnexpectedError(w, r)
			return
		}
	}

	/*
	 * Update our fields
	 */
	server.Description = r.FormValue("description")
	server.ServerName = r.FormValue("serverName")
	server.URL = r.FormValue("url")
	server.Password = r.FormValue("password")

	/*
	 * Create or update
	 */
	if id > 0 {
		queryResult = f.DB.Save(&server)

		if queryResult.Error != nil {
			f.Logger.WithError(queryResult.Error).Error("error updating server")
			f.UnexpectedError(w, r)
			return
		}

		data.Message = "Server updated!"
	} else {
		queryResult = f.DB.Create(&server)

		if queryResult.Error != nil {
			f.Logger.WithError(queryResult.Error).Error("error creating server")
			f.UnexpectedError(w, r)
			return
		}

		data.Message = "Server created!"
	}

	data.Server = server
	f.RenderTemplate(w, "edit-server.tmpl", data)
}

func GetDeleteServerHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			getServerHandler(f, w, r)
		}

		if r.Method == http.MethodDelete {
			deleteServerHandler(f, w, r)
		}
	}
}

func getServerHandler(f *frame.FrameApplication, w http.ResponseWriter, r *http.Request) {
	var (
		err         error
		queryResult *gorm.DB
		id          int
	)

	vars := mux.Vars(r)
	idString := vars["id"]

	if id, err = strconv.Atoi(idString); err != nil {
		f.Logger.WithError(err).Error("error converting server ID to int")
		f.WriteJSON(w, http.StatusBadRequest, f.CreateGenericErrorResponse("invalid server ID", err.Error(), ""))
		return
	}

	result := &model.Server{}
	result.ID = uint(id)

	queryResult = f.DB.First(&result)

	if queryResult.Error != nil {
		f.Logger.WithError(err).Errorf("error querying for server %s", idString)
		f.WriteJSON(w, http.StatusInternalServerError, f.CreateGenericErrorResponse("error querying for server information", queryResult.Error.Error(), ""))
		return
	}

	f.WriteJSON(w, http.StatusOK, result)
}

func deleteServerHandler(f *frame.FrameApplication, w http.ResponseWriter, r *http.Request) {
	var (
		err         error
		queryResult *gorm.DB
		id          int
	)

	vars := mux.Vars(r)
	idString := vars["id"]

	if id, err = strconv.Atoi(idString); err != nil {
		f.Logger.WithError(err).Error("error converting server ID to int")
		f.WriteJSON(w, http.StatusBadRequest, f.CreateGenericErrorResponse("invalid server ID", err.Error(), ""))
		return
	}

	result := &model.Server{}
	result.ID = uint(id)

	queryResult = f.DB.Delete(&result)

	if queryResult.Error != nil {
		f.Logger.WithError(err).Errorf("error deleting server %s", idString)
		f.WriteJSON(w, http.StatusInternalServerError, f.CreateGenericErrorResponse("error deleting server", queryResult.Error.Error(), ""))
		return
	}

	f.WriteJSON(w, http.StatusOK, f.CreateGenericSuccessResponse("deleted successfully"))
}

func GetServersHandler(f *frame.FrameApplication) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var (
			result      []*model.Server
			queryResult *gorm.DB
		)

		queryResult = f.DB.Find(&result)

		if queryResult.Error != nil {
			f.Logger.WithError(queryResult.Error).Error("error getting server list")
			f.WriteJSON(w, http.StatusInternalServerError, f.CreateGenericErrorResponse("error getting server list", queryResult.Error.Error(), ""))
		}

		f.WriteJSON(w, http.StatusOK, result)
	}
}
