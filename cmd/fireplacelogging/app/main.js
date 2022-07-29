import Home from "./static/views/Home.js";
import ViewLogs from "./static/views/ViewLogs.js";
import ManageServers from "./static/views/ManageServers.js";

import { application, GraphQL, fetch } from "./static/js/libraries/nerdwebjs/nerdwebjs.min.js";
import nerdadmin from "./static/js/libraries/nerdadmin/nerdadmin.min.js";

const routes = [
  { path: "/", view: Home },
  { path: "/view-logs", view: ViewLogs },
  { path: "/manage-servers", view: ManageServers },
];

const app = application("#app", routes);

app.injectParams(() => {
  return {
    graphql: new GraphQL("http://localhost:8080/query", fetch),
    nerdalert: nerdadmin.nerdalert(),
    nerdconfirm: nerdadmin.nerdconfirm(),
    nerdshim: nerdadmin.nerdshim(),
  };
});

app.go();
