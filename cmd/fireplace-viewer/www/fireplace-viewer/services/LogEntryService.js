export class LogEntryService {
	constructor() {
	}

	getLogEntries(paging, filter) {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			cache: "no-store"
		};

		let url = `/logentry?page=${paging.page}`;

		if (filter.searchTerm && filter.searchTerm.length > 0) {
			url += `&search=${filter.searchTerm}`;
		}

		if (filter.application && filter.application.length > 0 && filter.application !== "All") {
			url += `&application=${filter.application}`;
		}

		if (filter.level && filter.level.length > 0 && filter.level !== "") {
			url += `&level=${filter.level}`;
		}

		return new Promise((resolve, reject) => {
			fetch(url, options)
				.then(response => response.json())
				.then((result) => {
					let totalCount = result.totalCount;
					let pageSize = result.pageSize;
					let logEntries = result.logEntries;

					return resolve({
						totalCount: totalCount,
						pageSize: pageSize,
						logs: logEntries
					});
				})
				.catch((err) => {
					console.log(err);
					return reject(err);
				});
		});
	}

	hasNextPage(paging) {
		return paging.page < this.getNumPages(paging);
	}

	hasPreviousPage(paging) {
		return paging.page > 1;
	}

	getLastPage(paging) {
		return this.getNumPages(paging);
	}

	getNumPages(paging) {
		return Math.ceil(paging.totalCount / paging.pageSize);
	}
}
