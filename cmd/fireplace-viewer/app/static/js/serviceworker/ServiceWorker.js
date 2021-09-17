var cacheName = "fireplaceviewer_v2";

var filesToCache = [
	"/",
	"/main.js",
	"/static/css/fontawesome/backward-solid.svg",
	"/static/css/fontawesome/bomb-solid.svg",
	"/static/css/fontawesome/bug-solid.svg",
	"/static/css/fontawesome/exclamation-circle-solid.svg",
	"/static/css/fontawesome/exclamation-triangle-solid.svg",
	"/static/css/fontawesome/forward-solid.svg",
	"/static/css/fontawesome/info-circle-solid.svg",
	"/static/css/fontawesome/times-solid.svg",
	"/static/css/webfonts/fa-solid-900.ttf",
	"/static/css/webfonts/fa-solid-900.woff",
	"/static/css/webfonts/fa-solid-900.woff2",
	"/static/css/styles.css",
	"/static/images/fire-pit-144x144.png",
	"/static/images/fire-pit-192x192.png",
	"/static/images/fire-pit-48x48.png",
	"/static/images/fire-pit-512x512.png",
	"/static/images/fire-pit-72x72.png",
	"/static/images/fire-pit-96x96.png",
	"/static/js/components/ApplicationSelector.js",
	"/static/js/components/GeneralSearch.js",
	"/static/js/components/InformationBar.js",
	"/static/js/components/LevelSelector.js",
	"/static/js/components/LogEntryTable.js",
	"/static/js/components/LogEntryViewer.js",
	"/static/js/components/LogLevel.js",
	"/static/js/components/PageNavigator.js",
	"/static/js/components/PageSelector.js",
	"/static/js/libraries/custom-elements-polyfill/es.js",
	"/static/js/libraries/dayjs/dayjs-1.10.6.min.js",
	"/static/js/libraries/dayjs/timezone-1.10.6.min.js",
	"/static/js/libraries/dayjs/utc-1.10.6.min.js",
	"/static/js/libraries/nerdwebjs/admin.min.css",
	"/static/js/libraries/nerdwebjs/nerdwebjs.min.js",
	"/static/js/libraries/nerdwebjs/shim.min.css",
	"/static/js/libraries/nerdwebjs/shim.min.js",
	"/static/js/services/DateService.js",
	"/static/js/services/HTTPService.js",
	"/static/js/services/LogEntryService.js",
	"/static/js/services/SessionService.js",
	"/static/js/events.js",
	"/static/views/LoginPage.js",
	"/static/views/LogViewer.js",
];

self.addEventListener("install", function (e) {
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			return cache.addAll(filesToCache);
		})
	);
});
/* Serve cached content when offline */
self.addEventListener("fetch", function (e) {
	e.respondWith(
		caches.match(e.request).then(function (response) {
			return response || fetch(e.request);
		})
	);
});
