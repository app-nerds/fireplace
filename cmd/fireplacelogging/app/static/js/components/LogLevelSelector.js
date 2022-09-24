export default class LogLevelSelector extends HTMLElement {
  constructor() {
    super();

    this._selectEl = null;
    this._logLevel = this.getAttribute("log-level") || "";
    this._disabled = this.getAttribute("disabled") || "false";
  }

  get logLevel() {
    return this._logLevel;
  }

  get disabled() {
    return this._disabled;
  }

  static get observedAttributes() {
    return ["log-level", "disabled"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "log-level") {
      this._logLevel = level;
      this._selectEl.value = level;
    }

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

  reset() {
    this._selectEl.value = "";
  }

  async connectedCallback() {
    const options = [
      new Option("All", "", "" === this._logLevel, "" === this._logLevel),
      new Option("Debug", "debug", "debug" === this._logLevel, "debug" === this._logLevel),
      new Option("Info", "info", "info" === this._logLevel, "info" === this._logLevel),
      new Option("Warn", "warn", "warn" === this._logLevel, "warn" === this._logLevel),
      new Option("Error", "error", "error" === this._logLevel, "error" === this._logLevel),
      new Option("Fatal", "fatal", "fatal" === this._logLevel, "fatal" === this._logLevel),
    ];

    this._selectEl = document.createElement("select");

    if (this._disabled === "true") {
      this._selectEl.setAttribute("disabled", true);
    }

    this._selectEl.addEventListener("change", (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.dispatchEvent(new CustomEvent("log-level-selected", { detail: e.target.value }));
    });

    options.forEach(o => {
      this._selectEl.options.add(o);
    });

    this.insertAdjacentElement("beforeend", this._selectEl);
  }
}

customElements.define("log-level-selector", LogLevelSelector);

