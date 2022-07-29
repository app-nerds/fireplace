package model

import "gorm.io/gorm"

type Server struct {
	gorm.Model

	Description string `json:"description"`
	Password    string `json:"password"`
	ServerName  string `json:"server_name"`
	URL         string `json:"url"`
}
