import frame from "../lib/frame/frame.min.js";

document.addEventListener("DOMContentLoaded", () => {
  /*
   * Fade our content in nicely
   */
  document.querySelector("main").style.opacity = "1";

  const footers = document.querySelectorAll("footer");
  footers.forEach(f => {
    f.style.opacity = "1";
  });

  /*
   * Load Feather icons
   */
  feather.replace();

  /*
   * Setup some global stuff
   */
  window.spinner = frame.spinner();
  window.alert = frame.alert();
  window.confirm = frame.confirm();
  window.shim = frame.shim();
});

