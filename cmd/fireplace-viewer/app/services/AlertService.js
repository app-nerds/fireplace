/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */
export class AlertService {
	constructor($toast) {
		this.$toast = $toast;
	}

	areYouSure(message, onOK) {
		let dialog = ejs.popups.DialogUtility.confirm({
			title: "Confirm",
			content: message,
			okButton: {
				text: "Yes", click: () => {
					onOK();
					dialog.close();
				},
			},
			cancelButton: { text: "Cancel" },
			showCloseIcon: true,
			closeOnEscape: true,
		});
	}

	error(message) {
		this.$toast.show({
			title: "Error :(",
			content: this.getMessage(message),
			cssClass: "e-toast-danger",
		});
	}

	getMessage(message) {
		if (message.message) {
			return message.message;
		}

		if (message.bodyText) {
			return message.bodyText;
		}

		return message;
	}

	info(message) {
		this.$toast.show({
			title: "Info",
			content: message,
			cssClass: "e-toast-info",
		});
	}

	success(message) {
		this.$toast.show({
			title: "Success!",
			content: message,
			cssClass: "e-toast-success",
		});
	}
}

/*
 * This method installs the AlertService. NOTE!! This requires
 * you to have a ejs-toast component setup at the root app
 * level, with a ref name of "toast"
 */
export function AlertServiceInstaller(Vue, options) {
	Vue.mixin({
		created() {
			if (this.$root.$refs.toast) {
				this.alertService = new AlertService(this.$root.$refs.toast);
			}
		}
	});
}

