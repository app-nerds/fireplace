import frame from "../lib/frame/frame.min.js";

document.addEventListener("DOMContentLoaded", () => {
  /*
   * Fade our content in nicely
   */
  document.querySelector("main").style.opacity = "1";
  document.querySelector("footer").style.opacity = "1";

  /*
   * Load Feather icons
   */
  feather.replace();

  /*
   * Setup some global stuff
   */
  window.spinner = frame.spinner();
  // window.graphql = new nerdjslibrary.GraphQL("http://localhost:8080/query", { spinner: window.spinner });
  window.alert = frame.alert();
  window.confirm = frame.confirm();
  window.shim = frame.shim();
});

