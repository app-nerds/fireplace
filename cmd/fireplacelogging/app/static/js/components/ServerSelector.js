/*
 * Copyright © 2022 App Nerds LLC
 */

export default class ServerSelector extends HTMLElement {
  constructor() {
    super();

    this._selectEl = null;
    this._graphql;
    this._selectedServerID = this.getAttribute("server-id") || "0";
  }

  async connectedCallback() {
    this._selectEl = document.createElement("select");
    this._selectEl.setAttribute("placeholder", "Select a server...");
    this._selectEl.addEventListener("change", (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.dispatchEvent(new CustomEvent("server-selected", { detail: parseInt(e.target.value) }));
    });

    this.insertAdjacentElement("beforeend", this._selectEl);
  }

  get graphql() {
    return this._graphql;
  }

  set graphql(newService) {
    this._graphql = newService;
    this.#loadAndRender();
  }

  async #getServers() {
    let query = `getServers() {
      id
      serverName
    }`;

    const response = await this._graphql.query(query);
    return response.data.getServers;
  }

  async #loadAndRender() {
    const servers = await this.#getServers();
    this.#render(servers);
  }

  #render(servers) {
    this._selectEl.options.length = 0;
    this._selectEl.options.add(new Option("Select a server...", "0", 0 === parseInt(this._selectedServerID), 0 === parseInt(this._selectedServerID)));

    servers.forEach(s => {
      let selected = s.id === parseInt(this._selectedServerID);
      this._selectEl.options.add(new Option(s.serverName, s.id, selected, selected));
    });
  }
}

customElements.define("server-selector", ServerSelector);
