import { FilterPanelActions, FilterPanelGetters } from "/app/components/filter-panel/filter-panel-state.js";
import {Actions} from "/app/state/store.js";

export default {
	computed: {
		application: {
			get() {
				return this.$store.getters[FilterPanelGetters.application];
			},
			set(newValue) {
				this.$store.dispatch(FilterPanelActions.setApplication, newValue);
				this.$store.dispatch(Actions.firstPage);
			},
		},

		applicationNames: {
			get() {
				return this.$store.getters[FilterPanelGetters.applicationNames];
			},
		},
	},

	template: `
		<select class="form-control" v-model="application">
			<option value>All</option>
			<option v-for="a in applicationNames" :key="a" :value="a">{{a}}</option>
		</select>
	`
};
