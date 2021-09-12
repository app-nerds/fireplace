import { longDateTime } from "../services/DateService.js";
import { LogLevel } from "../components/LogLevel.js";

export class LogEntryViewer extends HTMLDivElement {
	constructor() {
		super();

		this._logEntryMessage = null;
		this._logEntryTime = null;
		this._logEntryLevel = null;
		this._logEntryTableBody = null;
	}

	connectedCallback() {
		this._render();
	}

	/*****************************************************************************
	 * Public methods
	 ****************************************************************************/

	hide() {
		document.querySelector("#shim").hide();
		this.style.visibility = "hidden";
	}

	show(logEntry) {
		document.querySelector(".shim").style.visibility = "visible";

		this._logEntryMessage.innerText = logEntry.message;
		this._logEntryTime.innerText = longDateTime(logEntry.time);
		this._logEntryLevel.level = logEntry.level;

		this._logEntryTableBody.innerHTML = "";

		let html = ``;

		for (let i = 0; i < logEntry.details.length; i++) {
			html += `<tr>
				<td>${logEntry.details[i].key}</td>
				<td>${logEntry.details[i].value}</td>
			</tr>`;
		}

		this._logEntryTableBody.innerHTML = html;
		this.style.visibility = "visible";
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_render() {
		let html = `
			<button class="closeButton">ⅹ</button>

			<section>
				<span class="logEntryLabel">Message:</span> <span id="logEntryMessage"></span>
			</section>
			<section>
				<span class="logEntryLabel">Time:</span> <span id="logEntryTime"></span>
			</section>
			<section>
				<span class="logEntryLabel">Level:</span> <log-level id="logEntryLevel" level="info" show-label="true"></log-level>
			</section>

			<section>
				<table>
					<thead>
						<tr>
							<th>Key</th>
							<th>Value</th>
						</tr>
					</thead>
					<tbody id="viewLogEntryTableBody">
					</tbody>
				</table>
			</section>

			<nav>
				<button type="button">Close</button>
			</nav>
		`;

		this.innerHTML = html;

		this._logEntryMessage = document.querySelector("#logEntryMessage");
		this._logEntryLevel = document.querySelector("#logEntryLevel");
		this._logEntryTime = document.querySelector("#logEntryTime");
		this._logEntryTableBody = document.querySelector("#viewLogEntryTableBody");

		this.querySelector(".closeButton").addEventListener("click", this.hide.bind(this));
		this.querySelector(`button[type="button"`).addEventListener("click", this.hide.bind(this));
	}
}

customElements.define("log-entry-viewer", LogEntryViewer, { extends: "div" });
