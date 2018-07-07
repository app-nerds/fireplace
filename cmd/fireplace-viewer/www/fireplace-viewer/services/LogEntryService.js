export class LogEntryService {
	constructor() {
		this.page = 1;
		this.pageSize = 0;
		this.totalCount = 0;
		this.search = "";
		this.applicationName = "All";
		this.level = "";
	}

	getLogEntries() {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			cache: "no-store"
		};

		let url = `/logentry?page=${this.page}`;

		if (this.search && this.search.length > 0) {
			url += `&search=${this.search}`;
		}

		if (this.applicationName && this.applicationName.length > 0 && this.applicationName !== "All") {
			url += `&application=${this.applicationName}`;
		}

		if (this.level && this.level.length > 0 && this.level !== "") {
			url += `&level=${this.level}`;
		}

		return new Promise((resolve, reject) => {
			fetch(url, options)
				.then(response => response.json())
				.then((result) => {
					this.totalCount = result.totalCount;
					this.pageSize = result.pageSize;

					return resolve(result.logEntries);
				})
				.catch((err) => {
					console.log(err);
					return reject(err);
				});
		});
	}

	getPage() {
		return this.page;
	}

	hasNextPage() {
		let numPages = Math.ceil(this.totalCount / this.pageSize);
		return this.page < numPages;
	}

	hasPreviousPage() {
		return this.page > 1;
	}

	nextPage() {
		if (this.hasNextPage()) {
			this.page++;
			return this.getLogEntries();
		}

		return Promise.reject("There is not a next page");
	}

	previousPage() {
		if (this.hasPreviousPage()) {
			this.page--;
			return this.getLogEntries();
		}

		return Promise.reject("There is not a previous page");
	}

	refresh() {
		this.page = 1;
		return this.getLogEntries();
	}

	filterByApplication(application) {
		this.applicationName = application;
		this.page = 1;
		return this.getLogEntries();
	}

	filterByLevel(level) {
		this.level = level;
		this.page = 1;
		return this.getLogEntries();
	}

	filterBySearch(searchTerm) {
		this.search = searchTerm;
		this.page = 1;
		return this.getLogEntries();
	}
}

//window.LogEntryService = LogEntryService;