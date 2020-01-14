export default {
	props: {
		id: String,
		width: Number
	},

	data() {
		return {
			el: null,
			panelVisible: false
		};
	},

	mounted() {
		this.el = document.getElementById(this.id);
		this.el.style.right = "" + this.width * -1 + "px";
		this.el.style.width = "" + this.width + "px";
	},

	methods: {
		closePanel() {
			let value = "" + this.width * -1 + "px";
			this.panelVisible = false;
			this.el.style.right = value;

			this.$emit("panel-closed", this.id);
		},

		showPanel() {
			let value = "0px";
			this.panelVisible = true;
			this.el.style.right = value;

			this.$emit("panel-opened", this.id);
		},
	},
};
