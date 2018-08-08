export class ApplicationNameService {
	constructor() {
	}

	/**
	 * get retrieves a list of application names
	 */
	get() {
		return new Promise((resolve, reject) => {
			let options = {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			};

			fetch("/applicationname", options)
				.then(response => response.json())
				.then((result) => {
					result.unshift("All");
					return resolve(result);
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}
}