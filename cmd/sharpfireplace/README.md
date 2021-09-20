# Sharp Fireplace

**sharpfireplace** is a C# library designed to work with a Fireplace Server, and emulates **logrus** in functionality.

## Example

```csharp
var logger = FireplaceLogger.NewLogger("TestFireplaceHook", Level.Info, "http://localhost:8999", "password", null);

logger.Info("Initialized");

logger.WithFields(new Dictionary<string, object>()
{
	 { "key1", "value1" },
	 { "key2", 2 }
}).Info("Testing fields");
```

The first step is to create an instance of a logger. The class **FireplaceLogger** has a static method nmed *NewLogger*. This method takes 5 arguments.

* **Application name** - The name of the application this logger resides in. This is used in identifying who is sending logs.
* **Log level** - Minimum level to log. If the log entry being written is lower level than this minimum it isn't written. For example, if the minimum is set to **Level.Error**, then calling `logger.Info()` would not write anything to the Fireplace Server
* **Fireplace Server URL** - FQDN to a Fireplace Server.
* **Password** - The password for accessing and writing logs to this Fireplace Server
* **Fields** - Optional dictionary of key/value pairs that are included with every log entry

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

There are two logging methods for each log level. The first simply logs a message, and the second logs a formatted message with arguments, similar to how `String.Format()` works.Console.Writebb. Here are some examples.

```csharp
logger.Trace("This is a trace");
logger.Tracef("This is a {0} trace", "second");
logger.Debug("This is a debug");
logger.Debugf("This is debug #{0}", 2);
logger.Info("This is a info");
logger.Infof("{0}rd time is the {1}", 3, "charm");

// And so on...
```

## Error Context

Oftentime it is useful to add additional context when logging an error. There are two methods available for adding that context.

* WithError(string)
* WithException(exception)

`WithError()` allows the caller to record a simple string along with their message. This string is added to a field named **error**. So, for example, `logger.WithError("bad stuff").Error("Couldn't do that thing")` would log a message with a field called *error*, and its value would be `bad stuff`.

`WithException()` takes any exception class and adds two fields to your log entry: **error** and **stackTrace**. It is similar to `WithError()`, except that it puts the value of the **Message** key from the exception in your error key, and puts the stack trace into the **stackTrace** key.

## Fields

Loggers can add arbitrary information to a log entry through two methods.

* WithField(string key, string value)
* WithFields(Dictionary<string, object> fields)

Calling `WithField()` will add a key/value pair to your log entry, and `WithFields()` will add multiple key/value pairs.
