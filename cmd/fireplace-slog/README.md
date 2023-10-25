# Fireplace slog Hook

With version 1.21, Go introduced a native structured logging solution in the package `'log/slog'`. This component provides a custom handler that allows you to use the standard slog package to write logs both to STDOUT and Fireplace.

## 🚀 Getting Started

Here is an example of setting up Fireplace as your default logger.

```go
import (
	"fmt"
	"log/slog"
	"time"

	fireplaceslog "github.com/app-nerds/fireplace/v2/cmd/fireplace-slog"
	"github.com/app-nerds/inlingo/internal/configuration"
	"gorm.io/gorm/logger"
)

func main() {
    setupLogger("v1.0.1", "http://localhost:8999", "password")

    slog.Info("Welcome to using structured logging in Go using slog!")
}

func setupLogger(version, fireplaceURL, fireplacePassword string) {
	handler := fireplaceslog.NewFireplaceHandler(fireplaceslog.HandlerConfig{
		Application:      "test-application",
		ConsoleLogFormat: fireplaceslog.TextFormat,
		FireplaceURL:     fireplaceURL,
		Level:            slog.LevelInfo,
		Password:         fireplacePassword,
	})

    handler = handler.WithAttrs([]slog.Attr{
        slog.String("version", version),
    })

	logger := slog.New(handler)
	slog.SetDefault(logger)
}
```

In this example we set up the Fireplace Handler as the handler for a slog logger, and make it the default logger. Because of this direct calls against the global slog methods will use Fireplace, AND it will output to STDOUT in the format provided in `ConsoleLogFormat`.
