package configuration

import (
	"flag"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

type Config struct {
	Debug              bool
	FireplaceServerURL string
	Host               string
	LogLevel           logrus.Level
	ServerVersion      string
}

func setString(config *viper.Viper, name, envName, defaultValue, description string) {
	config.SetDefault(name, defaultValue)
	_ = config.BindEnv(name, envName)
	_ = flag.String(name, defaultValue, description)
}

func setBool(config *viper.Viper, name, envName string, defaultValue bool, description string) {
	config.SetDefault(name, defaultValue)
	_ = config.BindEnv(name, envName)
	_ = flag.Bool(name, defaultValue, description)
}

func NewConfig(serverVersion string) *Config {
	var (
		err      error
		loglevel logrus.Level
	)

	config := viper.New()

	setString(config, "server.host", "FIREPLACEVIEWER_SERVER_HOST", "localhost:8090", "IP and port to bind this application to")
	setString(config, "server.loglevel", "FIREPLACEVIEWER_SERVER_LOGLEVEL", "debug", "Minimum logging level")
	setBool(config, "server.debug", "FIREPLACEVIEWER_SERVER_DEBUG", true, "Set to debug mode")
	setString(config, "fireplace.url", "FIREPLACEVIEWER_FIREPLACE_URL", "http://0.0.0.0:8999", "FQDN to a Fireplace server")

	config.SetConfigName(".env")
	config.SetConfigType("env")
	config.AddConfigPath(".")
	config.AddConfigPath("/opt/fireplace-viewer")
	config.AddConfigPath("$HOME/.fireplace-viewer")

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	config.BindPFlags(pflag.CommandLine)

	err = config.ReadInConfig()
	_, fileNotFoundErr := err.(viper.ConfigFileNotFoundError)

	if err != nil && !fileNotFoundErr {
		fmt.Printf("Error reading configuration file.\n\n")
		panic(err)
	}

	if loglevel, err = logrus.ParseLevel(config.GetString("server.loglevel")); err != nil {
		fmt.Printf("Invalid loglevel\n")
		panic(err)
	}

	result := &Config{
		Debug:              config.GetBool("server.debug"),
		FireplaceServerURL: config.GetString("fireplace.url"),
		Host:               config.GetString("server.host"),
		LogLevel:           loglevel,
		ServerVersion:      serverVersion,
	}

	return result
}
