export default {
	computed: {
		level: {
			get() {
				return this.$store.state.level;
			},

			set(newValue) {
				this.$store.dispatch("setFilterLevel", newValue);
				this.$root.$emit("page-changed");
			},
		},
	},

	template: `
		<select class="form-control" v-model="level">
			<option value>All</option>
			<option value="debug">Debug</option>
			<option value="info">Information</option>
			<option value="warn">Warning</option>
			<option value="error">Error</option>
			<option value="fatal">Fatal</option>
			<option value="panic">Panic</option>
		</select>
	`
};

