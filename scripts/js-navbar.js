/* ═══════════════════════════════════════════════════
   js-navbar.js  — Indicator · Theme · Scroll · Mobile · Dropdown
   ════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── DOM refs ─────────────────────────────────── */
  const html         = document.documentElement;
  const header       = document.getElementById("siteHeader");
  const pill         = document.getElementById("navPill");
  const indicator    = document.getElementById("navIndicator");
  const navLinks     = document.querySelectorAll(".nav-link");
  const themeToggle  = document.getElementById("themeToggle");
  const hamburger    = document.getElementById("hamburger");
  const mobileMenu   = document.getElementById("mobileMenu");
  const mobileLinks  = document.querySelectorAll(".mobile-link");
  const dropBtn      = document.getElementById("moreDropdownBtn");
  const dropMenu     = document.getElementById("moreDropdownMenu");

  /* ════════════════════════════════════════════════
     1.  SLIDING GLOW INDICATOR
  ════════════════════════════════════════════════ */
  function moveIndicator(linkEl) {
    if (!linkEl || !pill || !indicator) return;
    const shrink = 24;
    indicator.style.width = (linkEl.offsetWidth - shrink) + "px";
    indicator.style.left  = (linkEl.offsetLeft + shrink / 2) + "px";
  }

  function initIndicator() {
    const active = pill ? pill.querySelector(".nav-link.active") : null;
    if (active) moveIndicator(active);
  }

  if (pill) {
    navLinks.forEach(function (link) {
      link.addEventListener("mouseenter", function () { moveIndicator(link); });
    });

    pill.addEventListener("mouseleave", function () {
      const active = pill.querySelector(".nav-link.active");
      if (active) moveIndicator(active);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        link.classList.add("active");
        moveIndicator(link);
      });
    });

    window.addEventListener("resize", function () {
      const active = pill.querySelector(".nav-link.active");
      if (active) moveIndicator(active);
    });

    initIndicator();
  }

  /* ════════════════════════════════════════════════
     2.  SCROLL SPY — auto-highlight current section
  ════════════════════════════════════════════════ */
  const sections = document.querySelectorAll("main section[id]");

  const spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      const id          = entry.target.id;
      const matchedLink = pill
        ? pill.querySelector('.nav-link[data-section="' + id + '"]')
        : null;

      navLinks.forEach(function (l) { l.classList.remove("active"); });
      mobileLinks.forEach(function (l) { l.classList.remove("active"); });

      if (matchedLink) {
        matchedLink.classList.add("active");
        moveIndicator(matchedLink);
      }

      const mobileMatch = mobileMenu
        ? mobileMenu.querySelector('.mobile-link[href="#' + id + '"]')
        : null;
      if (mobileMatch) mobileMatch.classList.add("active");
    });
  }, { threshold: 0.35 });

  sections.forEach(function (section) { spyObserver.observe(section); });

  /* ════════════════════════════════════════════════
     3.  SCROLL — shrink header on scroll
  ════════════════════════════════════════════════ */
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }, { passive: true });

  /* ════════════════════════════════════════════════
     4.  THEME TOGGLE — dark / light + persist
  ════════════════════════════════════════════════ */
  (function initTheme() {
    const saved = localStorage.getItem("syed-portfolio-theme");
    if (saved) {
      html.setAttribute("data-theme", saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      html.setAttribute("data-theme", "light");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = html.getAttribute("data-theme");
      const next    = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("syed-portfolio-theme", next);
    });
  }

  /* ════════════════════════════════════════════════
     5.  DROPDOWN — More menu
  ════════════════════════════════════════════════ */
  function openDropdown() {
    if (!dropMenu || !dropBtn) return;
    dropMenu.classList.add("open");
    dropBtn.setAttribute("aria-expanded", "true");
  }

  function closeDropdown() {
    if (!dropMenu || !dropBtn) return;
    dropMenu.classList.remove("open");
    dropBtn.setAttribute("aria-expanded", "false");
  }

  if (dropBtn) {
    dropBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = dropMenu.classList.contains("open");
      isOpen ? closeDropdown() : openDropdown();
    });
  }

  document.addEventListener("click", function (e) {
    if (dropMenu && !dropMenu.contains(e.target) && dropBtn && !dropBtn.contains(e.target)) {
      closeDropdown();
    }
  });

  /* Close dropdown when a dropdown link is clicked */
  if (dropMenu) {
    dropMenu.querySelectorAll(".dropdown-link").forEach(function (link) {
      link.addEventListener("click", function () { closeDropdown(); });
    });
  }

  /* ════════════════════════════════════════════════
     6.  MOBILE MENU toggle
  ════════════════════════════════════════════════ */
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      const isOpen = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Close mobile menu on link click */
  mobileLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      mobileLinks.forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
    });
  });

  /* Close mobile menu on CTA click */
  const mobileCtas = mobileMenu ? mobileMenu.querySelectorAll(".mobile-cta") : [];
  mobileCtas.forEach(function (cta) {
    cta.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });


  /* Close mobile menu on outside click */
  document.addEventListener("click", function (e) {
    if (header && !header.contains(e.target)) {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

})();