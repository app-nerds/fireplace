import { getApplicationNames } from "../services/LogEntryService.js";

export class ApplicationSelector extends HTMLSelectElement {
	constructor() {
		super();
	}

	async connectedCallback() {
		await this._render();
	}

	/*****************************************************************************
	 * Public methods
	 ****************************************************************************/

	reset() {
		this.selectedIndex = 0;
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	async _getApplicationNames() {
		const result = await getApplicationNames();
		return result;
	}

	async _render() {
		const applicationNames = await this._getApplicationNames();

		this.options.add(new Option("All Applications", "", true));

		applicationNames.forEach((a) => {
			this.options.add(new Option(a, a, false));
		});
	}
}

customElements.define("application-selector", ApplicationSelector, { extends: "select" });
