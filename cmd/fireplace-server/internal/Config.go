package internal

import (
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

/*
Config provides configuration information for the Fireplace server
*/
type Config struct {
	serverHost     string
	serverLogLevel logrus.Level
	serverCert     string
	pageSize       int
	databaseURL    string
}

func getString(config *viper.Viper, name, defaultValue, envName, description string) {
	config.SetDefault(name, defaultValue)
	config.BindEnv(name, envName)
	pflag.String(name, defaultValue, description)
}

func getInt(config *viper.Viper, name string, defaultValue int, envName, description string) {
	config.SetDefault(name, defaultValue)
	config.BindEnv(name, envName)
	pflag.Int(name, defaultValue, description)
}

/*
GetConfig creates a new configuration object.
*/
func GetConfig(version string) Config {
	var (
		err      error
		logLevel logrus.Level
	)

	config := viper.New()

	config.Set("version", version)

	getString(config, "server.host", "0.0.0.0:8999", "FIREPLACE_SERVER_HOST", "Host and port to bind to")
	getString(config, "server.loglevel", "debug", "FIREPLACE_SERVER_LOGLEVEL", "Log level. debug,info,error")
	getString(config, "server.cert", "", "FIREPLACE_SERVER_CERT", "Filename (no extension) for SSL cert")
	getInt(config, "pagesize", 100, "PAGE_SIZE", "Number of items to return per page")
	getString(config, "database.url", "mongodb://localhost:27017", "FIREPLACE_DATABASE_URL", "Database URL")

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

	logLevelString := config.GetString("server.loglevel")

	if logLevel, err = logrus.ParseLevel(logLevelString); err != nil {
		panic("Invalid log level in configuration")
	}

	result := Config{
		serverHost:     config.GetString("server.host"),
		serverLogLevel: logLevel,
		serverCert:     config.GetString("server.cert"),
		pageSize:       config.GetInt("pagesize"),
		databaseURL:    config.GetString("database.url"),
	}

	return result
}

/*
GetServerHost returns this Fireplace server's configured host and port
*/
func (c Config) GetServerHost() string {
	return c.serverHost
}

/*
GetServerLogLevel returns this Fireplace server's configured minimum log level
*/
func (c Config) GetServerLogLevel() logrus.Level {
	return c.serverLogLevel
}

/*
GetServerCert returns this Fireplace server's configured SSL certificate file name
*/
func (c Config) GetServerCert() string {
	return c.serverCert
}

/*
GetPageSize returns this Fireplace server's configured page size for
retrieving records.
*/
func (c Config) GetPageSize() int {
	return c.pageSize
}

/*
GetDatabaseURL returns this Firepalce server's configured MongoDB URL.
*/
func (c Config) GetDatabaseURL() string {
	return c.databaseURL
}
