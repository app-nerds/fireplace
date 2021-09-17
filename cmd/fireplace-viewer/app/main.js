import LoginPage from "./static/views/LoginPage.js";
import LogViewer from "./static/views/LogViewer.js";

import { application } from "./static/js/libraries/nerdwebjs/nerdwebjs.min.js";

/* Add the UTC and timezone plugins to DayJS */
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

const routes = [
	{ path: "/login", view: LoginPage },
	{ path: "/", view: LogViewer },
];

window.onload = () => {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("/static/js/serviceworker/ServiceWorker.js");
	}
}

application("#app", routes);
