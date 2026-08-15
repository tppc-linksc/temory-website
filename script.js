(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector("[data-theme-toggle]");
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const favicon = document.querySelector("[data-favicon]");
  const darkSource = document.querySelector("[data-dark-source]");
  const heroImage = document.querySelector("[data-hero-image]");
  const screenImage = document.querySelector("[data-screen-image]");
  const screenPanel = document.querySelector("#screen-panel");
  const screenLabel = document.querySelector("[data-screen-label]");
  const screenButtons = [...document.querySelectorAll("[data-screen]")];
  const labels = { auto: "跟随系统", light: "浅色", dark: "深色" };
  const screens = {
    home: { light: "assets/home-light-apple-v4.png?v=20260816-4", dark: "assets/home-dark-apple-v3.png?v=20260816-3", alt: "拾光首页界面" },
    timeline: { light: "assets/timeline-light.webp", dark: "assets/timeline-dark.webp", alt: "拾光时光轴界面" },
    ai: { light: "assets/ai-light.webp", dark: "assets/ai-dark.webp", alt: "拾光 AI 问答界面" }
  };

  let theme = "auto";
  let currentScreen = "home";

  try {
    const saved = localStorage.getItem("temory-theme");
    if (["auto", "light", "dark"].includes(saved)) theme = saved;
  } catch (_) {
    // Storage can be unavailable in private browsing; system mode still works.
  }

  function isDark() {
    return theme === "dark" || (theme === "auto" && darkQuery.matches);
  }

  function syncScreenImage(animate = false) {
    if (!screenImage) return;
    const data = screens[currentScreen];
    const nextSrc = data[isDark() ? "dark" : "light"];
    if (screenImage.getAttribute("src") === nextSrc) return;
    const phone = screenImage.closest(".phone-showcase");
    if (animate && phone) phone.classList.add("is-changing");
    window.setTimeout(() => {
      screenImage.src = nextSrc;
      screenImage.alt = data.alt;
      if (phone) phone.classList.remove("is-changing");
    }, animate ? 180 : 0);
  }

  function applyTheme(nextTheme, persist = true) {
    theme = nextTheme;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.dataset.theme = theme;

    if (themeButton) {
      themeButton.setAttribute("aria-label", `主题：${labels[theme]}`);
      themeButton.title = `当前：${labels[theme]}，点击切换`;
    }

    if (darkSource) darkSource.media = isDark() ? "all" : "not all";
    if (heroImage) heroImage.src = isDark() ? "assets/home-dark-apple-v3.png?v=20260816-3" : "assets/home-light-apple-v4.png?v=20260816-4";
    if (favicon) favicon.href = isDark() ? "assets/favicon-dark.png?v=20260815-4" : "assets/favicon-light.png?v=20260815-4";
    syncScreenImage(true);

    if (persist) {
      try { localStorage.setItem("temory-theme", theme); } catch (_) { /* no-op */ }
    }
  }

  applyTheme(theme, false);

  themeButton?.addEventListener("click", () => {
    const order = ["auto", "light", "dark"];
    applyTheme(order[(order.indexOf(theme) + 1) % order.length]);
  });

  darkQuery.addEventListener?.("change", () => {
    if (theme === "auto") applyTheme("auto", false);
  });

  screenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentScreen = button.dataset.screen;
      screenButtons.forEach((item) => item.setAttribute("aria-selected", String(item === button)));
      screenPanel?.setAttribute("aria-label", `${button.dataset.label}预览`);
      if (screenLabel) screenLabel.textContent = button.dataset.label;
      syncScreenImage(true);
    });
  });

  const header = document.querySelector("[data-header]");
  const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelector("#nav-links");
  function closeMenu() {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "打开导航");
    navLinks?.classList.remove("is-open");
  }
  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    navLinks?.classList.toggle("is-open", open);
  });
  navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = new Date().getFullYear(); });
})();
