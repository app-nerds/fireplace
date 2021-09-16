package internal

import (
	"flag"
	"fmt"
	"strings"

	"github.com/sirupsen/logrus"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

/*
Config provides configuration information for the Fireplace Viewer
*/
type Config struct {
	FireplaceServerURL      string `mapstructure:"FIREPLACEVIEWER_FIREPLACE_URL"`
	FireplaceServerPassword string `mapstructure:"FIREPLACEVIEWER_FIREPLACE_PASSWORD"`
	Host                    string `mapstructure:"FIREPLACEVIEWER_SERVER_HOST"`
	Cert                    string `mapstructure:"FIREPLACEVIEWER_SERVER_CERT"`
	ServerPassword          string `mapstructure:"FIREPLACEVIEWER_SERVER_PASSWORD"`
	JWTSecret               string `mapstructure:"FIREPLACEVIEWER_JWT_SECRET"`
	LogLevel                logrus.Level
	Version                 string
}

func getString(name, defaultValue, description string) {
	viper.SetDefault(name, defaultValue)
	_ = flag.String(name, defaultValue, description)
}

func getBool(name string, defaultValue bool, description string) {
	viper.SetDefault(name, defaultValue)
	_ = flag.Bool(name, defaultValue, description)
}

/*
GetConfig creates a new configuration object
*/
func GetConfig(version string) Config {
	var (
		err      error
		logLevel logrus.Level
		result   Config
	)

	getString("FIREPLACEVIEWER_SERVER_HOST", "localhost:8090", "IP and port to bind this application to")
	getString("FIREPLACEVIEWER_SERVER_LOGLEVEL", "debug", "Minimum logging level")
	getString("FIREPLACEVIEWER_FIREPLACE_URL", "http://0.0.0.0:8999", "FQDN to a Fireplace server")
	getString("FIREPLACEVIEWER_FIREPLACE_PASSWORD", "password", "Password to connect to the Fireplace Server")
	getString("FIREPLACEVIEWER_SERVER_CERT", "", "File name (no extension) of the SSL certifiate")
	getString("FIREPLACEVIEWER_SERVER_PASSWORD", "password", "Password to access the Viewer")
	getString("FIREPLACEVIEWER_JWT_SECRET", "password", "Password and salt used to encrypt JWT tokens")

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine)

	viper.SetConfigFile(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AddConfigPath("/opt/fireplace-viewer")
	viper.AddConfigPath("$HOME/.fireplace-viewer")
	viper.AutomaticEnv()

	if err = viper.ReadInConfig(); err != nil && !strings.Contains(err.Error(), "no such file") {
		fmt.Printf("Error reading configuration file. Stack and error below:\n\n")
		panic(err)
	}

	if err = viper.Unmarshal(&result); err != nil {
		panic(err)
	}

	logLevelString := viper.GetString("FIREPLACEVIEWER_SERVER_LOGLEVEL")
	if logLevel, err = logrus.ParseLevel(logLevelString); err != nil {
		panic("Invalid log level in configuration")
	}

	result.Version = version
	result.LogLevel = logLevel

	return result
}
