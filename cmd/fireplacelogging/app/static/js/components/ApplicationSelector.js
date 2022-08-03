export default class ApplicationSelector extends HTMLElement {
  constructor() {
    super();

    this._selectEl = null;
    this._graphql;
    this._serverID = this.getAttribute("server-id") || "0";
    this._application = this.getAttribute("application-name") || "";
  }

  async connectedCallback() {
    this._selectEl = document.createElement("select");
    this._selectEl.setAttribute("placeholder", "Select an application...");
    this._selectEl.addEventListener("change", (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.dispatchEvent(new CustomEvent("application-selected", { detail: e.target.value }));
    });

    this.insertAdjacentElement("beforeend", this._selectEl);
  }

  get graphql() {
    return this._graphql;
  }

  set graphql(newService) {
    this._graphql = newService;

    if (this._serverID !== "0") {
      this.#loadAndRender();
    }
  }

  get application() {
    return this._application;
  }

  set application(newApplication) {
    this._application = newApplication;

    if (this._serverID !== "0") {
      this.#loadAndRender();
    }
  }

  get serverID() {
    return this._serverID;
  }

  set serverID(newServerID) {
    this._serverID = newServerID;
    this.#loadAndRender();
  }

  async #getApplications() {
    // TODO: add server side code to get applications for a server
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

