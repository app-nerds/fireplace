import Vue from "vue";
import VueRouter from "vue-router";

import App from "./components/app/App.vue";
import Home from "./components/home/Home.vue";
import Clean from "./components/clean/Clean.vue";

import store from "./state/store";

Vue.use(VueRouter);

const router = new VueRouter({
	routes: [
		{ path: "/", component: Home },
		{ path: "/clean", component: Clean }
	]
});

export const app = new Vue({
	router: router,
	render: h => h(App),
	store: store
}).$mount("#app");