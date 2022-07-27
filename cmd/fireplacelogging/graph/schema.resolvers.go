package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/graph/generated"
	"github.com/app-nerds/fireplace/v2/cmd/fireplacelogging/graph/model"
)

// GetVersion is the resolver for the getVersion field.
func (r *queryResolver) GetVersion(ctx context.Context) (*model.Version, error) {
	return &model.Version{
		Version: r.Config.Version,
	}, nil
}

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type queryResolver struct{ *Resolver }
