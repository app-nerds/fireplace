/*
 * Copyright © 2022 App Nerds LLC
 */

import frame from "../lib/frame/frame.min.js";

export default class ApplicationSelector extends HTMLElement {
  constructor() {
    super();

    this._selectEl = null;
    this._graphql;
    this._disabled = this.getAttribute("disabled") || "false";
    this._serverID = this.getAttribute("server-id") || "0";
    this._application = this.getAttribute("application-name") || "";
  }

  async connectedCallback() {
    this._selectEl = document.createElement("select");

    if (this._disabled === "true") {
      this._selectEl.setAttribute("disabled", true);
    }

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

  get disabled() {
    return this._disabled;
  }

  static get observedAttributes() {
    return ["disabled"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "disabled" && this._selectEl) {
      if (newValue === "true") {
        this._selectEl.setAttribute("disabled", true);
      } else {
        if (this._selectEl.hasAttribute("disabled")) {
          this._selectEl.removeAttribute("disabled");
        }
      }
    }
  }

  async #getApplications() {
    const server = await this.#getServer();

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${server.password}`,
      },
    };

    try {
      const response = await frame.fetcher(`${server.url}/applicationname`, options, window.spinner);
      const result = await response.json();
      return result;

    } catch (e) {
      console.log(e);
      frame.alert().error("Unable to retrieve application names for this server. Please review the server configuration");
    }
  }

  async #getServer() {
    const response = await frame.fetcher(`/api/server/${this._serverID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }, window.spinner);

    const data = await response.json();
    return data;
  }

  async #loadAndRender() {
    const applications = await this.#getApplications();
    this.#render(applications);

    this.dispatchEvent(new CustomEvent("finished-loading", { detail: applications }));
  }

  #render(applications) {
    this._selectEl.options.length = 0;
    this._selectEl.options.add(new Option("Select an application...", "0", "" === parseInt(this._application), "" === parseInt(this._application)));

    applications.forEach(a => {
      let selected = a === this._application;
      this._selectEl.options.add(new Option(a, a, selected, selected));
    });
  }
}

customElements.define("application-selector", ApplicationSelector);
