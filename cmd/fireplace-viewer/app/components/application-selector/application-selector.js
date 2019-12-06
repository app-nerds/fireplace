export default {
	computed: {
		application: {
			get() {
				return this.$store.state.application;
			},

			set(newValue) {
				this.$store.dispatch("setFilterApplication", newValue);
				this.$root.$emit("page-changed");
			}
		},

		applicationNames: {
			get() {
				return this.$store.state.applicationNames;
			}
		}
	},

	template: `
		<select class="form-control" v-model="application">
			<option value>All</option>
			<option v-for="a in applicationNames" :key="a" :value="a">{{a}}</option>
		</select>
	`
};
