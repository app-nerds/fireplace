export default {
	props: {
		id: String,
		width: Number
	},

	data() {
		return {
			panelVisible: false
		};
	},

	mounted() {
		let el = this.getPanelEl();
		el.style.right = this.width * -1;
		el.style.width = this.width;

		this.$root.$on("toggle-right-panel", this.toggleFilterPanel);
	},

	methods: {
		getPanelEl() {
			return document.getElementById(this.id);
		},

		toggleFilterPanel(id) {
			let value;

			this.getPanelEl().style.width = "" + this.width + "px";

			if (id === this.id) {
				if (this.panelVisible) {
					value = "" + this.width * -1 + "px";
					this.panelVisible = false;
					this.$emit("panel-closed");
				} else {
					value = "0px";
					this.panelVisible = true;
					this.$emit("panel-opened");
				}

				this.getPanelEl().style.right = value;
			}
		}
	},

	template: `
		<div class="right-panel" :id="id">
			<slot></slot>
		</div>
	`
};
