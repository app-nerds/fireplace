.DEFAULT_GOAL := run

# Location of UPX (https://upx.github.io)
UPX := $(shell command -v upx 2> /dev/null)

BUILDFLAGS=-s -w
GC=go build -tags prod -ldflags "${BUILDFLAGS}"
PROJNAME=fireplace-server

verifydeps:
ifndef UPX
	$(error "UPX is not installed on this system. https://upx.github.io")
endif

generate: verifydeps
	go generate

run:
	go run -tags dev github.com/app-nerds/fireplace/cmd/${PROJNAME}

test:
	go test ./...

build-windows: generate
	GOOS=windows GOARCH=amd64 ${GC} -o ${PROJNAME}.exe && ${UPX} ./${PROJNAME}.exe

build-mac: generate
	GOOS=darwin GOARCH=amd64 ${GC} -o ${PROJNAME}  && ${UPX} ./${PROJNAME}

build-linux: generate
	GOOS=linux GOARCH=amd64 ${GC} -o ${PROJNAME} && ${UPX} ./${PROJNAME}

