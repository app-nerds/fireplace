FROM golang:1.15 as builder

ARG accesstoken

WORKDIR /build
COPY . .

RUN git config --global url."https://${accesstoken}@github.com/".insteadOf "https://github.com/"
RUN apt-get update && apt-get install -y upx && \
	make build-linux
RUN git config --global --unset url."https://${accesstoken}@github.com/".insteadOf

FROM alpine:latest

RUN apk add --no-cache bash coreutils grep

# Change to directory for building
WORKDIR /app
COPY --from=builder /build/fireplace-server .

ENTRYPOINT ["./fireplace-server"]


