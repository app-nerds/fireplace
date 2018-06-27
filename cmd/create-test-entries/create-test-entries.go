package main

import (
	"github.com/adampresley/fireplace/cmd/fireplace-hook"
	"github.com/sirupsen/logrus"
)

func main() {
	entries := []map[string]string{
		{"level": "info", "message": "This is test message 1"},
		{"level": "info", "message": "This is test message 2"},
		{"level": "error", "message": "This is error 1"},
		{"level": "info", "message": "This is test message 3"},
		{"level": "error", "message": "This is error 2"},
	}

	logger := logrus.New().WithField("who", "Main Process")
	logger.Logger.AddHook(fireplacehook.NewFireplaceHook(&fireplacehook.FireplaceHookConfig{
		Application:  "Create Test Entries",
		FireplaceURL: "http://0.0.0.0:8999",
	}))

	for _, entry := range entries {
		if entry["level"] == "error" {
			logger.Errorf(entry["message"])
		} else {
			logger.Infof(entry["message"])
		}
	}
}
