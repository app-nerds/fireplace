import Home from "./static/views/Home.js";
import About from "./static/views/About.js";

import { application } from "./static/js/libraries/nerdwebjs/nerdwebjs.min.js";

const routes = [
  { path: "/", view: Home },
  { path: "/about", view: About },
];

const app = application("#app", routes);
app.go();
