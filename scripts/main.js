/* ═══════════════════════════════════════════════════
   main.js — Scroll Reveal · Contact Form · Counters · Misc
   ════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ════════════════════════════════════════════════
     1. SCROLL REVEAL
  ════════════════════════════════════════════════ */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: show all at once */
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ════════════════════════════════════════════════
     2. ANIMATED STAT COUNTERS (hero stats)
  ════════════════════════════════════════════════ */
  function animateCounter(el, target, suffix, duration) {
    var isFloat = String(target).includes(".");
    var start   = 0;
    var step    = target / (duration / 16);
    var current = start;

    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = isFloat
        ? parseFloat(current.toFixed(1)) + suffix
        : Math.floor(current) + suffix;
    }, 16);
  }

  var countersRun = false;
  var statsSection = document.querySelector(".hero-stats");

  if (statsSection) {
    var counterObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !countersRun) {
        countersRun = true;
        animateCounter(document.getElementById("statCGPA"),     8.5,  "",  1200);
        animateCounter(document.getElementById("statProjects"), 2,    "+", 800);
        animateCounter(document.getElementById("statCerts"),    5,    "",  1000);
        animateCounter(document.getElementById("statAch"),      5,    "+", 900);
      }
    }, { threshold: 0.5 });

    counterObserver.observe(statsSection);
  }

  /* ════════════════════════════════════════════════
     3. CONTACT FORM
  ════════════════════════════════════════════════ */
  var form       = document.getElementById("portfolioContactForm");
  var submitBtn  = document.getElementById("formSubmitBtn");
  var toast      = document.getElementById("toastNotif");
  var toastMsg   = document.getElementById("toastMsg");
  var toastIcon  = document.getElementById("toastIcon");

  function showToast(msg, isError) {
    toastMsg.textContent  = msg;
    toastIcon.textContent = isError ? "❌" : "✅";
    toast.style.borderColor = isError ? "#f87171" : "var(--accent)";
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name    = document.getElementById("formName").value.trim();
      var email   = document.getElementById("formEmail").value.trim();
      var message = document.getElementById("formMessage").value.trim();

      if (!name || !email || !message) {
        showToast("Please fill in all required fields.", true);
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", true);
        return;
      }

      submitBtn.textContent = "Sending…";
      submitBtn.disabled    = true;

      var action = form.getAttribute("action");
      if (action && action.indexOf("YOUR_FORMSPREE_ID") === -1 && action !== "#" && action !== "") {
        // Send actual form submission to Formspree!
        fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: {
            "Accept": "application/json"
          }
        })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            showToast("Thanks " + name + "! Your message has been sent successfully 🚀", false);
          } else {
            showToast("Oops! There was a problem sending your message. Please try again.", true);
          }
        })
        .catch(function (error) {
          showToast("Network error. Please check your connection and try again.", true);
        })
        .finally(function () {
          submitBtn.innerHTML = 'Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
          submitBtn.disabled  = false;
        });
      } else {
        // Simulate sending (form is still set to placeholder ID)
        setTimeout(function () {
          form.reset();
          submitBtn.innerHTML = 'Send Message <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
          submitBtn.disabled  = false;
          showToast("Simulated Success! Set your Formspree ID in index.html to receive real emails 📧", false);
        }, 1200);
      }
    });
  }

  /* ════════════════════════════════════════════════
     4. SKILL TAG RIPPLE EFFECT
  ════════════════════════════════════════════════ */
  document.querySelectorAll(".skill-tag").forEach(function (tag) {
    tag.addEventListener("click", function (e) {
      var ripple       = document.createElement("span");
      var rect         = tag.getBoundingClientRect();
      var size         = Math.max(rect.width, rect.height);
      ripple.style.cssText =
        "position:absolute;width:" + size + "px;height:" + size + "px;" +
        "left:" + (e.clientX - rect.left - size / 2) + "px;" +
        "top:"  + (e.clientY - rect.top  - size / 2) + "px;" +
        "background:var(--accent);opacity:0.25;border-radius:50%;" +
        "transform:scale(0);animation:ripple 0.5s ease-out forwards;pointer-events:none;";

      tag.style.position = "relative";
      tag.style.overflow = "hidden";
      tag.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 500);
    });
  });

  /* Inject ripple keyframes */
  var style = document.createElement("style");
  style.textContent =
    "@keyframes ripple{to{transform:scale(3);opacity:0;}}";
  document.head.appendChild(style);

  /* ════════════════════════════════════════════════
     5. SMOOTH ANCHOR SCROLL (offset for fixed header)
  ════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (href === "#") return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var offset  = 80;
      var top     = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ════════════════════════════════════════════════
     6. CURSOR GLOW EFFECT (subtle, desktop only)
  ════════════════════════════════════════════════ */
  if (window.matchMedia("(pointer: fine)").matches) {
    var glow = document.createElement("div");
    glow.id  = "cursorGlow";
    glow.style.cssText =
      "position:fixed;width:300px;height:300px;border-radius:50%;" +
      "background:radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);" +
      "pointer-events:none;transform:translate(-50%,-50%);z-index:0;" +
      "transition:opacity 0.3s ease;opacity:0;";
    document.body.appendChild(glow);

    document.addEventListener("mousemove", function (e) {
      glow.style.opacity = "1";
      glow.style.left    = e.clientX + "px";
      glow.style.top     = e.clientY + "px";
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      glow.style.opacity = "0";
    });
  }

  /* ════════════════════════════════════════════════
     7. NAVBAR ACTIVE ON LOAD  (hash-based)
  ════════════════════════════════════════════════ */
  (function () {
    var hash = window.location.hash;
    if (!hash) return;
    var sectionId = hash.slice(1);
    var pill      = document.getElementById("navPill");
    if (!pill) return;
    var match = pill.querySelector('.nav-link[data-section="' + sectionId + '"]');
    if (match) {
      document.querySelectorAll(".nav-link").forEach(function (l) { l.classList.remove("active"); });
      match.classList.add("active");
    }
  })();

})();
