export class LogEntryService {
	constructor() {
	}

	getLogEntries(page, filter) {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			cache: "no-store"
		};

		console.log("In LogEntryService.getLogEntries: page == ", page, " filter == ", filter);

		let url = `/logentry?page=${page}`;

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

	hasNextPage(page, pageSize, totalCount) {
		let numPages = Math.ceil(totalCount / pageSize);
		return page < numPages;
	}

	hasPreviousPage(page) {
		return page > 1;
	}

}
