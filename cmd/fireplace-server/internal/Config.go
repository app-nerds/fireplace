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
Config provides configuration information for the Fireplace server
*/
type Config struct {
	Version     string
	Host        string `mapstructure:"FIREPLACE_SERVER_HOST"`
	LogLevel    logrus.Level
	Cert        string `mapstructure:"FIREPLACE_SERVER_CERT"`
	Password    string `mapstructure:"FIREPLACE_SERVER_PASSWORD"`
	PageSize    int    `mapstructure:"FIREPLACE_PAGE_SIZE"`
	DatabaseURL string `mapstructure:"FIREPLACE_DATABASE_URL"`
}

func getString(name, defaultValue, description string) {
	viper.SetDefault(name, defaultValue)
	_ = flag.String(name, defaultValue, description)
}

func getInt(name string, defaultValue int, description string) {
	viper.SetDefault(name, defaultValue)
	_ = flag.Int(name, defaultValue, description)
}

/*
GetConfig creates a new configuration object.
*/
func GetConfig(version string) Config {
	var (
		err      error
		logLevel logrus.Level
		result   Config
	)

	getString("FIREPLACE_SERVER_HOST", "localhost:8999", "Host and port to bind to")
	getString("FIREPLACE_SERVER_LOGLEVEL", "debug", "Log level. debug,info,error")
	getString("FIREPLACE_SERVER_CERT", "", "Filename (no extension) for SSL cert")
	getString("FIREPLACE_SERVER_PASSWORD", "password", "Password for writing and reading from Fireplace Server")
	getInt("FIREPLACE_PAGE_SIZE", 100, "Number of items to return per page")
	getString("FIREPLACE_DATABASE_URL", "mongodb://localhost:27017", "Database URL")

	pflag.CommandLine.AddGoFlagSet(flag.CommandLine)
	pflag.Parse()
	viper.BindPFlags(pflag.CommandLine)

	viper.SetConfigFile(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AddConfigPath("/opt/fireplace-server")
	viper.AddConfigPath("$HOME/.fireplace-server")
	viper.AutomaticEnv()

	if err = viper.ReadInConfig(); err != nil && !strings.Contains(err.Error(), "no such file") {
		fmt.Printf("Error reading configuration file. Stack and error below:\n\n")
		panic(err)
	}

	if err = viper.Unmarshal(&result); err != nil {
		panic(err)
	}

	logLevelString := viper.GetString("FIREPLACE_SERVER_LOGLEVEL")
	if logLevel, err = logrus.ParseLevel(logLevelString); err != nil {
		panic("Invalid log level in configuration")
	}

	result.Version = version
	result.LogLevel = logLevel

	return result
}
