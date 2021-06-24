FROM golang:1.16 as builder

ARG GITHUB_TOKEN

WORKDIR /build

#
# Setup git for accessing private repositories
#
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

#
# Cache Go dependencies
#
COPY go.mod .
COPY go.sum .
RUN GOPRIVATE="github.com/app-nerds/*" GONOPROXY="github.com/app-nerds/*" go mod download

#
# Setup and install Node, Vue, and Swaggo
#
RUN apt-get update && \
	apt-get upgrade -y

#
# Now build the application
#
COPY . .
RUN make build-linux

#
# Restore Git back to normal
#
RUN git config --global --unset url."https://${GITHUB_TOKEN}@github.com/".insteadOf

#
# Build the final image
#
FROM alpine:latest

# Change to directory for building
WORKDIR /app
COPY --from=builder /build/fireplace-server .

ENTRYPOINT ["./fireplace-server"]
