.DEFAULT_GOAL := help
.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

VERSION=$(shell cat ./VERSION)
BUILDFLAGS=-s -w -X 'main.Version=${VERSION}'
GOENV=CGO_ENABLED=0 GOPRIVATE="github.com/app-nerds/*" GONOPROXY="github.com/app-nerds/*"
GC=${GOENV} go build -ldflags="${BUILDFLAGS}" -mod=mod -o 

#
# Local dev tasks
#

setup: ## Perform initial setup of dependencies. Requires Go 1.16+
	go mod download
	go get

generate-cert: ## Creates a self-signed SSL certificate into the assets folder
	openssl req -x509 -nodes -days 3560 -newkey rsa:2048 -keyout server.key -out server.crt -config ./assets/localhost-cert.cnf -extensions 'v3_req'
	mv *.key ./assets
	mv *.crt ./assets

bench: ## Run all benchmark tests
	go test ./... -bench=.

coverage: ## Run all unit tests and display a coverage report
	go test ./... -coverageprofile=coverageprofile.out

test: ## Run all unit tests
	go test ./...

run: ## Run the application for local development
	go run .

#
# Build tasks
#

build: ## Build an application. Usage is make APP_NAME="appname" build (e.g. make APP_NAME="fireplace-server" build)
	GOOS=linux GOARCH=amd64 cd cmd/${APP_NAME} && ${GC} ${APP_NAME}

#
# Docker tasks
#

run-docker: ## Starts all containers in Docker
	docker compose up

build-docker: ## Builds the application into a docker image
	docker compose --build

docker-tag: ## Builds a docker image and tags a release. It is then pushed up to Docker. GITHUB_TOKEN must be defined as an environment variable. Usage: make USERNAME="username" docker-tag
	docker login -u ${USERNAME} && docker build --platform linux/amd64 --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} --build-arg APP_NAME=fireplace-server --build-arg APP_PATH=./cmd/fireplace-server --tag appnerds/fireplace:linux-amd64-${VERSION} . && docker push appnerds/fireplace:linux-amd64-${VERSION}
	docker build --platform linux/amd64 --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} --build-arg APP_NAME=fireplace-viewer --build-arg APP_PATH=./cmd/fireplace-viewer --tag appnerds/fireplace-viewer:linux-amd64-${VERSION} . && docker push appnerds/fireplace-viewer:linux-amd64-${VERSION}
	docker build --platform linux/amd64 --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} --build-arg APP_NAME=fireplacelogging --build-arg APP_PATH=./cmd/fireplacelogging --tag appnerds/fireplacelogging:linux-amd64-${VERSION} . && docker push appnerds/fireplacelogging:linux-amd64-${VERSION}

