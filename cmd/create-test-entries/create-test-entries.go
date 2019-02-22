package main

import (
	"github.com/app-nerds/fireplace/cmd/fireplace-hook"
	"github.com/sirupsen/logrus"
)

func main() {
	entries := []map[string]string{
		{"level": "info", "message": "This is test message 1", "additional": "Additional 1"},
		{"level": "info", "message": "This is test message 2", "additional": "Additional 2"},
		{"level": "error", "message": "This is error 1", "additional": "Additional 3"},
		{"level": "info", "message": "This is test message 3", "additional": "Additional 4"},
		{"level": "error", "message": "This is error 2", "additional": "Additional data 5 goes here. We can have a lot of stuff..."},
	}

	logger1 := logrus.New().WithField("who", "Main Process")
	logger1.Logger.AddHook(fireplacehook.NewFireplaceHook(&fireplacehook.FireplaceHookConfig{
		Application:  "Create Test Entries 1",
		FireplaceURL: "http://0.0.0.0:8999",
	}))

	logger2 := logrus.New().WithField("who", "Main Process")
	logger2.Logger.AddHook(fireplacehook.NewFireplaceHook(&fireplacehook.FireplaceHookConfig{
		Application:  "Create Test Entries 2",
		FireplaceURL: "http://0.0.0.0:8999",
	}))

	for _, entry := range entries {
		if entry["level"] == "error" {
			logger1.WithField("additional", entry["additional"]).Errorf(entry["message"])
			logger2.WithField("additional", entry["additional"]).Errorf(entry["message"])
		} else {
			logger1.WithField("additional", entry["additional"]).Infof(entry["message"])
			logger2.WithField("additional", entry["additional"]).Infof(entry["message"])
		}
	}
}
