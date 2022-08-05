package fireplaceclient

import (
	"fmt"
	"net/http"

	model1 "github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"github.com/app-nerds/kit/v6/restclient"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

func GetClient(db *gorm.DB, serverID int, logger *logrus.Entry) (restclient.RESTClient, error) {
	var (
		queryResult *gorm.DB
		result      restclient.RESTClient
	)

	server := &model1.Server{}
	server.ID = uint(serverID)

	queryResult = db.Find(&server)

	if queryResult.Error != nil {
		return restclient.JSONClient{}, fmt.Errorf("error finding server information: %w", queryResult.Error)
	}

	httpClient := &http.Client{}

	result = restclient.NewJSONClient(restclient.JSONClientConfig{
		BaseURL:    server.URL,
		DebugMode:  false,
		HTTPClient: httpClient,
		Logger:     logger,
	})

	result = result.WithAuthorization("Bearer " + server.Password)
	return result, nil
}
