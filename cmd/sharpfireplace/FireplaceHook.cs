using System.Collections.Generic;
using RestSharp;

namespace sharpfireplace
{
	public class FireplaceHook : Hook
	{
		private IRestClient client;
		private FireplaceHookConfig config;
		private LoggerTools tools;

		public FireplaceHook(FireplaceHookConfig config)
		{
			this.config = config;
			this.client = new RestClient(this.config.FireplaceURL);
			this.tools = new LoggerTools();
		}

		public void Fire(Entry entry)
		{
			CreateLogEntryRequest request = new CreateLogEntryRequest()
			{
				Application = this.config.Application,
				Level = this.tools.LevelToString(entry.Level),
				Time = entry.Time.ToString("yyyy-MM-ddTHH\\:mm\\:sszzz"),
				Message = entry.Message,
				Details = this.convertDataToDetailList(entry.Data)
			};

			this.send(request);
		}

		private List<LogEntryDetailItem> convertDataToDetailList(Dictionary<string, object> data)
		{
			List<LogEntryDetailItem> result = new List<LogEntryDetailItem>();

			foreach (var item in data)
			{
				result.Add(new LogEntryDetailItem(item.Key, item.Value.ToString()));
			}

			return result;
		}

		private void send(CreateLogEntryRequest createRequest)
		{
			//var request = new RestRequest("/logentry", Method.POST, DataFormat.Json);
			var request = new RestRequest("/logentry", Method.POST);
			request.AddHeader("Content-Type", "application/json");
			request.AddJsonBody(createRequest);

			IRestResponse response = this.client.Execute(request);
		}
	}
}
