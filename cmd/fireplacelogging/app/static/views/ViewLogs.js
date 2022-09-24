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
  #prevButton;
  #nextButton;

  #server;
  #application;
  #logLevel;
  #search;
  #page;
  #hasMorePages;

  constructor(params) {
    super(params);

    this.#logLevel = "";
    this.#search = "";
    this.#page = 1;
    this.#hasMorePages = false;
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

        <section class="navigation-buttons">
          <button id="prev" disabled>Previous Page</button>
          <button id="next" disabled>Next Page</button>
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
    this.#prevButton = document.getElementById("prev");
    this.#nextButton = document.getElementById("next");

    this.#serverIDEl.graphql = this.params.graphql;
    this.#serverIDEl.addEventListener("server-selected", this.#onServerSelected.bind(this));

    this.#applicationEl.graphql = this.params.graphql;
    this.#applicationEl.addEventListener("finished-loading", this.#onApplicationSelectorFinishedLoading.bind(this));
    this.#applicationEl.addEventListener("application-selected", this.#onApplicationSelected.bind(this));

    this.#logLevelEl.addEventListener("log-level-selected", this.#onLogLevelSelected.bind(this));
    this.#searchEl.addEventListener("keypress", debounce(this.#onSearchKeypress.bind(this)));

    document.getElementById("btnClear").addEventListener("click", this.#onClearClick.bind(this));

    this.#prevButton.addEventListener("click", this.#onPreviousClick.bind(this));
    this.#nextButton.addEventListener("click", this.#onNextClick.bind(this));

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

    this.#getLogsAndRender(1, true);
  }

  #onLogLevelSelected(e) {
    this.#logLevel = e.detail;
    this.#getLogsAndRender(1, true);
  }

  #onSearchKeypress() {
    this.#search = this.#searchEl.value;
    this.#getLogsAndRender(1, true);
  }

  #onClearClick() {
    this.#logLevelEl.reset();
    this.#searchEl.value = "";

    this.#logLevel = "";
    this.#search = "";

    this.#getLogsAndRender(1, true);
  }

  async #onPreviousClick() {
    if (this.#page > 1) {
      this.#page--;
      await this.#getLogsAndRender(this.#page, true);

      this.#scrollToTop();
    }
  }

  async #onNextClick() {
    if (this.#hasMorePages) {
      this.#page++;
      await this.#getLogsAndRender(this.#page, true);

      this.#scrollToTop();
    }
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

  async #getLogsAndRender(page, clear) {
    const response = await this.#getLogs(page);
    const resultsEl = document.getElementById("results");

    if (clear) {
      resultsEl.innerHTML = "";
    }

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

    if (page > 1) {
      if (this.#prevButton.hasAttribute("disabled")) {
        this.#prevButton.removeAttribute("disabled");
      }
    } else {
      this.#prevButton.setAttribute("disabled", "");
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

    this.#hasMorePages = (result.pageSize * this.#page) < result.totalCount;
    return result;
  }

  #scrollToTop() {
    console.log(`setting scrool in timeout`);
    setTimeout(() => {
      console.log(`scrolling!`);
      // window.scrollTo({
      //   top: 0,
      //   left: 0,
      //   behavior: "smooth",
      // });
      window.scrollTo(0, 0);
    }, 800);
  }
}

customElements.define("view-logs-page", ViewLogs);
