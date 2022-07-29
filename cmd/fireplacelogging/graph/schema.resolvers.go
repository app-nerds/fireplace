package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/graph/generated"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/graph/model"
	model1 "github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/internal/model"
	"gorm.io/gorm"
)

// ID is the resolver for the id field.
func (r *memberResolver) ID(ctx context.Context, obj *model1.Member) (int, error) {
	return int(obj.Model.ID), nil
}

// CreateServer is the resolver for the createServer field.
func (r *mutationResolver) CreateServer(ctx context.Context, input model.CreateServer) (*model1.Server, error) {
	var (
		queryResult *gorm.DB
	)

	newServer := &model1.Server{
		Description: input.Description,
		Password:    input.Password,
		ServerName:  input.ServerName,
		URL:         input.URL,
	}

	queryResult = r.DB.Create(newServer)

	if queryResult.Error != nil {
		return newServer, queryResult.Error
	}

	return newServer, nil
}

// GetServers is the resolver for the getServers field.
func (r *queryResolver) GetServers(ctx context.Context) ([]*model1.Server, error) {
	var (
		result      []*model1.Server
		queryResult *gorm.DB
	)

	queryResult = r.DB.Find(&result)

	if queryResult.Error != nil {
		return result, queryResult.Error
	}

	return result, nil
}

// GetVersion is the resolver for the getVersion field.
func (r *queryResolver) GetVersion(ctx context.Context) (*model.Version, error) {
	return &model.Version{
		Version: r.Config.Version,
	}, nil
}

// ID is the resolver for the id field.
func (r *serverResolver) ID(ctx context.Context, obj *model1.Server) (int, error) {
	return int(obj.Model.ID), nil
}

// Member returns generated.MemberResolver implementation.
func (r *Resolver) Member() generated.MemberResolver { return &memberResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Server returns generated.ServerResolver implementation.
func (r *Resolver) Server() generated.ServerResolver { return &serverResolver{r} }

type memberResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type serverResolver struct{ *Resolver }
