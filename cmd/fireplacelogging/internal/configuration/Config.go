package configuration

import (
	"github.com/app-nerds/configinator"
	"github.com/sirupsen/logrus"
)

type Config struct {
	AppName string
	Version string

	AutoSSLEmail       string `flag:"autosslemail" env:"AUTO_SSL_EMAIL" default:"" description:"Email address to use for Lets Encrypt"`
	AutoSSLWhitelist   string `flag:"autosslwhitelist" env:"AUTO_SSL_WHITELIST" default:"" description:"Comma-seperated list of domains for SSL"`
	DSN                string `flag:"dsn" env:"DSN" default:"host=localhost user=postgres password=password dbname=fireplacelogging port=5432" description:"DSN string to connect to a database"`
	LogLevel           string `flag:"loglevel" env:"LOG_LEVEL" default:"info" description:"Minimum log level to report"`
	ServerHost         string `flag:"serverhost" env:"SERVER_HOST" default:"localhost:8080" description:"Host and port to bind to"`
	GoogleClientID     string `flag:"googleclientid" env:"GOOGLE_CLIENT_ID" default:"" description:"Google OAuth2 client ID"`
	GoogleClientSecret string `flag:"googleclientsecret" env:"GOOGLE_CLIENT_SECRET" default:"" description:"Google OAuth2 client secret"`
	GoogleRedirectURI  string `flag:"googleredirecturi" env:"GOOGLE_REDIRECT_URI" default:"http://localhost:8080/auth/google/callback" description:"Google OAuth2 redirect URI"`
}

func NewConfig(appName, version string) *Config {
	result := Config{}
	configinator.Behold(&result)

	result.AppName = appName
	result.Version = version

	return &result
}

func (c *Config) GetLogLevel() logrus.Level {
	var (
		err      error
		loglevel logrus.Level
	)

	if loglevel, err = logrus.ParseLevel(c.LogLevel); err != nil {
		panic("invalid log level '" + c.LogLevel + "'")
	}

	return loglevel
}
