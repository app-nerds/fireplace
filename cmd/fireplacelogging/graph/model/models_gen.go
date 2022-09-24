// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type CreateServer struct {
	Description string `json:"description"`
	Password    string `json:"password"`
	ServerName  string `json:"serverName"`
	URL         string `json:"url"`
}

type UpdateServer struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Password    string `json:"password"`
	ServerName  string `json:"serverName"`
	URL         string `json:"url"`
}

type Version struct {
	Version string `json:"version"`
}