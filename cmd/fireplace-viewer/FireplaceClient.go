package main

import (
	"io"
	"net/http"

	"github.com/app-nerds/kit/v4/restclient"
	"github.com/pkg/errors"
)

/*
IFireplaceClient provides an interface for working with a fireplace server
*/
type IFireplaceClient interface {
	DELETE(query string, parameters restclient.HTTPParameters) (*http.Response, error)
	GET(query string, parameters restclient.HTTPParameters) (*http.Response, error)
	GetResponseJSON(response *http.Response, receiver interface{}) error
	GetResponseString(response *http.Response) string
	POST(query string, body io.Reader) (*http.Response, error)
	PUT(query string, body io.Reader) (*http.Response, error)
}

/*
FireplaceClient implements methods to work with HTTP calls to the fireplace server
*/
type FireplaceClient struct {
	restclient.IRestClient
}

func (c *FireplaceClient) DELETE(query string, parameters restclient.HTTPParameters) (*http.Response, error) {
	var err error
	var request *http.Request
	var response *http.Response

	queryString := query

	if parameters != nil && len(parameters) > 0 {
		queryString += "?" + c.ConvertMapToQueryString(parameters)
	}

	if request, err = c.CreateRequest(queryString, "DELETE", nil, ""); err != nil {
		return nil, err
	}

	if response, err = c.ExecuteRequest(request); err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return response, errors.New(c.GetResponseString(response))
	}

	return response, nil
}

/*
GET performs a GET operations against an auction server
*/
func (c *FireplaceClient) GET(query string, parameters restclient.HTTPParameters) (*http.Response, error) {
	var err error
	var request *http.Request
	var response *http.Response

	queryString := query

	if parameters != nil && len(parameters) > 0 {
		queryString += "?" + c.ConvertMapToQueryString(parameters)
	}

	if request, err = c.CreateRequest(queryString, "GET", nil, ""); err != nil {
		return nil, err
	}

	if response, err = c.ExecuteRequest(request); err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return response, errors.New(response.Status)
	}

	return response, nil
}

func (c *FireplaceClient) GetResponseJSON(response *http.Response, receiver interface{}) error {
	return c.IRestClient.GetResponseJSON(response, receiver)
}

func (c *FireplaceClient) GetResponseString(response *http.Response) string {
	return c.IRestClient.GetResponseString(response)
}

/*
POST executes a POST request to the specified path passing the provided
body along. This assumes the body will be a JSON byte slice
*/
func (c *FireplaceClient) POST(query string, body io.Reader) (*http.Response, error) {
	var err error
	var request *http.Request
	var response *http.Response

	if request, err = c.CreateRequest(query, "POST", body, ""); err != nil {
		return nil, err
	}

	request.Header.Add("Content-Type", "application/json")

	if response, err = c.ExecuteRequest(request); err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return response, errors.New(string(response.Status))
	}

	return response, nil
}

/*
PUT executes a PUT request to the specified path passing the provided
body along. This assumes the body will be a JSON byte slice
*/
func (c *FireplaceClient) PUT(query string, body io.Reader) (*http.Response, error) {
	var err error
	var request *http.Request
	var response *http.Response

	if request, err = c.CreateRequest(query, "PUT", body, ""); err != nil {
		return nil, err
	}

	request.Header.Add("Content-Type", "application/json")

	if response, err = c.ExecuteRequest(request); err != nil {
		return nil, err
	}

	if response.StatusCode != http.StatusOK {
		return response, errors.New(string(response.Status))
	}

	return response, nil
}
