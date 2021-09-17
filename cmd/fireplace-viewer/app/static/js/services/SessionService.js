import { post } from "./HTTPService.js";

export function hasSession() {
	return !!getSessionToken();
}

export function getSessionToken() {
	return localStorage.getItem("token");
}

export function setSessionToken(token) {
	localStorage.setItem("token", token);
}

export async function validatePassword(password) {
	let response = await post(`/login`, { password: password }, "Unable to log in. Please check your password and try again.");
	return response;
}

