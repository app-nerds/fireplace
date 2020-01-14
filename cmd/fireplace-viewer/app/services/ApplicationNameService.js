export class ApplicationNameService {
	constructor($http) {
		this.$http = $http;
	}

	/**
	 * get retrieves a list of application names
	 */
	async get() {
		let response = await this.$http.get("/applicationname");
		return response.body;
	}
}

export function ApplicationNameServiceInstaller(Vue) {
	Vue.prototype.applicationNameService = new ApplicationNameService(Vue.http);
}

