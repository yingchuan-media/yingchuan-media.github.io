try {
  const savedTheme = localStorage.getItem("yingchuan-site-theme");
  if (["light", "dark"].includes(savedTheme))
    document.documentElement.dataset.theme = savedTheme;
} catch {}
