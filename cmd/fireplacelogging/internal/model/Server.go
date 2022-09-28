package model

import "gorm.io/gorm"

type Server struct {
	gorm.Model

	Description string `json:"description"`
	Password    string `json:"password"`
	ServerName  string `json:"serverName"`
	URL         string `json:"url"`
}
