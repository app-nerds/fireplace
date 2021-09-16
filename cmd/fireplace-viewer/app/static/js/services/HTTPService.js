import { hasSession, getSessionToken } from "./SessionService.js";

export async function get(url, errorMessage = "Error getting data from the server") {
	if (!hasSession()) {
		window._router.navigateTo("/login");
		return;
	}

	const options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${getSessionToken()}`,
		},
	};

	const response = await fetch(url, options);
	const result = await response.json();

	if (isForbidden(response)) {
		window._router.navigateTo("/login");
		return;
	}

	if (!isOK(response)) {
		console.log(result);
		throw new Error(errorMessage);
	}

	return result;
}

export async function post(url, body, errorMessage = "Error submitting data to the server") {
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	};

	const response = await fetch(url, options);
	const result = await response.json();

	if (!isOK(response)) {
		console.log(result);
		throw new Error(errorMessage);
	}

	return result;
}

export function isForbidden(response) {
	return response.status === 403;
}

export function isOK(response) {
	return response.status >= 200 && response.status < 300;
}

