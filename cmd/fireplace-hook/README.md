# Fireplace Logrus Hook

This package provides a hook to Fireplace for the [Logrus](https://github.com/sirupsen/logrus) logger.

## Example

```go
package main

import (
	"github.com/sirupsen/logrus"
	"github.com/app-nerds/fireplace/v2/cmd/fireplace-hook"
)

func main() {
	logger := logrus.New().WithFields(nil)

	logger.Logger.AddHook(fireplacehook.NewFireplaceHook(&fireplacehook.FireplaceHookConfig{
		Application:  "Testing",
		FireplaceURL: "http://localhost:8999",
		Password:     "password",
	}))

	logger.Info("Initialized");

	logger.WithFields(logrus.Fields{
		"key1": "value1",
		"key2": 2,
	}).Info("Testing fields");
}
```

The first step is to create an instance of a logger entry. You do this by using the logrus **New()** method, followed by calling **WithFields**. If you want to setup additional fields that always get logged here is where you can add `logrus.Fields`. Otherwise, pass nil. Once you have the logger created you'll need to add the hook. This is done by calling `AddHook` against the root logger.

Once you have a logger instance, you can call any of the logging methods for the level of severity you wish to log. So, of you want to log information, call `logger.Info()`. If you wanted to log an error, you would call `logger.Error()`, and so on.

## Log Levels

There are 7 log levels.

* Trace
* Debug
* Info
* Warn
* Error
* Fatal
* Panic

## Logging Methods

There are two logging methods for each log level. The first simply logs a message, and the second logs a formatted message with arguments, similar to how `fmt.Printf` works. Here are some examples.

```csharp
logger.Trace("This is a trace");
logger.Tracef("This is a %s trace", "second");
logger.Debug("This is a debug");
logger.Debugf("This is debug #%d", 2);
logger.Info("This is a info");
logger.Infof("%drd time is the %s", 3, "charm");

// And so on...
```

## Error Context

Oftentime it is useful to add additional context when logging an error. 

* WithError(err error)

`WithError()` allows the caller to record an error along with their message. This error is added to a field named **error**. So, for example, `logger.WithError(fmt.Errorf("bad stuff")).Error("Couldn't do that thing")` would log a message with a field called *error*, and its value would be `bad stuff`.

## Fields

Loggers can add arbitrary information to a log entry through two methods.

* WithField(key string, value string)
* WithFields(fields map[string]interface{})

Calling `WithField()` will add a key/value pair to your log entry, and `WithFields()` will add multiple key/value pairs.

