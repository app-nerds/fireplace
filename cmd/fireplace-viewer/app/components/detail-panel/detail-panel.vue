<template>
	<right-panel id="detailPanel" v-bind:width="600">
		<h5 v-if="logEntry.time">{{logEntry.time | longDate}}</h5>

		<p>
			<span :class="badgeClass">{{logEntry.level}}</span>
		</p>

		<section>
			<strong>Message</strong>
			<br>
			{{logEntry.message}}
		</section>

		<table class="table table-striped">
			<thead>
				<tr>
					<th scope="col">Key</th>
					<th scope="col">Value</th>
				</tr>
			</thead>
			<tbody v-if="logEntry.details.length > 0">
				<tr v-for="(details, key) in logEntry.details" :key="key">
					<td>{{details.key}}</td>
					<td>{{details.value}}</td>
				</tr>
			</tbody>
		</table>

		<br>
		<button type="button" class="btn btn-primary" @click="close">Close</button>
	</right-panel>
</template>

<style scoped>
section {
	margin: 5px 0px 20px 0px;
}
</style>

<script>
import moment from "moment";

import RightPanel from "../right-panel/right-panel";

export default {
	components: {
		RightPanel
	},
	data: function() {
		return {
			logEntry: { details: {} },
			isOpen: false
		};
	},
	mounted: function() {
		this.$root.$on("toggle-detail-panel", this.onPanelOpened);
	},
	filters: {
		longDate: function(date) {
			return moment(date).format("MMM Do, YYYY h:mm:ss A");
		}
	},
	computed: {
		badgeClass: function() {
			let result = "badge ";

			switch (this.logEntry.level) {
				case "panic":
				case "fatal":
				case "error":
					result += "badge-danger";
					break;

				case "warning":
					result += "badge-warning";
					break;

				case "debug":
					result += "badge-secondary";
					break;

				default:
					result += "badge-success";
					break;
			}

			return result;
		}
	},
	methods: {
		close: function() {
			if (this.isOpen) {
				this.isOpen = false;
				this.$root.$emit("toggle-right-panel", "detailPanel");
			}
		},

		onPanelOpened: function(logEntry) {
			if (!this.isOpen) {
				this.isOpen = true;
				this.logEntry = logEntry;
				this.$root.$emit("toggle-right-panel", "detailPanel");
			} else {
				if (this.logEntry.id === logEntry.id) {
					this.isOpen = false;
					this.$root.$emit("toggle-right-panel", "detailPanel");
				} else {
					this.isOpen = true;
					this.logEntry = logEntry;
				}
			}
		}
	}
};
</script>
