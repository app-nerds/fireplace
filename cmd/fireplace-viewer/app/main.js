import { mainTemplate } from "/app/main-template.js";
import { store } from "/app/state/store.js";
import { ApplicationNameServiceInstaller } from "/app/services/ApplicationNameService.js";
import { LogEntryServiceInstaller } from "/app/services/LogEntryService.js";
import TheNavigation from "/app/components/navigation/the-navigation.js";
import router from "/app/router.js";

/*
 * Core plugins
 */
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueLoading);

/*
 * Syncfusion plugins
 */
Vue.use(ejs.buttons.ButtonPlugin);
Vue.use(ejs.grids.GridPlugin);
Vue.use(ejs.popups.DialogPlugin);
Vue.use(ejs.notifications.ToastPlugin);

/*
 * Service plugins
 */
Vue.use(ApplicationNameServiceInstaller);
Vue.use(LogEntryServiceInstaller);

/*
 * HTTP interceptor to show a loading shim
 */
Vue.http.interceptors.push(function () {
	let loader = Vue.$loading.show();

	return function () {
		loader.hide();
	};
});


new Vue({
	el: "#app",
	router,
	store,

	components: {
		TheNavigation,
	},

	mounted() {
		this.$store.dispatch("getLogEntries", 1);
	},

	template: mainTemplate,
});