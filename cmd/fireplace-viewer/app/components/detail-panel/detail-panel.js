import { DetailPanelActions, DetailPanelGetters } from "/app/components/detail-panel/detail-panel-state.js";

export default {
	props: {
		id: String,
		width: Number,
	},

	filters: {
		longDate(date) {
			return moment(date).format("MMM Do, YYYY h:mm:ss A");
		},
	},

	computed: {
		badgeClass() {
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
		},

		logEntry: {
			get() {
				return this.$store.getters[DetailPanelGetters.logEntry];
			},
		},

		right: {
			get() {
				return this.$store.getters[DetailPanelGetters.right];
			},
		},

		styles: {
			get() {
				return {
					width: `${this.width}px`,
					right: `${this.right}px`,
				};
			},
		},
	},

	created() {
		this.$store.dispatch(DetailPanelActions.setWidth, this.width);
		this.$store.dispatch(DetailPanelActions.close);
	},

	methods: {
		close() {
			this.$store.dispatch(DetailPanelActions.close);
		},
	},

	template: `
		<div class="right-panel" :id="id" :style="styles">
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
		</div>
	`
};

