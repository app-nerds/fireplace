export async function get(url, errorMessage = "Error getting data from the server") {
	const options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};

	const response = await fetch(url, options);
	const result = await response.json();

	if (!isOK(response)) {
		console.log(result);
		throw new Error(errorMessage);
	}

	return result;
}

export function isOK(response) {
	return response.status >= 200 && response.status < 300;
}

