import { PageSelector } from "./PageSelector.js";
import { dispatchPageChange } from "../events.js";

export class PageNavigator extends HTMLElement {
	constructor() {
		super();

		this._page = 1;
		this._numPages = 0;

		this._pageSelector = null;
		this._previousButton = null;
		this._nextButton = null;
	}

	connectedCallback() {
		this._render();
	}

	/*****************************************************************************
	 * Properties
	 ****************************************************************************/

	get numPages() {
		return this._numPages;
	}

	set numPages(value) {
		this._numPages = value;
		this._pageSelector.numPages = value;
		this._setButtonDisabledState();
	}

	get page() {
		return this._page;
	}

	set page(value) {
		this._page = value;
		this._pageSelector.page = value;
		this._setButtonDisabledState();
	}

	/*****************************************************************************
	 * Public  methods
	 ****************************************************************************/

	resetPaging() {
		this._page = 1;
		this._pageSelector.reset();
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_onPageSelectorChange(e) {
		this._page = e.target.value;
		this._setButtonDisabledState();
	}

	_onPreviousClick(e) {
		e.stopPropagation();
		e.preventDefault();
		let target = e.target;

		/*
		 * If the target of the click is the icon, change it
		 * to the button itself.
		 */
		if (target.classList.contains("fas")) {
			target = target.parentElement;
		}

		/*
		 * Get the page we are going to and dispatch
		 * an event.
		 */
		this._page--;
		this._pageSelector.page = this._page;
		this._setButtonDisabledState();

		dispatchPageChange(this._page);
	}

	_onNextClick(e) {
		e.stopPropagation();
		e.preventDefault();
		let target = e.target;

		/*
		 * If the target of the click is the icon, change it
		 * to the button itself.
		 */
		if (target.classList.contains("fas")) {
			target = target.parentElement;
		}

		/*
		 * Get the page we are going to and dispatch
		 * an event.
		 */
		this._page++;
		this._pageSelector.page = this._page;
		this._setButtonDisabledState();

		dispatchPageChange(this._page);
	}

	_render() {
		this._previousButton = document.createElement("button");
		this._previousButton.type = "button";
		this._previousButton.setAttribute("aria-label", "Go to previous page");
		this._previousButton.id = "previousPageButton";
		this._previousButton.disabled = true;
		this._previousButton.innerHTML = `<img src="/static/css/fontawesome/backward-solid.svg" alt="Back one page"/>`;
		this._previousButton.addEventListener("click", this._onPreviousClick.bind(this));

		this._nextButton = document.createElement("button");
		this._nextButton.type = "button";
		this._nextButton.setAttribute("aria-label", "Go to next page");
		this._nextButton.id = "nextPageButton";
		this._nextButton.disabled = true;
		this._nextButton.innerHTML = `<img src="/static/css/fontawesome/forward-solid.svg" alt="Forward one page"/>`;
		this._nextButton.addEventListener("click", this._onNextClick.bind(this));

		this._pageSelector = new PageSelector();
		this._pageSelector.id = "pageSelect";
		this._pageSelector.setAttribute("aria-label", "Change page");
		this._pageSelector.addEventListener("change", this._onPageSelectorChange.bind(this));

		this.insertAdjacentElement("beforeend", this._previousButton);
		this.insertAdjacentElement("beforeend", this._pageSelector);
		this.insertAdjacentElement("beforeend", this._nextButton);
	}

	_setButtonDisabledState() {
		this._previousButton.disabled = this._page > 1 ? false : true;
		this._nextButton.disabled = this._page < this._numPages ? false : true;
	}
}

customElements.define("page-navigator", PageNavigator);
