export class LogLevel extends HTMLElement {
	constructor() {
		super();
		this._level = this.getAttribute("level") || "info";
		this._showLabel = this.getAttribute("show-label") === "true" ? true : false;
	}

	connectedCallback() {
		this._render();
	}

	/*****************************************************************************
	 * Properties
	 ****************************************************************************/

	get level() {
		return this._level;
	}

	set level(value) {
		this._level = value;
		this.setAttribute("level", value);

		this._render();
	}

	get showLabel() {
		return this._showLabel;
	}

	set showLabel(value) {
		this._showLabel = value;
		this.setAttribute("show-label", value);
		this._render();
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_getIcon(level) {
		let result = `/static/css/fontawesome`;

		switch (level) {
			case "debug":
				return `${result}/bug-solid.svg`;

			case "warning":
				return `${result}/exclamation-triangle-solid.svg`;

			case "info":
				return `${result}/info-circle-solid.svg`;

			case "fatal":
				return `${result}/bomb-solid.svg`;

			default:
				return `${result}/exclamation-circle-solid.svg`;
		}
	}

	_render() {
		let html = `<img src="${this._getIcon(this._level)}" class="${this._level}" alt="Log level ${this._level}"></img> ${this._showLabel ? this._level : ""}`;
		this.innerHTML = html;
	}
}

customElements.define("log-level", LogLevel);
