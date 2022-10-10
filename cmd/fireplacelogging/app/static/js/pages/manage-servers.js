/*
 * Copyright © 2022 App Nerds LLC
 */

import frame from "../lib/frame/frame.min.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadAndRender();
  document.getElementById("btnAddNewServer").addEventListener("click", onAddNewServerClick);

  async function getServers() {
    try {
      const response = await frame.fetcher(`/api/server`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }, window.spinner);

      const data = await response.json();
      return data;
    } catch (e) {
      console.log(e);
      window.alert.error(e.message);
    }
  }

  async function loadAndRender() {
    const servers = await getServers();
    document.getElementById("servers").innerHTML = "";
    renderServerCards(servers);
  }

  function onAddNewServerClick() {
    window.location = "/edit-server/0";
  }

  async function onDeleteServerClick(id) {
    // try {
    //   const deleteConfirmation = await window.confirm.yesNo(`Are you sure you wish to delete this server?`);

    //   if (deleteConfirmation) {
    //     let query = `deleteServer(id: ${id}) {
    //       id
    //     }`;

    //     await this.params.graphql.mutation(query);
    //     this.params.alert.success("Server deleted");
    //   }
    // } catch (e) {
    //   console.log(e);
    //   this.params.alert.error(e.message);
    // }
  }

  function renderServerCards(servers) {
    let container = document.getElementById("servers");

    servers.forEach(s => {
      const card = renderCard(s);
      container.insertAdjacentElement("beforeend", card);
    });
  }

  function renderCard(server) {
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
    deleteButton.innerHTML = `<i data-feather="trash-2"></i> Delete`;
    deleteButton.addEventListener("click", async () => {
      await onDeleteServerClick(server.id);
      loadAndRender();
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
});

