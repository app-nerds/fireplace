package applications

import (
	"fmt"
	"net/http"

	"github.com/app-nerds/kit/v6/restclient"
)

func GetApplicationNames(restClient restclient.RESTClient) ([]string, error) {
	var (
		err         error
		response    *http.Response
		result      []string
		errorResult map[string]interface{}
	)

	if response, err = restClient.GET("/applicationname", &result, &errorResult); err != nil {
		return result, fmt.Errorf("error calling Fireplace to get application names: %w", err)
	}

	if response.StatusCode > 299 {
		return result, fmt.Errorf("Fireplace returned an error getting application names: %s", errorResult["message"])
	}

	return result, nil
}
