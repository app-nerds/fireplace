.DEFAULT_GOAL := help
.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

package: ## Packages a NuGet release. Run this before push-package
	dotnet pack --configuration Release

push-package: ## Pushes the package to Github NuGet
	dotnet nuget push "bin/Release/sharpfireplace.2.0.0.nupkg" --source "github"

