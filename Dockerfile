# Start from golang base image
FROM golang:1.20-alpine as builder

# Path to application to build
ARG APP_PATH

# App name
ARG APP_NAME

# Github token
ARG GITHUB_TOKEN

# Dependencies
RUN apk --no-cache add ca-certificates git make

WORKDIR /build 

#
# Setup git for accessing private repositories
#
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

# Copy go.mod, go.sum files and download deps
COPY go.mod go.sum ./
RUN go mod download

# Copy sources to the working directory
COPY . .

# Build the Go app
RUN echo "Building app ${APP_NAME} in ${APP_PATH}"
RUN make APP_NAME="${APP_NAME}" build

# Start a new stage from alpine
FROM scratch

ARG APP_PATH
ARG APP_NAME 

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /build/database-migrations/* /database-migrations/
COPY --from=builder /build/cmd/$APP_NAME/$APP_NAME /server

# Run the executable
ENTRYPOINT ["/server"]
