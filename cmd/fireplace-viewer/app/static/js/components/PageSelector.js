import { dispatchPageChange } from "../events.js";

export class PageSelector extends HTMLSelectElement {
	constructor() {
		super();

		this._page = 1;
		this._numPages = parseInt(this.getAttribute("num-pages")) || 0;
	}

	connectedCallback() {
		this._render();
		this.addEventListener("change", this._onChange.bind(this));
	}

	/*****************************************************************************
	 * Properties
	 ****************************************************************************/

	get numPages() {
		return this._numPages;
	}

	set numPages(value) {
		this._numPages = value;
		this.setAttribute("num-pages", value);
		this._render();
	}

	set page(value) {
		this._page = value;
		this.options.selectedIndex = value - 1;
	}

	/*****************************************************************************
	 * Public  methods
	 ****************************************************************************/

	reset() {
		this._page = 1;
		this.options.selectedIndex = 0;
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_clearOptions() {
		for (let i = this.options.length - 1; i >= 0; i--) {
			this.options.remove(i);
		}
	}

	_onChange(e) {
		this._page = parseInt(e.target.value);
		console.log(`PageSelector._onChange(${this._page})`);
		dispatchPageChange(this._page);
	}

	_render() {
		this._clearOptions();
		this.options.add(new Option("1", "1", true, this._page === 1 ? true : false));

		for (let i = 2; i <= this._numPages; i++) {
			this.options.add(new Option(i, i, false, this._page === i ? true : false));
		}
	}
}

customElements.define("page-selector", PageSelector, { extends: "select" });
