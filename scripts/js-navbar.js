/* ═══════════════════════════════════════════════════
   navbar.js  —  Indicator · Theme · Scroll · Mobile
   ════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── DOM refs ─────────────────────────────────── */
  const html        = document.documentElement;
  const header      = document.getElementById("siteHeader");
  const pill        = document.getElementById("navPill");
  const indicator   = document.getElementById("navIndicator");
  const links       = document.querySelectorAll(".nav-link");
  const themeToggle = document.getElementById("themeToggle");
  const hamburger   = document.getElementById("hamburger");
  const mobileMenu  = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  /* ════════════════════════════════════════════════
     1.  SLIDING INDICATOR
  ════════════════════════════════════════════════ */

  /**
   * Move the indicator bar to sit on top of the given link element.
   * Position is relative to the pill container.
   */
  function moveIndicator(linkEl) {
    if (!linkEl || !pill || !indicator) return;

    const pillRect = pill.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();

    const left  = linkRect.left - pillRect.left;
    const width = linkRect.width;

    indicator.style.left  = left  + "px";
    indicator.style.width = width + "px";
  }

  /* Set indicator on the active link immediately on load */
  function initIndicator() {
    const active = pill.querySelector(".nav-link.active");
    if (active) moveIndicator(active);
  }

  /* Hover: move indicator to hovered link */
  links.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      moveIndicator(link);
    });
  });

  /* Mouse leave pill: snap back to active link */
  pill.addEventListener("mouseleave", function () {
    const active = pill.querySelector(".nav-link.active");
    if (active) moveIndicator(active);
  });

  /* Click: set active class */
  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      links.forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
      moveIndicator(link);
    });
  });

  /* Re-position on window resize */
  window.addEventListener("resize", function () {
    const active = pill.querySelector(".nav-link.active");
    if (active) moveIndicator(active);
  });

  /* Init on DOM ready */
  initIndicator();

  /* ════════════════════════════════════════════════
     2.  SCROLL SPY — auto highlight current section
  ════════════════════════════════════════════════ */

  const sections = document.querySelectorAll("main section[id]");

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        const matchedLink = pill.querySelector('.nav-link[data-section="' + id + '"]');
        if (!matchedLink) return;

        links.forEach(function (l) { l.classList.remove("active"); });
        mobileLinks.forEach(function (l) { l.classList.remove("active"); });

        matchedLink.classList.add("active");
        moveIndicator(matchedLink);

        // sync mobile menu too
        const mobileMatch = mobileMenu.querySelector('.mobile-link[href="#' + id + '"]');
        if (mobileMatch) mobileMatch.classList.add("active");
      });
    },
    { threshold: 0.4 }  /* section is 40% visible before highlight */
  );

  sections.forEach(function (section) { observer.observe(section); });

  /* ════════════════════════════════════════════════
     3.  SCROLL — shrink header padding on scroll
  ════════════════════════════════════════════════ */

  window.addEventListener("scroll", function () {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  /* ════════════════════════════════════════════════
     4.  THEME TOGGLE — dark / light
  ════════════════════════════════════════════════ */

  /* Persist user preference in localStorage */
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
  }

  themeToggle.addEventListener("click", function () {
    const current = html.getAttribute("data-theme");
    const next    = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("portfolio-theme", next);
  });

  /* ════════════════════════════════════════════════
     5.  MOBILE MENU toggle
  ════════════════════════════════════════════════ */

  hamburger.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
  });

  /* Close mobile menu on link click */
  mobileLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");

      mobileLinks.forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
    });
  });

  /* Close mobile menu on outside click */
  document.addEventListener("click", function (e) {
    if (!header.contains(e.target)) {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
    }
  });

})();