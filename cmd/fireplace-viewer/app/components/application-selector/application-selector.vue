<template>
	<select class="form-control" v-model="application">
		<option value>All</option>
		<option v-for="a in applicationNames" :key="a" :value="a">{{a}}</option>
	</select>
</template>

<script>
export default {
	computed: {
		application: {
			get: function() {
				return this.$store.state.application;
			},

			set: function(newValue) {
				this.$store.dispatch("setFilterApplication", newValue);
				this.$root.$emit("page-changed");
			}
		},

		applicationNames: {
			get: function() {
				return this.$store.state.applicationNames;
			}
		}
	}
};
</script>
