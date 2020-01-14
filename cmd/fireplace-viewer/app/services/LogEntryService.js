export class LogEntryService {
	constructor($http) {
		this.$http = $http;
	}

	async getLogEntry(id) {
		let url = `/logentry/${id}`;
		let response = await this.$http.get(url);

		return response.body;
	}

	async getLogEntries(page, filter) {
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

		let response = await this.$http.get(url);
		let result = response.body;

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
		let response = await this.$http.delete(`/logentry?fromDate=${moment(beforeDate).format("MM/DD/YYYY")}`);
		return response.body;
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

export function LogEntryServiceInstaller(Vue) {
	Vue.prototype.logEntryService = new LogEntryService(Vue.http);
}
