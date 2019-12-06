import RightPanel from "/app/components/right-panel/right-panel.js";
import ApplicationSelector from "/app/components/application-selector/application-selector.js";
import LevelSelector from "/app/components/level-selector/level-selector.js";

export default {
	components: {
		RightPanel,
		ApplicationSelector,
		LevelSelector
	},

	mounted() {
		this.$root.$on("toggle-filter-panel", () => {
			this.$root.$emit("toggle-right-panel", "filterPanel");
		});
	},

	methods: {
		clear() {
			this.$root.$emit("clear-search-term");
			this.$store.dispatch("clearFilters");
			this.$root.$emit("toggle-filter-panel");
		},

		close() {
			this.$root.$emit("toggle-filter-panel");
		},

		onPanelOpened() {
			this.$store.dispatch("getApplicationNames");
		},
	},

	template: `
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
	`
};

