using System;
using System.Collections.Generic;
using System.IO;
using sharpfireplace.Formatters;

namespace sharpfireplace
{
	public class Logger
	{
		public Formatter Formatter { get; set; }
		public List<Hook> Hooks { get; set; }
		public Level Level { get; set; }
		public TextWriter Out { get; set; }

		public Logger()
		{
			this.Formatter = new JSONFormatter();
			this.Out = Console.Out;
			this.Level = Level.Info;
			this.Hooks = new List<Hook>();
		}

		public Logger(TextWriter writer)
		{
			this.Formatter = new JSONFormatter();
			this.Out = writer;
			this.Level = Level.Info;
			this.Hooks = new List<Hook>();
		}

		public void AddHook(Hook hook)
		{
			this.Hooks.Add(hook);
		}

		public void FireHooks(Entry entry)
		{
			foreach (Hook hook in this.Hooks)
			{
				hook.Fire(entry);
			}
		}

		public bool IsLevelEnabled(Level level)
		{
			return level >= this.Level;
		}

		public Entry NewEntry()
		{
			return new Entry(this);
		}

		private void Log(Level level, string format, params object[] args)
		{
			if (this.IsLevelEnabled(level))
			{
				var entry = this.NewEntry();
				entry.Log(level, format, args);
			}
		}

		public Entry WithError(string error)
		{
			return this.NewEntry().WithError(error);
		}

		public Entry WithException(Exception error)
		{
			return this.NewEntry().WithException(error);
		}

		public Entry WithField(string key, object value)
		{
			return this.NewEntry().WithField(key, value);
		}

		public Entry WithFields(Dictionary<string, object> fields)
		{
			return this.NewEntry().WithFields(fields);
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
