(function () {
  var logoFiles = {
    "jemm-logo-v1": { label: "V1", url: "assets/jemm-logo-v1.png", urlColor: "assets/jemm-logo-v1.png" },
    "jemm-logo-v2": { label: "V2", url: "assets/jemm-logo-v2.png", urlColor: "assets/jemm-logo-v2.png" },
    "jemm-logo-v3": { label: "V3", url: "assets/jemm-logo-v3.png", urlColor: "assets/jemm-logo-v3.png" },
    "jemm-logo-v4": { label: "V4", url: "assets/jemm-logo-v4.png", urlColor: "assets/jemm-logo-v4.png" },
    "jemm-logo-v5": { label: "V5", url: "assets/jemm-logo-v5.png", urlColor: "assets/jemm-logo-v5.png" },
    "jemm-logo-v6": { label: "V6", url: "assets/jemm-logo-v6.png", urlColor: "assets/jemm-logo-v6.png" }
  };

  var routes = [
    { id: "voice", label: "Voice & Tone" },
    { id: "logo", label: "Logo" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "color", label: "Color" },
    { id: "applications", label: "Applications" },
    { id: "components", label: "Components" }
  ];

  var currentRoute = "home";
  var isTransitioning = false;
  var revealObserver = null;

  var viewHome = document.getElementById("viewHome");
  var viewSections = document.getElementById("viewSections");
  var tileGrid = document.getElementById("tileGrid");
  var sectionBack = document.getElementById("sectionBack");
  var navPager = document.getElementById("navPager");
  var transitionCurtain = document.getElementById("transitionCurtain");
  var copyToast = document.getElementById("copyToast");
  var toastTimer = null;

  function setMode(mode) {
    document.documentElement.setAttribute("data-mode", mode);
    var label = document.getElementById("activeModeLabel");
    if (label) label.textContent = mode === "dark" ? "Dark" : "Light";
    var toggle = document.getElementById("modeToggle");
    if (toggle) toggle.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
    try { localStorage.setItem("jemm-guide-mode", mode); } catch (e) {}
  }

  function setLogo(logoId) {
    var logo = logoFiles[logoId];
    if (!logo) return;
    document.documentElement.setAttribute("data-logo", logoId);
    document.documentElement.style.setProperty("--logo-mark-image", 'url("' + logo.url + '")');
    document.documentElement.style.setProperty("--logo-mark-image-color", 'url("' + (logo.urlColor || logo.url) + '")');
    var label = document.getElementById("activeLogoLabel");
    if (label) label.textContent = logo.label;
    var select = document.getElementById("logoSelect");
    if (select) select.value = logoId;
    try { localStorage.setItem("jemm-guide-logo", logoId); } catch (e) {}
  }

  function syncHeights() {
    var themeBar = document.querySelector(".theme-bar");
    if (themeBar) {
      document.documentElement.style.setProperty("--theme-bar-height", themeBar.offsetHeight + "px");
    }
  }

  function buildPager(routeId) {
    if (!navPager) return;
    navPager.innerHTML = "";
    var idx = routes.findIndex(function (r) { return r.id === routeId; });
    if (idx === -1) return;

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "pager-btn";
    prev.setAttribute("aria-label", "Previous section");
    prev.disabled = idx === 0;
    prev.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    prev.addEventListener("click", function () { navigateTo(routes[idx - 1].id); });

    var next = document.createElement("button");
    next.type = "button";
    next.className = "pager-btn";
    next.setAttribute("aria-label", "Next section");
    next.disabled = idx === routes.length - 1;
    next.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    next.addEventListener("click", function () { navigateTo(routes[idx + 1].id); });

    navPager.appendChild(prev);
    navPager.appendChild(next);
  }

  function observeReveals(root) {
    var els = (root || document).querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -20px 0px" });
    }
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  function resetRevealsInSection(section) {
    section.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.remove("is-visible");
    });
    requestAnimationFrame(function () { observeReveals(section); });
  }

  function flashCurtain(cb) {
    if (!transitionCurtain || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cb();
      return;
    }
    transitionCurtain.classList.add("is-active");
    setTimeout(function () {
      cb();
      setTimeout(function () { transitionCurtain.classList.remove("is-active"); }, 400);
    }, 260);
  }

  function showHome() {
    document.body.setAttribute("data-route", "home");
    currentRoute = "home";
    document.querySelectorAll(".section-page").forEach(function (page) {
      page.classList.remove("is-active", "is-leaving");
    });
    if (viewHome) {
      viewHome.classList.remove("is-hidden");
      viewHome.style.display = "";
    }
    if (viewSections) viewSections.style.display = "none";
    if (tileGrid) {
      tileGrid.classList.remove("is-exiting");
      tileGrid.classList.add("is-idle");
    }
    document.querySelectorAll(".tile").forEach(function (t) { t.classList.remove("is-launching"); });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    buildPager("");
  }

  function showSection(routeId) {
    var page = document.getElementById(routeId);
    if (!page) return;
    document.body.setAttribute("data-route", routeId);
    currentRoute = routeId;
    if (viewHome) viewHome.classList.add("is-hidden");
    if (viewSections) viewSections.style.display = "block";
    if (tileGrid) tileGrid.classList.remove("is-idle");
    document.querySelectorAll(".section-page").forEach(function (p) {
      p.classList.remove("is-active", "is-leaving");
    });
    page.classList.add("is-active");
    buildPager(routeId);
    resetRevealsInSection(page);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function navigateTo(routeId, clickedTile) {
    if (isTransitioning) return;
    if (routeId === currentRoute) return;

    if (routeId === "home") {
      isTransitioning = true;
      document.body.classList.add("is-transitioning");
      var active = document.querySelector(".section-page.is-active");
      if (active) active.classList.add("is-leaving");
      flashCurtain(function () {
        showHome();
        document.body.classList.remove("is-transitioning");
        isTransitioning = false;
      });
      history.pushState({ route: "home" }, "", "#home");
      return;
    }

    var valid = routes.some(function (r) { return r.id === routeId; });
    if (!valid) return;

    isTransitioning = true;
    document.body.classList.add("is-transitioning");

    if (currentRoute === "home") {
      if (clickedTile) clickedTile.classList.add("is-launching");
      if (tileGrid) tileGrid.classList.add("is-exiting");
      setTimeout(function () {
        flashCurtain(function () {
          if (viewHome) viewHome.style.display = "none";
          showSection(routeId);
          document.body.classList.remove("is-transitioning");
          isTransitioning = false;
        });
      }, 340);
    } else {
      var active = document.querySelector(".section-page.is-active");
      if (active) active.classList.add("is-leaving");
      flashCurtain(function () {
        showSection(routeId);
        document.body.classList.remove("is-transitioning");
        isTransitioning = false;
      });
    }
    history.pushState({ route: routeId }, "", "#" + routeId);
  }

  function parseRoute() {
    var hash = window.location.hash.replace(/^#/, "");
    if (!hash || hash === "home" || hash === "top" || hash === "framework") return "home";
    if (routes.some(function (r) { return r.id === hash; })) return hash;
    return "home";
  }

  function initRouting() {
    document.querySelectorAll("[data-route]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var route = el.getAttribute("data-route");
        if (!route) return;
        e.preventDefault();
        navigateTo(route, el.classList.contains("tile") ? el : null);
      });
    });
    if (sectionBack) sectionBack.addEventListener("click", function () { navigateTo("home"); });
    window.addEventListener("popstate", function () { navigateTo(parseRoute()); });
    var initial = parseRoute();
    if (initial === "home") showHome();
    else {
      if (viewHome) viewHome.style.display = "none";
      if (viewSections) viewSections.style.display = "block";
      showSection(initial);
    }
  }

  function showToast(msg) {
    if (!copyToast) return;
    copyToast.textContent = msg || "Copied!";
    copyToast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { copyToast.classList.remove("is-visible"); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast("Copied " + text); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copied " + text);
    }
  }

  function initCopy() {
    document.querySelectorAll(".color-band, .support-token").forEach(function (el) {
      el.addEventListener("click", function () {
        var hex = el.getAttribute("data-hex");
        if (hex) copyText(hex);
      });
    });
    document.querySelectorAll(".spacing-token").forEach(function (el) {
      el.addEventListener("click", function () {
        var val = el.getAttribute("data-copy");
        if (val) copyText(val);
      });
    });
  }

  function initInteractiveComponents() {
    document.querySelectorAll(".tabs").forEach(function (tabs) {
      tabs.querySelectorAll(".tabs__tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.querySelectorAll(".tabs__tab").forEach(function (t) {
            t.classList.remove("is-active");
            t.setAttribute("aria-selected", "false");
          });
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");
        });
      });
    });
    document.querySelectorAll(".btn-group").forEach(function (group) {
      group.querySelectorAll(".btn-group__btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          group.querySelectorAll(".btn-group__btn").forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
        });
      });
    });
  }

  function initMagneticTiles() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".tile").forEach(function (tile) {
      tile.addEventListener("mousemove", function (e) {
        if (!tileGrid || !tileGrid.classList.contains("is-idle")) return;
        var rect = tile.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        var y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        tile.style.transform = "translate(" + (x * 10) + "px," + (y * 10) + "px) scale(1.03) rotate(" + (x * 2) + "deg)";
      });
      tile.addEventListener("mouseleave", function () {
        tile.style.transform = "";
      });
    });
  }

  var logoSelect = document.getElementById("logoSelect");
  if (logoSelect) logoSelect.addEventListener("change", function () { setLogo(logoSelect.value); });

  var modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.addEventListener("click", function () {
      setMode(document.documentElement.getAttribute("data-mode") === "dark" ? "light" : "dark");
    });
  }

  var savedMode = null;
  var savedLogo = null;
  try {
    savedMode = localStorage.getItem("jemm-guide-mode") || localStorage.getItem("jemm-mode");
    savedLogo = localStorage.getItem("jemm-guide-logo") || localStorage.getItem("jemm-logo");
  } catch (e) {}

  if (savedLogo === "lockup" || savedLogo === "wordmark" || savedLogo === "mark" || savedLogo === "jemm-logo-png" || savedLogo === "jemm-logo-svg" || savedLogo === "jemm-logo-a" || savedLogo === "jemm-logo-b") {
    savedLogo = "jemm-logo-v1";
  }

  setMode(savedMode === "dark" ? "dark" : "light");
  setLogo(savedLogo && logoFiles[savedLogo] ? savedLogo : "jemm-logo-v1");
  syncHeights();
  window.addEventListener("resize", syncHeights, { passive: true });
  window.addEventListener("load", syncHeights);

  initRouting();
  initCopy();
  initInteractiveComponents();
  initMagneticTiles();
  if (tileGrid) tileGrid.classList.add("is-idle");
  observeReveals(viewHome);
})();
