import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";

export default class EditServer extends BaseView {
  constructor(params) {
    super(params);
  }

  async render() {
    const title = (this.#isNew()) ? "Add New Server" : "Edit Server";

    this.innerHTML = `
      <title>${title}</title>

      <div class="container">
        <h2>${title}</h2>

        <form>
          <label for="serverName">Name <sub>*</sub></label>
          <input type="text" id="serverName" maxlength="100" />

          <label for="url">URL <sub>*</sub></label>
          <input type="text" id="url" />

          <label for="password">Password <sub>*</sub></label>
          <input type="password" id="password" />

          <label for="description">Description</label>
          <textarea id="description"></textarea>

          <button type="button" id="btnCancel" class="secondary-button">Cancel</button>
          <button type="button" id="btnSave" class="action-button">Save</button>
        </form>
      </div>
    `;
  }

  async afterRender() {
    if (!this.#isNew()) {
      const server = await this.#getServer(this.params.id);

      document.getElementById("serverName").value = server.serverName;
      document.getElementById("url").value = server.url;
      document.getElementById("password").value = server.password;
      document.getElementById("description").value = server.description;
    }

    document.getElementById("btnCancel").addEventListener("click", this.#onCancelButtonClick.bind(this));
    document.getElementById("btnSave").addEventListener("click", this.#onSaveButtonClick.bind(this));
    document.getElementById("serverName").focus();
  }

  async #getServer(id) {
    let query = `getServer(id: ${id}) {
      description
      serverName
      url
      password
    }`;

    try {
      const response = await this.params.graphql.query(query);
      return response.data.getServer;
    } catch (e) {
      console.log(e);
      this.params.nerdalert.error(e.message);
    }

  }

  #isNew() {
    return this.params.id === "0";
  }

  #onCancelButtonClick() {
    this.navigateTo("/manage-servers");
  }

  async #onSaveButtonClick() {
    let server = {
      description: document.getElementById("description").value,
      password: document.getElementById("password").value,
      serverName: document.getElementById("serverName").value,
      url: document.getElementById("url").value,
    };

    if (!this.#isNew()) {
      server.id = this.params.id;

      try {
        await this.#update(server);
      } catch (e) {
        console.log(e);
        this.params.nerdalert.error(e.message);
      }

      this.navigateTo("/manage-servers");
      return;
    }

    try {
      await this.#create(server);
    } catch (e) {
      console.log(e);
      this.params.nerdalert.error(e.message);
    }

    this.navigateTo("/manage-servers");
  }

  async #create(server) {
    let query = `createServer(input: {
        description: "${server.description}",
        password: "${server.password}",
        serverName: "${server.serverName}",
        url: "${server.url}"
      }) {
        id
      }
    `;

    await this.params.graphql.mutation(query);
  }

  async #update(server) {
    let query = `updateServer(input: {
        id: ${server.id},
        description: "${server.description}",
        password: "${server.password}",
        serverName: "${server.serverName}",
        url: "${server.url}"
      }) {
        id
      }
    `;

    await this.params.graphql.mutation(query);
  }
}

customElements.define("edit-server-page", EditServer);
