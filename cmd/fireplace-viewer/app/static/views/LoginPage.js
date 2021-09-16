import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";
import { validatePassword, setSessionToken } from "../js/services/SessionService.js";

export default class LoginPage extends BaseView {
	constructor(params) {
		super(params);
	}

	async render() {
		this._render();

		document.querySelector("#frmLogin").addEventListener("submit", async (e) => {
			e.preventDefault();

			const passwordEl = document.querySelector("#password");
			let password = passwordEl.value;

			try {
				let response = await validatePassword(password);
				setSessionToken(response.token);

				this.navigateTo("/");
			} catch (e) {
				this.displayErrorMessage(e);
				passwordEl.focus();
			}
		});

		document.querySelector("#password").focus();
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_render() {
		let html = `<title>Fireplace Viewer - Login</title>
			<form id="frmLogin" class="login-container">
				<label for="password">Password:</label>
				<input type="password" id="password" maxlength="50" />
				<button type="submit" id="btnSubmit">Login</button>
			</form>
		`;

		this.innerHTML = html;
	}
}

customElements.define("login-page", LoginPage);
