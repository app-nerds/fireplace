import LogViewer from "./static/views/LogViewer.js";

import { application } from "./static/js/libraries/nerdwebjs/nerdwebjs.min.js";

/* Add the UTC and timezone plugins to DayJS */
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

const routes = [
	{ path: "/", view: LogViewer },
];

application("#app", routes);
