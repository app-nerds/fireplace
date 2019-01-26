<template>
	<div class="right-panel" :id="id">
		<slot></slot>
	</div>
</template>

<style scoped>
.right-panel {
	background-color: white;
	border: 1px solid #ccc;
	height: 100%;
	width: 450px;
	position: fixed;
	right: -460px;
	top: 56px;
	padding: 10px 30px 5px;
	overflow-x: hidden;
	transition: 0.5s;
}
</style>

<script>
export default {
	mounted: function() {
		let el = this.getPanelEl();
		el.style.right = this.width * -1;
		el.style.width = this.width;

		this.$root.$on("toggle-right-panel", this.toggleFilterPanel);
	},
	props: {
		id: String,
		width: Number
	},
	data: function() {
		return {
			panelVisible: false
		};
	},
	methods: {
		getPanelEl: function() {
			return document.getElementById(this.id);
		},

		toggleFilterPanel: function(id) {
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
	}
};
</script>