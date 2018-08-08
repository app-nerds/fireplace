.DEFAULT_GOAL := dev

prepare:
	npm run-script build
	go generate

run:
	go run *.go

dev: prepare run

prod:
	npm run-script build-prod
	go generate
	go build