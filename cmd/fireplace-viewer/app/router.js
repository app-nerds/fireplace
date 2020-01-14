/*
 * Copyright (c) 2020. App Nerds LLC. All rights reserved
 */
const router = new VueRouter({
	routes: [
		{
			path: "/",
			name: "logs",
			meta: {
				title: "Logs",
			},
			component: () => import("/app/pages/home.js"),
		},
		{
			path: "/clean",
			name: "clean",
			meta: {
				title: "Clean",
			},
			component: () => import("/app/pages/clean.js"),
		},
	],
});

router.beforeEach(async (to, from, next) => {
	document.title = `${to.meta.title} | Fireplace`;
	return next();
});

export default router;

