package handlers

import (
	"net/http"
	"strconv"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/frame"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

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
