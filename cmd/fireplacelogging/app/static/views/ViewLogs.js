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

  #server;
  #application;
  #logLevel;
  #search;

  constructor(params) {
    super(params);

    this.#logLevel = "";
    this.#search = "";
  }

  async render() {
    this.innerHTML = `
      <title>View Logs</title>

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

        <section class="results" id="results">
        </section>
      </div>
    `;
  }

  async afterRender() {
    this.params.nerdspinner.show();
    this.#serverIDEl = document.getElementById("serverID");
    this.#applicationEl = document.getElementById("application");
    this.#logLevelEl = document.getElementById("logLevel");
    this.#searchEl = document.getElementById("search");

    this.#serverIDEl.graphql = this.params.graphql;
    this.#serverIDEl.addEventListener("server-selected", this.#onServerSelected.bind(this));

    this.#applicationEl.graphql = this.params.graphql;
    this.#applicationEl.addEventListener("finished-loading", this.#onApplicationSelectorFinishedLoading.bind(this));
    this.#applicationEl.addEventListener("application-selected", this.#onApplicationSelected.bind(this));

    this.#logLevelEl.addEventListener("log-level-selected", this.#onLogLevelSelected.bind(this));
    this.#searchEl.addEventListener("keypress", debounce(this.#onSearchKeypress.bind(this)));

    document.getElementById("btnClear").addEventListener("click", this.#onClearClick.bind(this));

    feather.replace();
    this.params.nerdspinner.hide();
  }

  async #onServerSelected(e) {
    const serverID = e.detail;
    this.#server = await this.#getServer(serverID);

    this.#applicationEl.serverID = serverID;
  }

  #onApplicationSelectorFinishedLoading() {
    this.#applicationEl.setAttribute("disabled", "false");
  }

  #onApplicationSelected(e) {
    this.#application = e.detail;

    this.#logLevelEl.removeAttribute("disabled");
    this.#searchEl.removeAttribute("disabled");

    this.#logLevelEl.reset();
    this.#searchEl.value = "";

    this.#logLevel = "";
    this.#search = "";

    this.#getLogsAndRender(1);
  }

  #onLogLevelSelected(e) {
    this.#logLevel = e.detail;
    this.#getLogsAndRender(1);
  }

  #onSearchKeypress() {
    this.#search = this.#searchEl.value;
    this.#getLogsAndRender(1);
  }

  #onClearClick() {
    this.#logLevelEl.reset();
    this.#searchEl.value = "";

    this.#logLevel = "";
    this.#search = "";

    this.#getLogsAndRender(1);
  }

  async #getServer(serverID) {
    const query = `getServer(id: ${serverID}) {
      id
      url
      password
    }`;

    const response = await this.params.graphql.query(query);

    return response.data.getServer;
  }

  async #getLogsAndRender(page) {
    const response = await this.#getLogs(page);
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

    return result;
  }
}

customElements.define("view-logs-page", ViewLogs);
