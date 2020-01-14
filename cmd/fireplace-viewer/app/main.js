import { App } from "/app/components/app/app.js";
import store from "/app/state/store.js";
import { ApplicationNameServiceInstaller } from "/app/services/ApplicationNameService.js";
import { LogEntryServiceInstaller } from "/app/services/LogEntryService.js";
import TheNavigation from "/app/components/navigation/the-navigation.js";

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

const router = new VueRouter({
	routes: [
		{ path: "/", name: "logs", component: () => import("/app/components/home/home.js") },
		{ path: "/clean", name: "clean", component: () => import("/app/components/clean/clean.js") },
	],
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

	template: App,
});