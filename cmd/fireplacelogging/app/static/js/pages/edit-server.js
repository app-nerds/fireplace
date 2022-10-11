document.addEventListener("DOMContentLoaded", async () => {
  const descriptionEl = new Quill("#descriptionEl", {
    theme: "snow",
  });

  descriptionEl.root.innerHTML = document.querySelector("#description").value;

  document.querySelector("form").addEventListener("submit", () => {
    document.querySelector("#description").value = descriptionEl.root.innerHTML;
  });

  document.querySelector("#btnCancel").addEventListener("click", () => {
    window.location = "/manage-servers";
  });
});
