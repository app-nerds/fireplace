using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using Newtonsoft.Json;

namespace sharpfireplace
{
	public class Entry
	{
		public Logger Logger { get; set; }

		public Dictionary<string, object> Data { get; set; }
		public DateTime Time { get; set; }
		public Level Level { get; set; }
		public string Message { get; set; }

		private Mutex _lock;

		public Entry(Logger logger)
		{
			this.Logger = logger;
			this.Data = new Dictionary<string, object>();
			this.Time = default;
			this.Level = Level.Info;
			this.Message = "";

			this._lock = new Mutex();
		}

		private void fireHooks()
		{
			this.Logger.FireHooks(this);
		}

		private void log(Level level, string message)
		{
			if (this.Time == null || this.Time == default)
			{
				this.Time = DateTime.Now;
			}

			this.Level = level;
			this.Message = message;

			this.fireHooks();
			this.write();
		}

		public void Log(Level level, string format, params object[] args)
		{
			string message = String.Format(format, args);
			this.log(level, message);
		}

		public Entry WithError(string error)
		{
			return this.WithField("error", error);
		}

		public Entry WithException(Exception error)
		{
			return this.WithFields(new Dictionary<string, object>()
			{
				["error"] = error.Message,
				["stackTrace"] = error.StackTrace
			});
		}

		public Entry WithField(string key, object value)
		{
			return this.WithFields(new Dictionary<string, object>()
			{
				[key] = value
			});
		}

		public Entry WithFields(Dictionary<string, object> fields)
		{
			Dictionary<string, object> data = new Dictionary<string, object>();

			foreach (var item in this.Data)
			{
				data[item.Key] = item.Value;
			}

			foreach (var item in fields)
			{
				data[item.Key] = item.Value;
			}

			return new Entry(this.Logger)
			{
				Data = data,
				Time = this.Time,
				Level = this.Level
			};
		}

		public Entry WithTime(DateTime t)
		{
			return new Entry(this.Logger)
			{
				Data = this.Data,
				Time = t,
				Level = this.Level
			};
		}

		private void write()
		{
			this._lock.WaitOne();

			string formattedEntry = this.Logger.Formatter.Format(this);
			this.Logger.Out.WriteLine(formattedEntry);

			this._lock.ReleaseMutex();
		}

		public void Trace(string message)
		{
			this.Log(Level.Trace, message);
		}

		public void Tracef(string format, params object[] args)
		{
			this.Log(Level.Trace, format, args);
		}

		public void Debug(string message)
		{
			this.Log(Level.Debug, message);
		}

		public void Debugf(string format, params object[] args)
		{
			this.Log(Level.Debug, format, args);
		}

		public void Info(string message)
		{
			this.Log(Level.Info, message);
		}

		public void Infof(string format, params object[] args)
		{
			this.Log(Level.Info, format, args);
		}

		public void Warn(string message)
		{
			this.Log(Level.Warn, message);
		}

		public void Warnf(string format, params object[] args)
		{
			this.Log(Level.Warn, format, args);
		}

		public void Error(string message)
		{
			this.Log(Level.Error, message);
		}

		public void Errorf(string format, params object[] args)
		{
			this.Log(Level.Error, format, args);
		}

		public void Fatal(string message)
		{
			this.Log(Level.Fatal, message);
		}

		public void Fatalf(string format, params object[] args)
		{
			this.Log(Level.Fatal, format, args);
		}

		public void Panic(string message)
		{
			this.Log(Level.Panic, message);
		}

		public void Panicf(string format, params object[] args)
		{
			this.Log(Level.Panic, format, args);
		}
	}
}
