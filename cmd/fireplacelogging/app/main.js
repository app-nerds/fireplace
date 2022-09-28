/*
 * Copyright © 2022 App Nerds LLC
 */

import Home from "./static/views/Home.js";
import Unauthorized from "./static/views/Unauthorized.js";
import ViewLogs from "./static/views/ViewLogs.js";
import ManageServers from "./static/views/ManageServers.js";
import EditServer from "./static/views/EditServer.js";

import nerdjslibrary from "./static/js/libraries/nerd-js-library/nerdjslibrary.js";

const routes = [
  { path: "/", view: Home },
  { path: "/unauthorized", view: Unauthorized },
  { path: "/view-logs", view: ViewLogs },
  { path: "/manage-servers", view: ManageServers },
  { path: "/edit-server/:id", view: EditServer },
];

const app = nerdjslibrary.application("#app", routes);

app.onRenderComplete(() => {
  document.getElementById("app").style.opacity = "1";
  document.querySelector("footer").style.opacity = "1";

  feather.replace();
});

app.injectParams(() => {
  const spinner = nerdjslibrary.spinner();

  return {
    graphql: new nerdjslibrary.GraphQL("http://localhost:8080/query", { spinner: spinner }),
    alert: nerdjslibrary.alert(),
    confirm: nerdjslibrary.confirm(),
    shim: nerdjslibrary.shim(),
    spinner: spinner,
  };
});

app.go();
