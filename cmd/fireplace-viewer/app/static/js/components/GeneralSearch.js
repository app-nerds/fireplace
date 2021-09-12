export class GeneralSearch extends HTMLInputElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this._render();
		this.addEventListener("keyup", this._debounce(this._onKeyUp.bind(this), 300));
	}

	/*****************************************************************************
	 * Public methods
	 ****************************************************************************/

	reset() {
		this.value = "";
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_debounce(fn, wait) {
		let handle = null;

		return (...args) => {
			clearTimeout(handle);

			handle = setTimeout(() => {
				fn.apply(this, args);
			}, wait);
		};
	}

	_dispatchEvent() {
		this.dispatchEvent(new CustomEvent("search-changed", {
			detail: this.value,
		}));
	}

	_onClearButtonClick(e) {
		e.preventDefault();
		e.stopPropagation();

		this.value = "";
		this._dispatchEvent();
		this.focus();
	}

	_onKeyUp() {
		this._dispatchEvent();
	}

	_render() {
		this.type = "text";
		this.maxLength = 50;

		let clearButton = document.createElement("button");
		clearButton.type = "button";
		clearButton.setAttribute("aria-label", "General search");
		clearButton.style.position = "relative";
		clearButton.style.right = "26px";
		clearButton.style.top = "2px";
		clearButton.style.backgroundColor = "white";
		clearButton.style.border = "none";
		clearButton.innerHTML = `<img src="/static/css/fontawesome/times-solid.svg" style="width:12px;height:12px;" alt="Clear general search"/>`;
		clearButton.addEventListener("click", this._onClearButtonClick.bind(this));

		this.insertAdjacentElement("afterend", clearButton);
	}
}

customElements.define("general-search", GeneralSearch, { extends: "input" });
