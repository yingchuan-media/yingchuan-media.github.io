(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 640px), (max-height: 820px)");
  const hero = document.querySelector(".hero");
  const track = document.querySelector(".showcase-track");
  const scene = document.querySelector(".showcase-scene");
  const reveal = [
    ...document.querySelectorAll(
      ".section-heading, .platforms article, .feature, .download-card, .faq-intro, .faq-list, .closing",
    ),
  ];
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const phase = (value, from, to) => clamp((value - from) / (to - from));
  let frame = 0;

  function render() {
    frame = 0;
    if (reduced.matches || document.hidden) return;
    const height = innerHeight;
    const heroRect = hero.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const sceneHeight = scene.offsetHeight;
    const pinnedTop = parseFloat(getComputedStyle(scene).top) || 104;
    const rectangles = reveal.map((element) => ({
      top:
        element.getBoundingClientRect().top -
        (parseFloat(element.style.getPropertyValue("--reveal-y")) || 0),
    }));
    const heroProgress = clamp(-heroRect.top / hero.offsetHeight);
    const desktop = !compact.matches;
    const progress = desktop
      ? clamp(
          (pinnedTop - trackRect.top) /
            Math.max(1, track.offsetHeight - sceneHeight),
        )
      : clamp(
          (height * 0.75 - trackRect.top) /
            Math.max(1, track.offsetHeight * 0.65),
        );
    const phone = phase(progress, 0.24, 0.72);
    hero.style.setProperty("--hero-shift", `${heroProgress * -80}px`);
    hero.style.setProperty("--hero-fade", 1 - heroProgress * 0.7);
    hero.style.setProperty("--mark-shift", `${heroProgress * 64}px`);
    track.style.setProperty(
      "--desktop-y",
      `${desktop ? (1 - phase(progress, 0, 0.25)) * 64 : 0}px`,
    );
    track.style.setProperty("--desktop-scale", desktop ? 1 - phone * 0.07 : 1);
    track.style.setProperty(
      "--desktop-turn",
      `${desktop ? (1 - phase(progress, 0, 0.3)) * 6 : 0}deg`,
    );
    track.style.setProperty(
      "--phone-y",
      `${(1 - phone) * (desktop ? 180 : 72)}px`,
    );
    track.style.setProperty(
      "--phone-x",
      `${(1 - phone) * (desktop ? 80 : 20)}px`,
    );
    track.style.setProperty("--phone-scale", 0.85 + phone * 0.15);
    track.style.setProperty("--phone-opacity", 0.1 + phone * 0.9);
    track.style.setProperty("--journey-progress", progress);
    const beat = Math.min(2, Math.floor(progress * 3));
    track.style.setProperty("--beat-y", `${beat * -32}px`);
    rectangles.forEach((rect, index) => {
      const amount = phase(height - rect.top, 24, Math.min(320, height * 0.4));
      reveal[index].style.setProperty(
        "--reveal-y",
        `${(1 - amount) * (compact.matches ? 32 : 64)}px`,
      );
      reveal[index].style.setProperty("--reveal-opacity", 0.12 + amount * 0.88);
    });
    root.classList.add("motion-ready");
    root.classList.toggle("motion-pinned", desktop);
  }

  function schedule() {
    if (!frame && !reduced.matches && !document.hidden)
      frame = requestAnimationFrame(render);
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    root.classList.remove("motion-ready", "motion-pinned");
    if (!reduced.matches) schedule();
  }

  reveal.forEach((element) => element.classList.add("motion-reveal"));
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener("pageshow", reset);
  document.addEventListener("visibilitychange", reset);
  reduced.addEventListener("change", reset);
  compact.addEventListener("change", reset);
  new ResizeObserver(schedule).observe(scene);
  document.fonts.ready.then(schedule);
  reset();
})();
