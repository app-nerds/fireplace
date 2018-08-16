import moment from "moment";
export class LogEntryService {
	constructor() {
	}

	async getLogEntries(paging, filter) {
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

		let response = await fetch(url, options);
		let result = await response.json();

		let totalCount = result.totalCount;
		let pageSize = result.pageSize;
		let logEntries = result.logEntries;

		return {
			totalCount: totalCount,
			pageSize: pageSize,
			logs: logEntries
		};
	}

	async delete(beforeDate) {
		let options = {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json"
			},
			cache: "no-store"
		};

		let response = await fetch("/logentry?fromDate=" + moment(beforeDate).format("MM/DD/YYYY"), options);
		let result = await response.text();
		return result;
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
