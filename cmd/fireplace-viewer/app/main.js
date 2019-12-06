import App from "/app/components/app/app.js";

import store from "/app/state/store";

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
		{ path: "/", component: () => import("/app/components/home/home.js") },
		{ path: "/clean", component: () => import("/app/components/clean/clean.js") },
	],
});

new Vue({
	el: "#app",
	router,
	store,

	template: App,
});