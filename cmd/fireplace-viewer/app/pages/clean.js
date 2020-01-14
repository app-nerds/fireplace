export default {
	data() {
		return {
			date: moment().format("YYYY-MM-DD"),
			maxDate: new Date(),
		};
	},

	mounted() {
		this.$store.dispatch("hideNavigation");
	},

	methods: {
		async deleteEntries() {
			try {
				let result = await this.logEntryService.delete(this.date);
				this.alertService.success(result);
			} catch (e) {
				this.alertService.error(e);
			}
		}
	},

	template: `
		<div>
			<div class="alert alert-primary" role="alert">
				Select a date using the date selector below. All log entries
				prior to and on this date will be deleted.
			</div>

			<form>
				<div class="form-group">
					<label for="date">Date</label>
					<ejs-datepicker :max="maxDate" :value="date" v-model="date"></ejs-datepicker>
				</div>

				<button type="button" class="btn btn-danger" @click="deleteEntries">Delete</button>
			</form>
		</div>
	`
};
