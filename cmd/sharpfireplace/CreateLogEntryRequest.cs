using System.Collections.Generic;
using Newtonsoft.Json;

namespace sharpfireplace
{
	public class CreateLogEntryRequest
	{
		[JsonProperty("application")]
		public string Application { get; set; }
		[JsonProperty("details")]
		public List<LogEntryDetailItem> Details { get; set; }
		[JsonIgnore]
		public string ID { get; set; }
		[JsonProperty("level")]
		public string Level { get; set; }
		[JsonProperty("message")]
		public string Message { get; set; }
		[JsonProperty("time")]
		public string Time { get; set; }

		public CreateLogEntryRequest()
		{
			this.Application = "";
			this.Details = new List<LogEntryDetailItem>();
			this.ID = "";
			this.Level = "info";
			this.Message = "";
			this.Time = "";
		}
	}
}
