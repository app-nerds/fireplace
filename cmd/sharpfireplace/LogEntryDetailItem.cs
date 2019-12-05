namespace sharpfireplace
{
	public class LogEntryDetailItem
	{
		public string Key { get; set; }
		public string Value { get; set; }

		public LogEntryDetailItem()
		{
			this.Key = "";
			this.Value = "";
		}

		public LogEntryDetailItem(string key, string value)
		{
			this.Key = key;
			this.Value = value;
		}
	}
}
