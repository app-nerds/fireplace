<template>
	<select class="form-control" v-model="level">
		<option value>All</option>
		<option value="debug">Debug</option>
		<option value="info">Information</option>
		<option value="warn">Warning</option>
		<option value="error">Error</option>
		<option value="fatal">Fatal</option>
		<option value="panic">Panic</option>
	</select>
</template>

<script>
export default {
	computed: {
		level: {
			get: function() {
				return this.$store.state.level;
			},

			set: function(newValue) {
				this.$store.dispatch("setFilterLevel", newValue);
				this.$root.$emit("page-changed");
			}
		}
	}
};
</script>