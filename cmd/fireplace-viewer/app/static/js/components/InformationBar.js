import { listenForUpdateInformation, shutdownUpdateInformationListener, dispatchSetSearchCriteria } from "../events.js";

import { ApplicationSelector } from "../components/ApplicationSelector.js";
import { LevelSelector } from "../components/LevelSelector.js";
import { PageNavigator } from "../components/PageNavigator.js";
import { GeneralSearch } from "../components/GeneralSearch.js";

export class InformationBar extends HTMLElement {
	constructor() {
		super();

		this._level = "";
		this._application = "";
		this._search = "";

		this._pageNavigator = null;
		this._levelSelector = null;
		this._applicationSelector = null;
		this._generalSearch = null;
		this._resetButton = null;
	}

	async connectedCallback() {
		this._render();
		listenForUpdateInformation(this._onUpdateInformation.bind(this));
	}

	disconnectedCallback() {
		shutdownUpdateInformationListener(this._onUpdateInformation.bind(this));
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_onApplicationSelectChange(e) {
		this._application = e.target.value;
		dispatchSetSearchCriteria(this._level, this._search, this._application);
		this._pageNavigator.resetPaging();
	}

	_onLevelSelectChange(e) {
		this._level = e.target.value;
		dispatchSetSearchCriteria(this._level, this._search, this._application);
		this._pageNavigator.resetPaging();
	}

	_onResetButtonClick(e) {
		e.preventDefault();

		this._level = "";
		this._application = "";
		this._search = "";

		this._levelSelector.reset();
		this._applicationSelector.reset();
		this._generalSearch.reset();

		dispatchSetSearchCriteria(this._level, this._search, this._application);
		this._pageNavigator.resetPaging();
	}

	_onSearchChange(e) {
		this._search = e.detail;
		dispatchSetSearchCriteria(this._level, this._search, this._application);
		this._pageNavigator.resetPaging();
	}

	_onUpdateInformation(e) {
		const totalCount = e.detail.totalCount;
		const pageSize = e.detail.pageSize;
		this._pageNavigator.numPages = Math.ceil(totalCount / pageSize);
	}

	_render() {
		this._pageNavigator = new PageNavigator();
		this._pageNavigator.id = "pageNavigator";

		this._levelSelector = new LevelSelector();
		this._levelSelector.id = "levelSelect";
		this._levelSelector.addEventListener("change", this._onLevelSelectChange.bind(this));

		this._applicationSelector = new ApplicationSelector();
		this._applicationSelector.id = "applicationSelect";
		this._applicationSelector.addEventListener("change", this._onApplicationSelectChange.bind(this));

		this._generalSearch = new GeneralSearch();
		this._generalSearch.id = "generalSearch";
		this._generalSearch.addEventListener("search-changed", this._onSearchChange.bind(this));

		this._resetButton = document.createElement("button");
		this._resetButton.id = "resetButton";
		this._resetButton.innerText = "Reset";
		this._resetButton.addEventListener("click", this._onResetButtonClick.bind(this));

		this.insertAdjacentElement("beforeend", this._pageNavigator);
		this.insertAdjacentElement("beforeend", this._levelSelector);
		this.insertAdjacentElement("beforeend", this._applicationSelector);
		this.insertAdjacentElement("beforeend", this._generalSearch);
		this.insertAdjacentElement("beforeend", this._resetButton);
	}
}

customElements.define("information-bar", InformationBar);
