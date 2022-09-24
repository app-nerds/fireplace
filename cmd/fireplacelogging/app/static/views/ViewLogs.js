import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";
import ServerSelector from "../js/components/ServerSelector.js";
import ApplicationSelector from "../js/components/ApplicationSelector.js";
import LogLevelSelector from "../js/components/LogLevelSelector.js";

export default class ViewLogs extends BaseView {
  #serverIDEl;
  #applicationEl;
  #logLevelEl;
  #searchEl;

  constructor(params) {
    super(params);
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

        <section class="results">
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

    document.getElementById("btnClear").addEventListener("click", this.#onClearClick.bind(this));

    feather.replace();
    this.params.nerdspinner.hide();
  }

  #onServerSelected(e) {
    const serverID = e.detail;
    this.#applicationEl.serverID = serverID;
  }

  #onApplicationSelectorFinishedLoading(e) {
    this.#applicationEl.setAttribute("disabled", "false");
  }

  #onApplicationSelected(e) {
    this.#logLevelEl.removeAttribute("disabled");
    this.#searchEl.removeAttribute("disabled");
  }

  #onClearClick() {
    this.#logLevelEl.reset();
    this.#searchEl.value = "";
  }
}

customElements.define("view-logs-page", ViewLogs);
