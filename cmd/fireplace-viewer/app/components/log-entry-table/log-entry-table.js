import DetailPanel from "/app/components/detail-panel/detail-panel.js";
import LogEntryStatusIcon from "/app/components/log-entry-table/log-entry-status-icon.js";
import { Getters } from "/app/state/store.js";
import { DetailPanelActions } from "/app/components/detail-panel/detail-panel-state.js";
import { FilterPanelActions } from "/app/components/filter-panel/filter-panel-state.js";

export default {
	components: {
		DetailPanel,
		LogEntryStatusIcon
	},

	filters: {
		longDate(date) {
			return moment(date).format("YYYY-MM-DD hh:mm:ss A");
		}
	},

	computed: {
		logEntries() {
			let result = this.$store.getters[Getters.logEntries];

			if (!result) {
				result = [];
			}

			return result;
		}
	},

	mounted() {
		this.$root.$on("page-changed", this.scrollToTop);
	},

	methods: {
		scrollToTop() {
			window.scrollTo(0, 0);
		},

		showDetails(id) {
			this.$store.dispatch(FilterPanelActions.close);
			this.$store.dispatch(DetailPanelActions.viewLogEntryDetails, id);
		}
	},

	template: `
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
						<log-entry-status-icon :level="logEntry.level" />
					</td>
					<td class="column-appliation">
						<p class="log-application">{{logEntry.application}}</p>
					</td>
					<td class="column-message">
						<p class="log-message">
							<a
								v-if="logEntry.details.length > 0"
								class="pointer link"
								v-on:click="showDetails(logEntry.id)"
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

			<detail-panel :id="'detailPanel'" v-bind:width="600" ref="detailPanel"></detail-panel>
		</div>
	`
};
