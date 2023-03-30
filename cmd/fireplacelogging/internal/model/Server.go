package model

import (
	"time"

	"github.com/app-nerds/frame"
)

type Server struct {
	ID          uint         `json:"id" db:"server_id"`
	CreatedAt   time.Time    `json:"createdAt" db:"server_created_at"`
	UpdatedAt   *time.Time   `json:"updatedAt" db:"server_updated_at"`
	DeletedAt   *time.Time   `json:"deletedAt" db:"server_deleted_at"`
	Member      frame.Member `json:"member" db:"server_member_id"`
	Description string       `json:"description" db:"server_description"`
	Password    string       `json:"password" db:"server_password"`
	ServerName  string       `json:"serverName" db:"server_name"`
	URL         string       `json:"url" db:"server_url"`
}
