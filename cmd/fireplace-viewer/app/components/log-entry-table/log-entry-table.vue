<template>
	<div>
		<table class="table table-header">
			<thead class="thead-dark">
				<tr>
					<th class="column-icon" scope="col">Level</th>
					<th class="column-application" scope="col">Application</th>
					<th class="column-message" scope="col">Message</th>
					<th class="column-date" scope="col">Date</th>
				</tr>
			</thead>
		</table>

		<p v-if="logEntries && logEntries.length <= 0" class="after-header">No log entries to display</p>

		<table
			class="table table-striped after-header"
			v-if="logEntries && logEntries.length > 0"
			id="logEntryTable"
		>
			<tbody>
				<tr v-for="logEntry in logEntries" :key="logEntry.id">
					<td class="column-icon" scope="row">
						<log-entry-status-icon :level="logEntry.level"/>
					</td>
					<td class="column-appliation">
						<p class="log-application">{{logEntry.application}}</p>
					</td>
					<td class="column-message">
						<p class="log-message">
							<a
								v-if="logEntry.details.length > 0"
								class="pointer link"
								@click="showDetails(logEntry)"
							>{{logEntry.message}}</a>
							<span v-if="logEntry.details.length <= 0">{{logEntry.message}}</span>
						</p>
					</td>
					<td class="column-date">
						<span>{{logEntry.time | longDate}}</span>
					</td>
				</tr>
			</tbody>
		</table>

		<detail-panel></detail-panel>
	</div>
</template>

<style scoped>
.table-header {
	top: 56px;
	position: fixed !important;
}

.after-header {
	margin-top: 50px;
}

.icon-error-status {
	color: #ef4d3b;
}

.icon-warning-status {
	color: #fcfc4b;
}

.icon-debug-status {
	color: #33f7e3;
}

.icon-info-status {
	color: #0de815;
}

.column-icon {
	width: 5%;
}

.column-message {
	width: 65%;
}

.column-application {
	width: 10%;
}

.column-date {
	width: 20%;
}
</style>

<script>
import moment from "moment";

import DetailPanel from "../detail-panel/detail-panel";
import LogEntryStatusIcon from "./log-entry-status-icon";

export default {
	components: {
		DetailPanel,
		LogEntryStatusIcon
	},
	filters: {
		longDate: function(date) {
			return moment(date).format("YYYY-MM-DD hh:mm:ss A");
		}
	},
	computed: {
		logEntries: function() {
			let result = this.$store.state.logEntries;

			if (!result) {
				result = [];
			}

			return result;
		}
	},
	methods: {
		scrollToTop: function() {
			window.scrollTo(0, 0);
		},

		showDetails: function(logEntry) {
			this.$root.$emit("toggle-detail-panel", logEntry);
		}
	},
	mounted: function() {
		this.$root.$on("page-changed", this.scrollToTop);
	}
};
</script>