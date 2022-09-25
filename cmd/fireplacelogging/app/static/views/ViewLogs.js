/*
 * Copyright © 2022 App Nerds LLC
 */

import { BaseView, fetcher, debounce } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";
import ServerSelector from "../js/components/ServerSelector.js";
import ApplicationSelector from "../js/components/ApplicationSelector.js";
import LogLevelSelector from "../js/components/LogLevelSelector.js";
import LogEntry from "../js/components/LogEntry.js";

export default class ViewLogs extends BaseView {
  #serverIDEl;
  #applicationEl;
  #logLevelEl;
  #searchEl;
  #firstButton;
  #prevButton;
  #nextButton;
  #lastButton;

  #server;
  #application;
  #logLevel;
  #search;
  #page;
  #hasMorePages;
  #lastPage;

  constructor(params) {
    super(params);

    this.#logLevel = "";
    this.#search = "";
    this.#page = 1;
    this.#hasMorePages = false;
    this.#lastPage = 0;
  }

  async render() {
    this.innerHTML = `
      <title>View Logs | Fireplace</title>

      <div class="container">
        <h2>View Logs</h2>

        <section class="filters">
          <div>
            <label for="server">Server</label>
            <server-selector id="serverID" server-id="0"></server-selector>
          </div>

          <div>
            <label for="application">Application</label>
            <application-selector id="application" disabled="true"></application-selector>
          </div>

          <div>
            <label for="logLevel">Log Level</label>
            <log-level-selector id="logLevel" disabled="true"></log-level-selector>
          </div>

          <div>
            <label for="search">Search</label>
            <input type="text" id="search" disabled />
          </div>

          <div class="break"></div>

          <button id="btnClear"><i data-feather="refresh-cw"></i> Clear</button>
        </section>

        <section class="navigation-buttons">
          <button id="first" disabled><i data-feather="skip-back"></i> First Page</button>
          <button id="prev" disabled><i data-feather="arrow-left"></i> Previous Page</button>
          <span id="page">Page 0</span>
          <button id="next" disabled>Next Page <i data-feather="arrow-right"></i></button>
          <button id="last" disabled><i data-feather="skip-forward"></i> Last Page</button>
        </section>

        <section class="results" id="results">
        </section>
      </div>
    `;
  }

  async afterRender() {
    // Get element references
    this.#serverIDEl = document.getElementById("serverID");
    this.#applicationEl = document.getElementById("application");
    this.#logLevelEl = document.getElementById("logLevel");
    this.#searchEl = document.getElementById("search");
    this.#firstButton = document.getElementById("first");
    this.#prevButton = document.getElementById("prev");
    this.#nextButton = document.getElementById("next");
    this.#lastButton = document.getElementById("last");

    // Setup server selector
    this.#serverIDEl.graphql = this.params.graphql;
    this.#serverIDEl.addEventListener("server-selected", this.onServerSelected.bind(this));

    // Setup application selector
    this.#applicationEl.graphql = this.params.graphql;
    this.#applicationEl.addEventListener("finished-loading", this.onApplicationSelectorFinishedLoading.bind(this));
    this.#applicationEl.addEventListener("application-selected", this.onApplicationSelected.bind(this));

    // Setup log level selector
    this.#logLevelEl.addEventListener("log-level-selected", this.onLogLevelSelected.bind(this));
    this.#searchEl.addEventListener("keypress", debounce(this.onSearchKeypress.bind(this)));

    // Button events
    document.getElementById("btnClear").addEventListener("click", this.onClearClick.bind(this));
    this.#firstButton.addEventListener("click", this.onFirstClick.bind(this));
    this.#prevButton.addEventListener("click", this.onPreviousClick.bind(this));
    this.#nextButton.addEventListener("click", this.onNextClick.bind(this));
    this.#lastButton.addEventListener("click", this.onLastClick.bind(this));

    feather.replace();
  }

  /*******************************************************************************
   * Event handlers
   ******************************************************************************/

  async onServerSelected(e) {
    const serverID = e.detail;
    this.#server = await this.#getServer(serverID);

    this.#applicationEl.serverID = serverID;
  }

  onApplicationSelectorFinishedLoading() {
    this.#applicationEl.setAttribute("disabled", "false");
  }

  onApplicationSelected(e) {
    this.#application = e.detail;

    this.#logLevelEl.removeAttribute("disabled");
    this.#searchEl.removeAttribute("disabled");

    this.#logLevelEl.reset();
    this.#searchEl.value = "";

    this.#logLevel = "";
    this.#search = "";

    this.#setPage(1);
    this.#getLogsAndRender();
  }

  onLogLevelSelected(e) {
    this.#logLevel = e.detail;
    this.#setPage(1);
    this.#getLogsAndRender();
  }

  onSearchKeypress() {
    this.#search = this.#searchEl.value;
    this.#setPage(1);
    this.#getLogsAndRender();
  }

  onClearClick() {
    this.#logLevelEl.reset();
    this.#searchEl.value = "";

    this.#logLevel = "";
    this.#search = "";

    this.#setPage(1);
    this.#getLogsAndRender();
  }

  async onFirstClick() {
    if (this.#page > 1) {
      this.#setPage(1);
      await this.#getLogsAndRender();
    }
  }

  async onPreviousClick() {
    if (this.#page > 1) {
      this.#decrementPage();
      await this.#getLogsAndRender();
    }
  }

  async onNextClick() {
    if (this.#hasMorePages) {
      this.#incrementPage();
      await this.#getLogsAndRender();
    }
  }

  async onLastClick() {
    if (this.#hasMorePages) {
      this.#setPage(this.#lastPage);
      await this.#getLogsAndRender();
    }
  }

  /*******************************************************************************
   * Private methods
   ******************************************************************************/

  async #getServer(serverID) {
    const query = `getServer(id: ${serverID}) {
      id
      url
      password
    }`;

    const response = await this.params.graphql.query(query);

    return response.data.getServer;
  }

  async #getLogsAndRender() {
    const response = await this.#getLogs(this.#page);
    const resultsEl = document.getElementById("results");

    resultsEl.innerHTML = "";

    response.logEntries.forEach(logEntry => {
      const el = document.createElement("log-entry");
      resultsEl.insertAdjacentElement("beforeend", el);

      el.setAttribute("logid", logEntry.id);
      el.setAttribute("loglevel", logEntry.level);
      el.setAttribute("application", logEntry.application);
      el.setAttribute("message", logEntry.message);
      el.setAttribute("time", logEntry.time);
      el.setAttribute("details", JSON.stringify(logEntry.details));
    });

    if (this.#hasMorePages) {
      if (this.#nextButton.hasAttribute("disabled")) {
        this.#nextButton.removeAttribute("disabled");
      }
    } else {
      this.#nextButton.setAttribute("disabled", "");
    }

    if (this.#page < this.#lastPage) {
      if (this.#lastButton.hasAttribute("disabled")) {
        this.#lastButton.removeAttribute("disabled");
      }
    } else {
      this.#lastButton.setAttribute("disabled", "");
    }

    if (this.#page > 1) {
      if (this.#prevButton.hasAttribute("disabled")) {
        this.#prevButton.removeAttribute("disabled");
      }

      if (this.#firstButton.hasAttribute("disabled")) {
        this.#firstButton.removeAttribute("disabled");
      }
    } else {
      this.#prevButton.setAttribute("disabled", "");
      this.#firstButton.setAttribute("disabled", "");
    }
  }

  async #getLogs(page) {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.#server.password}`,
      },
    };

    const params = `page=${page}&application=${encodeURIComponent(this.#application)}&search=${encodeURIComponent(this.#search)}&level=${this.#logLevel}`;

    const response = await fetcher(`${this.#server.url}/logentry?${params}`, options, this.params.nerdspinner);
    const result = await response.json();

    this.#lastPage = Math.ceil(result.totalCount / result.pageSize);
    this.#hasMorePages = (result.pageSize * this.#page) < result.totalCount;
    return result;
  }

  #scrollToTop() {
    window.scroll(0, 0);
  }

  #setPage(page) {
    this.#page = page;
    this.#updatePageEl();
  }

  #incrementPage() {
    this.#page++;
    this.#updatePageEl();
  }

  #decrementPage() {
    this.#page--;
    this.#updatePageEl();
  }

  #updatePageEl() {
    document.getElementById("page").innerText = `Page ${this.#page}`;
  }
}

customElements.define("view-logs-page", ViewLogs);
