export class LevelSelector extends HTMLSelectElement {
	constructor() {
		super();

		this._levels = [
			{ text: "All Levels", value: "", defaultValue: true },
			{ text: "Debug", value: "debug", defaultValue: false },
			{ text: "Information", value: "info", defaultValue: false },
			{ text: "Warning", value: "warn", defaultValue: false },
			{ text: "Error", value: "error", defaultValue: false },
			{ text: "Fatal", value: "fatal", defaultValue: false },
		];
	}

	connectedCallback() {
		this._render();
	}

	/*****************************************************************************
	 * Public  methods
	 ****************************************************************************/

	reset() {
		this.selectedIndex = 0;
	}

	/*****************************************************************************
	 * Private methods
	 ****************************************************************************/

	_render() {
		this._levels.forEach((l) => {
			this.options.add(new Option(l.text, l.value, l.defaultValue));
		});
	}
}

customElements.define("level-selector", LevelSelector, { extends: "select" });
