/*
 * Copyright © 2022 App Nerds LLC
 */

import { longDateTime } from "../services/DateService.js";

export default class LogEntry extends HTMLElement {
  #logLevelEl;
  #timeEl;
  #applicationEl;
  #messageEl;
  #detailsEl;

  #id;
  #logLevel;
  #time;
  #application;
  #message;
  #details;

  constructor() {
    super();

    this.#id = this.getAttribute("logid") || "";
    this.#logLevel = this.getAttribute("loglevel") || "";
    this.#time = this.getAttribute("time") || "";
    this.#application = this.getAttribute("application") || "";
    this.#message = this.getAttribute("message") || "";
    this.#details = this.getAttribute("details") || [];
  }

  static get observedAttributes() {
    return ["id", "loglevel", "time", "application", "message", "details"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "logid") {
      this.#id = newValue;
    }

    if (name === "loglevel") {
      this.#logLevel = newValue;
    }

    if (name === "time") {
      this.#time = newValue;
    }

    if (name === "application") {
      this.#application = newValue;
    }

    if (name === "message") {
      this.#message = newValue;
    }

    if (name === "details") {
      this.#details = JSON.parse(newValue);
    }

    this.#updateValues();
  }

  connectedCallback() {
    this.classList.add("log-entry");

    const inner = document.createElement("div");

    /*
     * Create all the elements 
     */
    this.#createLogLevelEl();
    this.#createMessageEl();
    this.#createTimeEl();
    this.#createApplicationEl();
    this.#createDetailsEl();

    /*
     * Group all the details into a div which will go next to the icon 
     */
    const detailContainer = document.createElement("div");
    detailContainer.insertAdjacentElement("beforeend", this.#messageEl);
    detailContainer.insertAdjacentElement("beforeend", this.#applicationEl);
    detailContainer.insertAdjacentElement("beforeend", this.#timeEl);
    detailContainer.insertAdjacentElement("beforeend", this.#detailsEl);

    inner.insertAdjacentElement("beforeend", this.#logLevelEl);
    inner.insertAdjacentElement("beforeend", detailContainer);

    this.insertAdjacentElement("beforeend", inner);
  }

  #updateValues() {
    this.#setLogLevelAttributes()
    this.#setTimeAttributes()
    this.#setDetailAttributes()
    this.#setMessageAttributes();
    this.#setApplicationAttributes();
  }

  #createLogLevelEl() {
    this.#logLevelEl = document.createElement("img");
    this.#setLogLevelAttributes();
  }

  #setLogLevelAttributes() {
    this.#logLevelEl.src = this.#getLogLevelIcon();
    this.#logLevelEl.alt = `Log level is ${this.#logLevel}`;
  }

  #createMessageEl() {
    this.#messageEl = document.createElement("p");
    this.#messageEl.classList.add("log-entry-message");
    this.#setMessageAttributes();
  }

  #setMessageAttributes() {
    this.#messageEl.innerHTML = `<strong>Message:</strong> ${this.#message}`;
  }

  #createTimeEl() {
    this.#timeEl = document.createElement("p");
    this.#setTimeAttributes();
  }

  #setTimeAttributes() {
    this.#timeEl.innerHTML = `<strong>Time:</strong> ${longDateTime(this.#time)}`;
  }

  #createApplicationEl() {
    this.#applicationEl = document.createElement("p");
    this.#setApplicationAttributes();
  }

  #setApplicationAttributes() {
    this.#applicationEl.innerHTML = `<strong>Application:</strong> ${this.#application}`;
  }

  #createDetailsEl() {
    this.#detailsEl = document.createElement("p");
    this.#setDetailAttributes();
  }

  #setDetailAttributes() {
    const detailContents = this.#details.map(detail => {
      return `${detail.key}: ${detail.value}`;
    });

    this.#detailsEl.innerHTML = `<strong>Details:</strong><br /><div class="kvp">${detailContents.join("<br />")}</div>`;
  }

  #getLogLevelIcon() {
    switch (this.#logLevel) {
      case "debug":
        return "/static/images/debug.png";

      case "warn":
        return "/static/images/warning.png";

      case "error":
        return "/static/images/error.png";

      case "fatal":
        return "/static/images/fatal.png";

      default:
        return "/static/images/info.png";
    }
  }
}

customElements.define("log-entry", LogEntry);
