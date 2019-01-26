<template>
	<right-panel id="filterPanel" v-bind:width="350" v-on:panel-opened="onPanelOpened">
		<form>
			<div class="form-group">
				<label for="application">Application</label>
				<application-selector></application-selector>
			</div>

			<div class="form-group">
				<label for="level">Level</label>
				<level-selector></level-selector>
			</div>

			<button type="button" class="btn btn-primary" @click="close">Close</button>
			<button type="button" class="btn btn-secondary" @click="clear">Clear</button>
		</form>
	</right-panel>
</template>

<script>
import RightPanel from "../right-panel/right-panel";
import ApplicationSelector from "../application-selector/application-selector";
import LevelSelector from "../level-selector/level-selector";

export default {
	components: {
		RightPanel,
		ApplicationSelector,
		LevelSelector
	},
	mounted: function() {
		this.$root.$on("toggle-filter-panel", () => {
			this.$root.$emit("toggle-right-panel", "filterPanel");
		});
	},
	methods: {
		clear: function() {
			this.$root.$emit("clear-search-term");
			this.$store.dispatch("clearFilters");
			this.$root.$emit("toggle-filter-panel");
		},

		close: function() {
			this.$root.$emit("toggle-filter-panel");
		},

		onPanelOpened: function() {
			this.$store.dispatch("getApplicationNames");
		}
	}
};
</script>