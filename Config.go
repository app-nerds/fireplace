package main

import (
	"fmt"

	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

func getConfig(version string) *viper.Viper {
	var err error

	config := viper.New()

	config.Set("version", version)

	config.SetDefault("server.host", "0.0.0.0:8999")
	config.BindEnv("server.host", "FIREPLACE_SERVER_HOST")
	pflag.String("server.host", "0.0.0.0:8999", "Host and port to bind to")

	config.SetDefault("server.loglevel", "debug")
	config.BindEnv("server.loglevel", "FIREPLACE_SERVER_LOGLEVEL")
	pflag.String("server.loglevel", "debug", "Log level. debug,info,error")

	config.SetDefault("database.url", "mongodb://localhost:27017")
	config.BindEnv("database.url", "FIREPLACE_DATABASE_URL")
	pflag.String("database.url", "mongodb://localhost:27017", "Database URL")

	config.BindPFlags(pflag.CommandLine)

	config.SetConfigName(".env")
	config.SetConfigType("env")
	config.AddConfigPath(".")
	config.AddConfigPath("/opt/fireplace-server")
	config.AddConfigPath("$HOME/.fireplace-server")

	if err = config.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			fmt.Printf("Error reading configuration file. Stack and error below:\n\n")
			panic(err)
		}
	}

	return config
}
