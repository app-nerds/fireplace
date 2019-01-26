<template>
	<i :class="statusIcon"></i>
</template>

<script>
export default {
	props: {
		level: String
	},
	computed: {
		statusIcon: function() {
			let result = "fas ";

			switch (this.level) {
				case "panic":
				case "fatal":
				case "error":
					result += "fa-exclamation-circle icon-error-status";
					break;

				case "warning":
					result += "fa-hand-paper icon-warning-status";
					break;

				case "debug":
					result += "fa-bug icon-debug-status";
					break;

				default:
					result += "fa-check-circle icon-info-status";
					break;
			}

			return result;
		}
	}
};
</script>