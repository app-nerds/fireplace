export class ApplicationNameService {
	constructor() {
	}

	/**
	 * get retrieves a list of application names
	 */
	async get() {
		let options = {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		};

		let response = await fetch("/applicationname", options);
		let result = await response.json();

		result.unshift("All");
		return result;
	}
}