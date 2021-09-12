import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";
import { listenForLogEntryClick } from "../js/events.js";

import { LogEntryTable } from "../js/components/LogEntryTable.js";
import { InformationBar } from "../js/components/InformationBar.js";
import { LogEntryViewer } from "../js/components/LogEntryViewer.js";


export default class LogViewer extends BaseView {
	constructor(params) {
		super(params);

		this._logEntryViewer = null;
		this._shim = null;
	}

	async render() {
		let html = `<title>Fireplace Viewer</title>
			<information-bar id="informationBar"></information-bar>
			<log-entry-table id="logEntriesTable"></log-entry-table>

			<div is="screen-shim" id="shim"></div>
			<div is="log-entry-viewer" id="logEntryViewer"></div>
		`;

		this.innerHTML = html;
		this._logEntryViewer = document.querySelector("#logEntryViewer");
		this._shim = document.querySelector("#shim");
	}

	async afterRender() {
		listenForLogEntryClick(this._onLogEntryClick.bind(this));
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_onLogEntryClick(e) {
		this._shim.show();
		this._logEntryViewer.show(e.detail);
	}
}

customElements.define("log-viewer", LogViewer);
