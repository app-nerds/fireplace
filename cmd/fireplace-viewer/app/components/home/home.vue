<template>
	<div>
		<log-entry-table></log-entry-table>
		<filter-panel></filter-panel>
	</div>
</template>

<script>
import LogEntryTable from "../log-entry-table/log-entry-table";
import FilterPanel from "../filter-panel/filter-panel";

export default {
	components: {
		LogEntryTable,
		FilterPanel
	},
	mounted: function() {
		this.$store.dispatch("showNavigation");
	}
};
</script>