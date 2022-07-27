package graph

import (
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/configuration"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	DB     *gorm.DB
	Config *configuration.Config
}
