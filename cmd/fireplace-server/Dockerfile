FROM golang:1.18 as builder

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
# Now build the application
#
COPY . .
RUN cd cmd/fireplace-server && make build-linux

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
COPY --from=builder /build/cmd/fireplace-server/fireplace-server .

ENTRYPOINT ["./fireplace-server"]
