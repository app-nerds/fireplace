.DEFAULT_GOAL := help
.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

VERSION=$(shell cat ./VERSION)
BUILDFLAGS=-s -w -X 'main.Version=${VERSION}'
PROJECTNAME=fireplace-server
GOENV=CGO_ENABLED=0 GOPRIVATE="github.com/app-nerds/*" GONOPROXY="github.com/app-nerds/*"
GC=${GOENV} go build -ldflags="${BUILDFLAGS}" -mod=mod -o ${PROJECTNAME}

ifeq ($(OS),Windows_NT)
	GOOS=windows
	ifeq ($(PROCESSOR_ARCHITEW6432),AMD64)
		GOARCH=amd64
	else
		ifeq ($(PROCESSOR_ARCHITECTURE),AMD64)
			GOARCH=amd64
		endif
		ifeq ($(PROCESSOR_ARCHITECTURE),x86)
			GOARCH=x86
		endif
	endif
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		GOOS=linux
	endif
	ifeq ($(UNAME_S),Darwin)
		GOOS=darwin
	endif
	UNAME_P := $(shell uname -p)
	ifeq ($(UNAME_P),x86_64)
		GOARCH=amd64
	endif
	ifneq ($(filter %86,$(UNAME_P)),)
		GOARCH=x86
   endif
   ifneq ($(filter arm%,$(UNAME_P)),)
      GOARCH=arm64
   endif
endif

#
# Local dev tasks
#

setup: ## Perform initial setup of dependencies. Requires Go 1.16 
	go mod download
	go get

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

build: ## Automatically determine OS and Architecture, and build an executable
	GOOS=${GOOS} GOARCH=${GOARCH} ${GC}

build-windows: ## Create a compiled Windows binary
	GOOS=windows GOARCH=amd64 ${GC}.exe

build-mac: ## Create a compiled MacOS binary (arm64)
	GOOS=darwin GOARCH=arm64 ${GC}

build-mac-amd: ## Create a compiled MacOS binary (amd64)
	GOOS=darwin GOARCH=amd64 ${GC}

build-linux: ## Create a compiled Linux binary (amd64)
	GOOS=linux GOARCH=amd64 ${GC}

build-all: ## Build all architectures
	GOOS=windows GOARCH=amd64 ${GC}-windows-${VERSION}.exe
	GOOS=darwin GOARCH=arm64 ${GC}-darwin-arm64-${VERSION}
	GOOS=darwin GOARCH=amd64 ${GC}-darwin-${VERSION}
	GOOS=linux GOARCH=amd64 ${GC}-linux-${VERSION}

package: ## Package executables into a ZIP file
	zip  ./{{.AppName}}-linux-amd64-${VERSION}.zip ./*linux*
	zip  ./{{.AppName}}-darwin-${VERSION}.zip ./*darwin*
	zip ./{{.AppName}}-windows-amd64-${VERSION}.zip ./*windows*

#
# Docker tasks
#

start-mongo: ## Starts a MongoDB server in Docker
	docker-compose -f docker-compose.yml up mongo

run-docker: ## Starts all containers in Docker
	docker-compose -f docker-compose.yml up

build-docker: ## Builds the application into a docker image
	docker-compose build

docker-tag: ## Builds a docker image and tags a release. It is then pushed up to Docker. GITHUB_TOKEN must be defined as an environment variable. Usage: make USERNAME="username" docker-tag
	docker login -u ${USERNAME} && docker build --platform linux/amd64 --build-arg GITHUB_TOKEN=${GITHUB_TOKEN} --tag fireplace:${VERSION} . && docker tag fireplace:${VERSION} appnerds/fireplace:${VERSION} && docker push appnerds/fireplace:${VERSION}

