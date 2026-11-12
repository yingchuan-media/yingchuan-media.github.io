try {
  const savedTheme = localStorage.getItem("yingchuan-site-theme");
  if (["light", "dark"].includes(savedTheme))
    document.documentElement.dataset.theme = savedTheme;
} catch {}

(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let seen = false;
  try {
    seen = sessionStorage.getItem("yingchuan-opening") === "seen";
  } catch {}
  if (seen || location.hash || reduced.matches) return;

  let pending = true;
  let deadline;
  function release() {
    if (!pending) return;
    pending = false;
    clearTimeout(deadline);
    root.classList.remove("startup-pending");
    removeEventListener("error", onError, true);
    removeEventListener("hashchange", release);
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", armDeadline);
    reduced.removeEventListener("change", onPreference);
  }
  function armDeadline() {
    clearTimeout(deadline);
    if (pending && !document.hidden) deadline = setTimeout(release, 5000);
  }
  function onError(event) {
    if (
      event.target instanceof HTMLScriptElement &&
      /\/(startup|startup-timing)\.js(?:\?|$)/.test(event.target.src)
    )
      release();
    else if (event.filename && /\/startup\.js(?:\?|$)/.test(event.filename))
      release();
  }
  function onClick(event) {
    if (
      event.target instanceof Element &&
      event.target.closest(".startup-skip, .skip-link")
    )
      release();
  }
  function onKey(event) {
    if (event.key === "Escape") release();
  }
  function onPreference() {
    if (reduced.matches) release();
  }
  window.yingchuanOpening = {
    get pending() {
      return pending;
    },
    release,
    claim() {
      if (!pending) return false;
      release();
      try {
        sessionStorage.setItem("yingchuan-opening", "seen");
      } catch {}
      return true;
    },
  };
  root.classList.add("startup-pending");
  addEventListener("error", onError, true);
  addEventListener("hashchange", release);
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", armDeadline);
  reduced.addEventListener("change", onPreference);
  armDeadline();
})();
