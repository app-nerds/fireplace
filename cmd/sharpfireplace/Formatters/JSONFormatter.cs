using System.Collections.Generic;
using Newtonsoft.Json;

namespace sharpfireplace.Formatters
{
	public class JSONFormatter : Formatter
	{
		private LoggerTools tools;

		public JSONFormatter()
		{
			this.tools = new LoggerTools();
		}

		public string Format(Entry entry)
		{
			Dictionary<string, string> result = new Dictionary<string, string>();

			result.Add("level", this.tools.LevelToString(entry.Level));
			result.Add("time", entry.Time.ToString("yyyy-MM-ddTHH\\:mm\\:sszzz"));
			result.Add("message", entry.Message);

			foreach (var item in entry.Data)
			{
				result[item.Key] = item.Value.ToString();
			}

			return JsonConvert.SerializeObject(result);
		}
	}
}
