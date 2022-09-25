/*
 * Copyright © 2022 App Nerds LLC
 */

import { BaseView } from "../js/libraries/nerdwebjs/nerdwebjs.min.js";

export default class ManageServers extends BaseView {
  constructor(params) {
    super(params);
  }

  async render() {
    this.innerHTML = `
      <title>Manage Servers | Fireplace</title>

      <div class="container">
        <h2>Manage Servers</h2>
        <button id="btnAddNewServer" class="action-button"><i data-feather="plus"></i> Add New Server</button>
      </div>

      <section id="servers"></section>
    `;
  }

  async afterRender() {
    await this.#loadAndRender();

    document.getElementById("btnAddNewServer").addEventListener("click", this.#onAddNewServerClick.bind(this));
  }

  async #getServers() {
    let query = `getServers() {
      id
      description
      serverName
      url
    }`;

    try {
      const response = await this.params.graphql.query(query);
      return response.data.getServers;
    } catch (e) {
      console.log(e);
      this.params.nerdalert.error(e.message);
    }
  }

  async #loadAndRender() {
    const servers = await this.#getServers();
    document.getElementById("servers").innerHTML = "";
    this.#renderServerCards(servers);

    feather.replace();
  }

  #onAddNewServerClick() {
    this.navigateTo("/edit-server/0");
  }

  async #onDeleteServerClick(id) {
    try {
      const deleteConfirmation = await this.params.nerdconfirm.yesNo(`Are you sure you wish to delete this server?`);

      if (deleteConfirmation) {
        let query = `deleteServer(id: ${id}) {
          id
        }`;

        await this.params.graphql.mutation(query);
        this.params.nerdalert.success("Server deleted");
      }
    } catch (e) {
      console.log(e);
      this.params.nerdalert.error(e.message);
    }
  }

  #renderServerCards(servers) {
    let container = document.getElementById("servers");

    servers.forEach(s => {
      const card = this.#renderCard(s);
      container.insertAdjacentElement("beforeend", card);
    });
  }

  #renderCard(server) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    const title = document.createElement("h3");
    title.innerText = server.serverName;

    const content = document.createElement("div");
    content.classList.add("content");

    const link = document.createElement("p");
    link.innerHTML = `<a href="${server.url}" target="_blank">${server.url}</a>`;

    const description = document.createElement("p");
    description.innerHTML = server.description;

    const buttonRow = document.createElement("div");
    buttonRow.classList.add("button-row");

    const editButton = document.createElement("button");
    editButton.classList.add("action-button");
    editButton.innerHTML = `<i data-feather="edit-2"></i> Edit`;
    editButton.addEventListener("click", () => {
      this.navigateTo(`/edit-server/${server.id}`);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = `<i data-feather="trash-2"></i> Delete`;
    deleteButton.addEventListener("click", async () => {
      await this.#onDeleteServerClick(server.id);
      this.#loadAndRender();
    });

    buttonRow.insertAdjacentElement("beforeend", editButton);
    buttonRow.insertAdjacentElement("beforeend", deleteButton);

    content.insertAdjacentElement("beforeend", link);
    content.insertAdjacentElement("beforeend", description);
    content.insertAdjacentElement("beforeend", buttonRow);

    cardDiv.insertAdjacentElement("beforeend", title);
    cardDiv.insertAdjacentElement("beforeend", content);

    return cardDiv;
  }
}

customElements.define("manage-servers-page", ManageServers);
