import Home from "./static/views/Home.js";
import ViewLogs from "./static/views/ViewLogs.js";
import ManageServers from "./static/views/ManageServers.js";
import EditServer from "./static/views/EditServer.js";

import { application, GraphQL, fetch } from "./static/js/libraries/nerdwebjs/nerdwebjs.min.js";
import nerdadmin from "./static/js/libraries/nerdadmin/nerdadmin.min.js";

const routes = [
  { path: "/", view: Home },
  { path: "/view-logs", view: ViewLogs },
  { path: "/manage-servers", view: ManageServers },
  { path: "/edit-server/:id", view: EditServer },
];

const app = application("#app", routes);

app.onRenderComplete(() => {
  document.getElementById("app").style.opacity = "1";
  document.querySelector("footer").style.opacity = "1";
});

app.injectParams(() => {
  return {
    graphql: new GraphQL("http://localhost:8080/query", fetch),
    nerdalert: nerdadmin.nerdalert(),
    nerdconfirm: nerdadmin.nerdconfirm(),
    nerdshim: nerdadmin.nerdshim(),
    nerdspinner: nerdadmin.nerdspinner(),
  };
});

app.go();
