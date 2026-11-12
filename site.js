const themeSelect = document.querySelector("#theme-select");
const themeQuery = window.matchMedia("(prefers-color-scheme: light)");

function updateThemeColor() {
  const theme = document.documentElement.dataset.theme;
  const light = theme === "light" || (theme === "system" && themeQuery.matches);
  document.querySelector('meta[name="theme-color"]').content = light
    ? "#F7F9F8"
    : "#0D1114";
}

themeSelect.value = document.documentElement.dataset.theme;
themeSelect.addEventListener("change", () => {
  document.documentElement.dataset.theme = themeSelect.value;
  try {
    localStorage.setItem("yingchuan-site-theme", themeSelect.value);
  } catch {}
  updateThemeColor();
});
themeQuery.addEventListener("change", updateThemeColor);
updateThemeColor();
