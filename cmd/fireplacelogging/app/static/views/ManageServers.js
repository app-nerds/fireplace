import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";

export default class ManageServers extends BaseView {
  constructor(params) {
    super(params);
  }

  async render() {
    this.innerHTML = `
      <title>Manage Servers</title>

      <div class="container">
        <h2>Manage Servers</h2>
        <button id="btnAddNewServer" class="action-button"><i data-feather="plus"></i> Add New Server</button>
      </div>

      <section id="servers"></section>
    `;
  }

  async afterRender() {
    feather.replace();
  }
}

customElements.define("manage-servers-page", ManageServers);
