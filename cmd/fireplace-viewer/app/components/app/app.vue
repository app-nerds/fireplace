<template>
	<div>
		<the-navigation/>

		<div class="container-fluid">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import TheNavigation from "../navigation/the-navigation";

import LogEntryService from "../../services/LogEntryService";

export default {
	components: {
		TheNavigation
	},
	mounted: function() {
		this.$store.dispatch("getLogEntries", 1);
	}
};
</script>