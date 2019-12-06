import TheNavigation from "/app/components/navigation/the-navigation.js";

export default {
	components: {
		TheNavigation,
	},

	mounted() {
		this.$store.dispatch("getLogEntries", 1);
	},

	template: `
	<div>
		<the-navigation/>

		<div class="container-fluid">
			<router-view></router-view>
		</div>
	</div>
	`
};
