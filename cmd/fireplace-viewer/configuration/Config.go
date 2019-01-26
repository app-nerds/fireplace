package configuration

import "flag"

type Config struct {
	Debug              bool
	FireplaceServerURL string
	Host               string
	LogLevel           string
	ServerVersion      string
}

func NewConfig(serverVersion string) *Config {
	result := &Config{
		ServerVersion: serverVersion,
	}

	flag.BoolVar(&result.Debug, "debug", false, "True to enable debug")
	flag.StringVar(&result.FireplaceServerURL, "serverurl", "http://0.0.0.0:8999", "Full HTTP address to a Fireplace Server instance")
	flag.StringVar(&result.Host, "host", "0.0.0.0:8090", "Address and port to bind this server to")
	flag.StringVar(&result.LogLevel, "loglevel", "info", "Level of logs to write. Valid values are 'debug', 'info', or 'error'. Default is 'info'")

	flag.Parse()

	return result
}
