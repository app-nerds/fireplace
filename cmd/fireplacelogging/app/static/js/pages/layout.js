import nerdjslibrary from "/static/js/libraries/nerd-js-library/nerdjslibrary.js";

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
  window.spinner = nerdjslibrary.spinner();
  window.graphql = new nerdjslibrary.GraphQL("http://localhost:8080/query", { spinner: window.spinner });
  window.alert = nerdjslibrary.alert();
  window.confirm = nerdjslibrary.confirm();
  window.shim = nerdjslibrary.shim();
});

