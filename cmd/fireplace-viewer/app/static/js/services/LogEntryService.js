import { get } from "./HTTPService.js";

export async function getApplicationNames() {
	let url = `/api/applicationname`;
	const result = await get(url, "Error getting application names");
	return result;
}

export async function searchLogEntries(parameters) {
	parameters.page = parameters.page || 1;
	parameters.search = parameters.search || "";
	parameters.application = parameters.application || "";
	parameters.level = parameters.level || "";

	let url = `/api/logentry?page=${parameters.page}&search=${parameters.search}&application=${parameters.application}&level=${parameters.level}`;
	const result = await get(url, "Error searching for log entries");
	return result;
}
