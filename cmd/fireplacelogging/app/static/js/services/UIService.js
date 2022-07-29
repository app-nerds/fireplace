export function fadeAndScrollInElements(elements) {
  for (let el of elements) {
    if (isInViewport(el)) {
      el.classList.add("is-visible");
    }
  }
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  );
}
