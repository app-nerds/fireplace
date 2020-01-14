/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */

import LogEntryTable from "/app/components/log-entry-table/log-entry-table.js";
import FilterPanel from "/app/components/filter-panel/filter-panel.js";
import { Actions } from "/app/state/store.js";

export default {
	components: {
		LogEntryTable,
		FilterPanel
	},

	created() {
		this.$store.dispatch(Actions.getLogEntries);
	},

	template: `
		<div>
			<log-entry-table></log-entry-table>
			<filter-panel :id="'filterPanel'" v-bind:width="350"></filter-panel>
		</div>
	`
};
