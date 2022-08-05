import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";
import ServerSelector from "../js/components/ServerSelector.js";
import ApplicationSelector from "../js/components/ApplicationSelector.js";

export default class ViewLogs extends BaseView {
  #serverIDEl;
  #applicationEl;

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
            <application-selector id="application" disabled></application-selector>
          </div>

          <div>
            <label for="logLevel">Log Level</label>
            <select id="logLevel" disabled>
              <option value="">All</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="error">Error</option>
              <option value="fatal">Fatal</option>
            </select>
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

    this.#serverIDEl.graphql = this.params.graphql;
    this.#serverIDEl.addEventListener("server-selected", this.#onServerSelected.bind(this));

    this.#applicationEl.graphql = this.params.graphql;
    this.#applicationEl.addEventListener("finished-loading", this.#onApplicationSelectorFinishedLoading.bind(this));

    feather.replace();
    this.params.nerdspinner.hide();
  }

  #onServerSelected(e) {
    this.params.nerdspinner.show();
    const serverID = e.detail;
    this.#applicationEl.serverID = serverID;
  }

  #onApplicationSelectorFinishedLoading(e) {
    console.log(e.detail);
    this.params.nerdspinner.hide();
  }
}

customElements.define("view-logs-page", ViewLogs);
