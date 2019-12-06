import LogEntryTable from "/app/components/log-entry-table/log-entry-table.js";
import FilterPanel from "/app/components/filter-panel/filter-panel.js";

export default {
	components: {
		LogEntryTable,
		FilterPanel
	},

	mounted() {
		this.$store.dispatch("showNavigation");
	},

	template: `
		<div>
			<log-entry-table></log-entry-table>
			<filter-panel></filter-panel>
		</div>
	`
};
