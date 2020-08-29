.DEFAULT_GOAL := run

# Location of UPX (https://upx.github.io)
UPX := $(shell command -v upx 2> /dev/null)

VERSION=1.1.2
BUILDFLAGS=-s -w -X 'main.Version=${VERSION}'
PROJECTNAME=fireplace-server
GCVARS=GOARCH=amd64 CGO_ENABLED=0 GOPRIVATE="github.com/app-nerds/*" GONOPROXY="github.com/app-nerds/*"
GC=${GCVARS} go build -ldflags="${BUILDFLAGS}" -tags prod -o ${PROJECTNAME}

verifydeps:
ifndef UPX
	$(error "UPX is not installed on this system. https://upx.github.io")
endif

generate: verifydeps
	go generate

build-linux: generate
	GOOS=linux ${GC} && ${UPX} ./${PROJECTNAME}

build-windows: generate
	GOOS=windows ${GC}.exe && ${UPX} ./${PROJECTNAME}.exe

build-mac: generate
	GOOS=darwin ${GC} && ${UPX} ./${PROJECTNAME}

build-docker:
	docker-compose build

run:
	go run -tags dev github.com/app-nerds/${PROJECTNAME}

run-docker:
	docker-compose -f docker-compose.yml up -d

docker-bash:
	docker exec -it ${PROJECTNAME} /bin/bash

docker-prune:
	docker image prune

