import { shortDateTime } from "../services/DateService.js";
import {
	dispatchPageChange,
	dispatchUpdateInformation,
	dispatchLogEntryClick,
	listenForPageChange,
	shutdownPageChangeListener,
	listenForSetSearchCriteria,
	shutdownSetSearchCriteriaListener,
} from "../../js/events.js";
import { searchLogEntries } from "../services/LogEntryService.js";
import { LogLevel } from "../components/LogLevel.js";

export class LogEntryTable extends HTMLElement {
	constructor() {
		super();

		this._logEntries = [];
		this._criteria = {
			page: 1,
			search: "",
			application: "",
			level: "",
		};
	}

	async connectedCallback() {
		this._render();

		listenForPageChange(this._onPageChange.bind(this));
		listenForSetSearchCriteria(this._onCriteriaChange.bind(this));

		const logEntries = await this._getLogEntries();
		this._renderTableBody(logEntries);
	}

	disconnectedCallback() {
		shutdownPageChangeListener(this._onPageChange.bind(this));
		shutdownSetSearchCriteriaListener(this._onCriteriaChange.bind(this));
	}

	/*****************************************************************************
	 * Properties
	 ****************************************************************************/

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	async _getLogEntries() {
		const result = await searchLogEntries(this._criteria);

		this._logEntries = result.logEntries;
		dispatchUpdateInformation(result.pageSize, result.totalCount, result.count);

		return result.logEntries;
	}

	_onCriteriaChange(e) {
		this._criteria.level = e.detail.level;
		this._criteria.application = e.detail.application;
		this._criteria.search = e.detail.search;

		dispatchPageChange(1);
	}

	_onLinkClick(e) {
		e.preventDefault();
		const el = e.target;
		const id = el.getAttribute("data-id");

		dispatchLogEntryClick(id, this._logEntries);
	}

	async _onPageChange(e) {
		this._criteria.page = parseInt(e.detail);
		this._rerender();
	}

	async _rerender() {
		const logEntries = await this._getLogEntries();

		this._renderTableBody(logEntries);
		this._scrollToTop();
	}

	_render() {
		let html = `
			<table>
				<thead>
					<tr>
						<th class="level-header">Level</th>
						<th class="time-header">Time</th>
						<th class="message-header">Message</th>
						<th class="application-header">Application</th>
					</tr>
				</thead>
				<tbody id="logEntryTableBody">
		`;

		html += `</tbody></table>`;
		this.innerHTML = html;
	}

	_renderTableBody(logEntries) {
		let html = "";

		const createRow = (le) => {
			let result = `<tr>
				<td class="level-column"><log-level level="${le.level}"></log-level></td>
				<td class="time-column">${shortDateTime(le.time)}</td>
				<td class="message-column"><a href="#" data-id="${le.id}">${le.message}</a></td>
				<td class="application-column">${le.application}</td>
			</tr>`;

			return result;
		};

		logEntries.forEach((le) => {
			html += createRow(le);
		});

		if (logEntries.length <= 0) {
			html = `<tr><td colspan="4">No log entries to show!</td></tr>`;
		}

		document.querySelector("#logEntryTableBody").innerHTML = html;
		const links = this.querySelectorAll(`a[data-id]`);

		[].forEach.call(links, (el) => {
			el.addEventListener("click", this._onLinkClick.bind(this));
		});
	}

	_scrollToTop() {
		document.querySelector("#logEntryTableBody").scroll(0, 0);
	}
}

customElements.define("log-entry-table", LogEntryTable);
