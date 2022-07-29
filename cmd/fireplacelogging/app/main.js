import Home from "./static/views/Home.js";
import ViewLogs from "./static/views/ViewLogs.js";
import ManageServers from "./static/views/ManageServers.js";

import { application } from "./static/js/libraries/nerdwebjs/nerdwebjs.min.js";

const routes = [
  { path: "/", view: Home },
  { path: "/view-logs", view: ViewLogs },
  { path: "/manage-servers", view: ManageServers },
];

const app = application("#app", routes);
app.go();
