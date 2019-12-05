namespace sharpfireplace
{
	public class LoggerTools
	{
		public LoggerTools()
		{
		}

		public string LevelToString(Level level)
		{
			switch (level)
			{
				case Level.Debug:
					return "debug";

				case Level.Error:
					return "error";

				case Level.Fatal:
					return "fatal";

				case Level.Info:
					return "info";

				case Level.Panic:
					return "panic";

				case Level.Trace:
					return "trace";

				case Level.Warn:
					return "warn";

				default:
					return "info";
			}
		}
	}
}
