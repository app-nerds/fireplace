import { FilterPanelActions, FilterPanelGetters } from "/app/components//filter-panel/filter-panel-state.js";
import { Actions } from "/app//state/store.js";

export default {
	computed: {
		level: {
			get() {
				return this.$store.getters[FilterPanelGetters.level];
			},
			set(newValue) {
				this.$store.dispatch(FilterPanelActions.setLevel, newValue);
				this.$store.dispatch(Actions.firstPage);
			},
		},
	},

	template: `
		<select class="form-control" v-model="level">
			<option value>All</option>
			<option value="debug">Debug</option>
			<option value="info">Information</option>
			<option value="warn">Warning</option>
			<option value="error">Error</option>
			<option value="fatal">Fatal</option>
			<option value="panic">Panic</option>
		</select>
	`
};

