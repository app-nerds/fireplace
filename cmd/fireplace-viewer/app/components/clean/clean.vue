<template>
	<div>
		<div class="alert alert-primary" role="alert">
			Select a date using the date selector below. All log entries
			prior to and on this date will be deleted.
		</div>

		<form>
			<div class="form-group">
				<label for="date">Date</label>
				<datepicker v-model="date" format="yyyy-MM-dd"></datepicker>
			</div>

			<button type="button" class="btn btn-danger" @click="deleteEntries">Delete</button>
		</form>

		<div v-if="modalVisible">
			<transition name="modal">
				<div class="modal-mask">
					<div class="modal-wrapper">
						<div class="modal-dialog">
							<div class="modal-content">
								<div class="modal-header">
									<h5 class="modal-title">Success!</h5>
									<button
										type="button"
										class="close"
										data-dismiss="modal"
										aria-label="close"
										@click="modalVisible = false"
									>
										<span aria-hidden="true">&times;</span>
									</button>
								</div>

								<div class="modal-body">
									<p>{{modalMessage}}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
import moment from "moment";
import LogEntryService from "../../services/LogEntryService";

import Datepicker from "vuejs-datepicker";

export default {
	components: {
		Datepicker
	},
	data: function() {
		return {
			date: moment().format("YYYY-MM-DD"),
			modalVisible: false,
			modalMessage: ""
		};
	},
	mounted: function() {
		this.$store.dispatch("hideNavigation");
	},
	methods: {
		deleteEntries: function() {
			let self = this;

			LogEntryService.delete(this.date)
				.then(result => {
					self.modalMessage = result;
					self.modalVisible = true;
				})
				.catch(e => {
					console.log(e);
				});
		}
	}
};
</script>