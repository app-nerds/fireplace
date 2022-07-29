import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";

export default class ViewLogs extends BaseView {
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
            <select id="server" placeholder="Select a server to view logs"></select>
          </div>

          <div>
            <label for="application">Application</label>
            <select id="application" disabled></select>
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
    feather.replace();
  }

}

customElements.define("view-logs-page", ViewLogs);
