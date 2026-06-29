(function () {
  var logoFiles = {
    primary: { label: "Lockup" },
    mark: { label: "Logomark" },
    wordmark: { label: "Logotype" }
  };

  function markIconSrc(mode) {
    return mode === "dark"
      ? "assets/jemm-mark-icon-dark.svg"
      : "assets/jemm-mark-icon-light.svg";
  }

  function lockupSrc(tone, mode) {
    if (tone === "neon" || tone === "light") return "assets/jemm-lockup-light.svg";
    if (tone === "emerald" || tone === "dark" || tone === "steel") return "assets/jemm-lockup-dark.svg";
    if (tone === "nav") {
      if (document.body.getAttribute("data-route") === "home") {
        return mode === "dark" ? "assets/jemm-lockup-dark.svg" : "assets/jemm-lockup-light.svg";
      }
      return mode === "dark" ? "assets/jemm-lockup-dark.svg" : "assets/jemm-lockup-light.svg";
    }
    return mode === "dark" ? "assets/jemm-lockup-dark.svg" : "assets/jemm-lockup-light.svg";
  }

  function logoSrc(logoId, mode, tone) {
    if (logoId === "mark") {
      return (tone === "dark" || tone === "emerald" || mode === "dark") && tone !== "light" && tone !== "neon"
        ? "assets/jemm-mark-dark.svg"
        : "assets/jemm-mark-light.svg";
    }
    if (logoId === "wordmark") {
      return (tone === "dark" || tone === "emerald" || mode === "dark") && tone !== "light" && tone !== "neon"
        ? "assets/jemm-wordmark-dark.svg"
        : "assets/jemm-wordmark-light.svg";
    }
    return lockupSrc(tone, mode);
  }

  function getPaletteColors() {
    var mode = document.documentElement.getAttribute("data-mode") || "light";
    return {
      canvas: { bg: mode === "dark" ? "#121212" : "#ffffff", text: mode === "dark" ? "#f5f5f5" : "#283239" },
      coconut: { bg: mode === "dark" ? "#283239" : "#f7f5f2", text: mode === "dark" ? "#f5f5f5" : "#283239" },
      emerald: { bg: "#059161", text: "#ffffff" },
      deep: { bg: "#002928", text: "#00d58c" },
      ink: { bg: "#121212", text: "#f5f5f5" },
      neon: { bg: "#00d58c", text: "#002928" },
      steel: { bg: "#283239", text: "#ffffff" }
    };
  }

  function refreshLogos() {
    if (window.jemmLogoTester && window.jemmLogoTester.isActive()) {
      window.jemmLogoTester.reapply();
      return;
    }
    refreshBuiltInLogos();
  }

  function refreshBuiltInLogos() {
    var mode = document.documentElement.getAttribute("data-mode") || "light";

    document.querySelectorAll(".logo-lockup__mark--light").forEach(function (img) {
      img.src = "assets/jemm-mark-light.svg";
      img.classList.remove("logo-auto-to-white", "logo-auto-to-black");
      img.style.display = "";
    });
    document.querySelectorAll(".logo-lockup__mark--dark").forEach(function (img) {
      img.src = "assets/jemm-mark-dark.svg";
      img.classList.remove("logo-auto-to-white", "logo-auto-to-black");
      img.style.display = "";
    });

    document.querySelectorAll(".logo-lockup").forEach(function (lockup) {
      var type = lockup.querySelector(".logo-lockup__type");
      if (type) type.style.color = "";
      lockup.style.color = "";
    });

    document.querySelectorAll('img[data-logo-part="mark"]').forEach(function (img) {
      var tone = img.getAttribute("data-logo-tone") || "light";
      img.src = logoSrc("mark", mode, tone);
      img.classList.remove("logo-auto-to-white", "logo-auto-to-black");
    });

    document.querySelectorAll('[data-logo-part="type"]').forEach(function (el) {
      el.style.color = "";
    });

    document.querySelectorAll("[data-nav-mark]").forEach(function (el) {
      el.src = markIconSrc(mode);
    });
    document.querySelectorAll("[data-desk-mark]").forEach(function (el) {
      el.src = markIconSrc(mode);
    });
    document.querySelectorAll("[data-bottom-mark]").forEach(function (el) {
      el.src = markIconSrc(mode);
    });
  }

  window.jemmGuideRefreshBuiltInLogos = refreshBuiltInLogos;

  var routes = [
    { id: "voice", label: "Voice & Tone" },
    { id: "logo", label: "Logo" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing" },
    { id: "color", label: "Color" },
    { id: "applications", label: "Applications" },
    { id: "components", label: "Components" },
    { id: "accessibility", label: "Accessibility" }
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

  function syncModeButtons(mode) {
    document.querySelectorAll("[data-mode-set]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-mode-set") === mode);
    });
    var menuMode = document.getElementById("menuModeToggle");
    if (menuMode) menuMode.textContent = mode === "dark" ? "Switch to light" : "Switch to dark";
  }

  function setMode(mode) {
    document.documentElement.setAttribute("data-mode", mode);
    syncModeButtons(mode);
    try { localStorage.setItem("jemm-guide-mode", mode); } catch (e) {}
    if (window.jemmDarkSurface) window.jemmDarkSurface.onModeChange(mode);
    refreshLogos();
    var key = document.body.getAttribute("data-scroll-palette");
    if (key && document.body.getAttribute("data-route") !== "home") {
      var c = getPaletteColors()[key];
      if (c) {
        document.documentElement.style.setProperty("--scroll-bg", c.bg);
        document.documentElement.style.setProperty("--scroll-fg", c.text);
      }
    }
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
    updateDeskNav("home");
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
    document.body.removeAttribute("data-scroll-palette");
    document.querySelectorAll(".bento, .tile").forEach(function (t) {
      t.classList.remove("is-launching");
      t.style.transform = "";
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    buildPager("");
    refreshLogos();
  }

  function showSection(routeId) {
    var page = document.getElementById(routeId);
    if (!page) return;
    document.body.setAttribute("data-route", routeId);
    currentRoute = routeId;
    updateDeskNav(routeId);
    if (viewHome) viewHome.classList.add("is-hidden");
    if (viewSections) viewSections.style.display = "block";
    if (tileGrid) tileGrid.classList.remove("is-idle");
    document.querySelectorAll(".section-page").forEach(function (p) {
      p.classList.remove("is-active", "is-leaving");
    });
    page.classList.add("is-active");
    buildPager(routeId);
    resetRevealsInSection(page);
    var firstZone = page.querySelector(".palette-zone[data-palette]");
    if (firstZone) {
      var key = firstZone.getAttribute("data-palette");
      document.body.setAttribute("data-scroll-palette", key);
      var paletteColors = getPaletteColors();
      var c = paletteColors[key];
      if (c) {
        document.documentElement.style.setProperty("--scroll-bg", c.bg);
        document.documentElement.style.setProperty("--scroll-fg", c.text);
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    refreshLogos();
  }

  function navigateTo(routeId, clickedTile) {
    if (isTransitioning) return;
    if (routeId === currentRoute) return;
    if (document.body.classList.contains("menu-open")) {
      var menu = document.getElementById("siteMenu");
      if (menu) menu.hidden = true;
      document.body.classList.remove("menu-open");
      var trigger = document.getElementById("bottomMenuTrigger");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-label", "More sections");
      }
    }

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
      var activePage = document.querySelector(".section-page.is-active");
      if (activePage) activePage.classList.add("is-leaving");
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
        navigateTo(route, el.classList.contains("bento") || el.classList.contains("tile") ? el : null);
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

  function parseCssVar(style, name) {
    var match = style.match(new RegExp(name + ":\\s*(#[0-9a-fA-F]{3,8}|[^;]+)"));
    return match ? match[1].trim() : "";
  }

  function hexToRgb(hex) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map(function (c) { return c + c; }).join("");
    }
    if (hex.length !== 6) return null;
    var num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function relativeLuminance(rgb) {
    function channel(c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  }

  function contrastRatio(fg, bg) {
    var fgRgb = hexToRgb(fg);
    var bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return 0;
    var l1 = relativeLuminance(fgRgb);
    var l2 = relativeLuminance(bgRgb);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function wcagLevel(ratio) {
    if (ratio >= 7) return { level: "AAA", pass: true, label: "AAA ✓", className: "pass" };
    if (ratio >= 4.5) return { level: "AA", pass: true, label: "AA ✓", className: "pass" };
    if (ratio >= 3) return { level: "AA Large", pass: true, label: "AA Large ✓", className: "large" };
    return { level: "Fail", pass: false, label: "Fail ✗", className: "fail" };
  }

  function relativeLuminanceFromHex(hex) {
    var rgb = hexToRgb(hex);
    return rgb ? relativeLuminance(rgb) : 0;
  }

  function outlineStrokeColor(fg, bg) {
    return relativeLuminanceFromHex(bg) > relativeLuminanceFromHex(fg) ? fg : bg;
  }

  function needsTextOutline(ratio) {
    return ratio < 4.5;
  }

  function applyTextOutline(el, fg, bg, width) {
    if (!el) return false;
    var ratio = contrastRatio(fg, bg);
    if (!needsTextOutline(ratio)) return false;
    el.classList.add("text-outline--filled", "is-outlined");
    el.style.setProperty("--text-outline-color", outlineStrokeColor(fg, bg));
    if (width) el.style.setProperty("--text-outline-width", width);
    el.setAttribute("data-outline", "required");
    return true;
  }

  var PRIMARY_CONTRAST_PAIRS = [
    { bg: "#059161", fg: "#FFFFFF", bgName: "Emerald", fgName: "White" },
    { bg: "#EAF6F1", fg: "#059161", bgName: "Success tint", fgName: "Emerald" },
    { bg: "#F7F5F2", fg: "#059161", bgName: "Coconut", fgName: "Emerald" },
    { bg: "#002928", fg: "#00D58C", bgName: "Deep Green", fgName: "Neon" },
    { bg: "#002928", fg: "#FFFFFF", bgName: "Deep Green", fgName: "White" },
    { bg: "#283239", fg: "#00D58C", bgName: "Steel", fgName: "Neon" },
    { bg: "#283239", fg: "#FFFFFF", bgName: "Steel", fgName: "White" },
    { bg: "#121212", fg: "#00D58C", bgName: "Ink", fgName: "Neon" },
    { bg: "#121212", fg: "#FFFFFF", bgName: "Ink", fgName: "White" },
    { bg: "#202020", fg: "#00D58C", bgName: "Charcoal", fgName: "Neon" },
    { bg: "#202020", fg: "#FFFFFF", bgName: "Charcoal", fgName: "White" },
    { bg: "#202020", fg: "#F7F5F2", bgName: "Charcoal", fgName: "Coconut" },
    { bg: "#00D58C", fg: "#002928", bgName: "Neon", fgName: "Deep Green" },
    { bg: "#00D58C", fg: "#202020", bgName: "Neon", fgName: "Charcoal" },
    { bg: "#FFFFFF", fg: "#283239", bgName: "White", fgName: "Steel" },
    { bg: "#F7F5F2", fg: "#283239", bgName: "Coconut", fgName: "Steel" }
  ];

  function buildContrastPairEl(pair) {
    var ratio = contrastRatio(pair.fg, pair.bg);
    var wcag = wcagLevel(ratio);
    var outlined = needsTextOutline(ratio);
    var el = document.createElement("article");
    el.className = "contrast-pair";
    el.innerHTML =
      '<div class="contrast-pair__sample" style="background:' + pair.bg + ';color:' + pair.fg + '">' +
        '<span class="contrast-pair__names">' + pair.bgName + " / " + pair.fgName + "</span>" +
        '<span class="contrast-pair__preview' + (outlined ? " text-outline--filled is-outlined" : "") + '">Aa · jemm.ai</span>' +
      "</div>" +
      '<div class="contrast-pair__meta">' +
        '<span class="contrast-pair__ratio">' + ratio.toFixed(1) + ":1</span>" +
        '<span class="contrast-pair__wcag contrast-pair__wcag--' + wcag.className + '">' + wcag.label + "</span>" +
        (outlined ? '<span class="contrast-pair__wcag contrast-pair__wcag--outline">+ outline</span>' : "") +
      "</div>";
    if (outlined) {
      var preview = el.querySelector(".contrast-pair__preview");
      preview.style.setProperty("--text-outline-color", outlineStrokeColor(pair.fg, pair.bg));
      preview.style.setProperty("--text-outline-width", "1.25px");
    }
    return el;
  }

  function renderContrastGrids() {
    ["primaryContrastGrid", "a11yContrastGrid"].forEach(function (id) {
      var grid = document.getElementById(id);
      if (!grid || grid.childElementCount) return;
      PRIMARY_CONTRAST_PAIRS.forEach(function (pair) {
        grid.appendChild(buildContrastPairEl(pair));
      });
    });
  }

  function initColorBandContrast() {
    document.querySelectorAll(".color-band").forEach(function (band) {
      var style = band.getAttribute("style") || "";
      var bg = parseCssVar(style, "--band");
      var fg = parseCssVar(style, "--text");
      if (!bg || !fg) return;

      var ratio = contrastRatio(fg, bg);
      var wcag = wcagLevel(ratio);
      var role = band.querySelector(".color-band__role");
      if (!role) return;

      var meta = band.querySelector(".color-band__meta");
      if (!meta) {
        meta = document.createElement("div");
        meta.className = "color-band__meta";
        role.parentNode.insertBefore(meta, role);
        meta.appendChild(role);
      }

      var badge = band.querySelector(".color-band__contrast");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "color-band__contrast";
        meta.appendChild(badge);
      }

      badge.className = "color-band__contrast color-band__contrast--" + wcag.className;
      badge.textContent = ratio.toFixed(1) + ":1 · " + wcag.label + (needsTextOutline(ratio) ? " · outline" : "");

      if (needsTextOutline(ratio)) {
        band.classList.add("is-outlined");
        var name = band.querySelector(".color-band__name");
        applyTextOutline(name, fg, bg, "1.25px");
      }
    });
  }

  function initSupportTokenOutlines() {
    document.querySelectorAll(".support-token").forEach(function (token) {
      var style = token.getAttribute("style") || "";
      var bg = parseCssVar(style, "--token-bg");
      var accent = parseCssVar(style, "--token-accent");
      if (!bg || !accent) return;
      var name = token.querySelector(".support-token__name");
      applyTextOutline(name, accent, bg, "0.75px");
    });
  }

  function initContrastPairings() {
    renderContrastGrids();
    initColorBandContrast();
    initSupportTokenOutlines();
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

  function initPaletteScroll() {
    var zones = document.querySelectorAll(".palette-zone[data-palette]");
    var colors = getPaletteColors();
    if (!("IntersectionObserver" in window) || !zones.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          var key = entry.target.getAttribute("data-palette") || "";
          document.body.setAttribute("data-scroll-palette", key);
          var c = colors[key];
          if (c && document.body.getAttribute("data-route") !== "home") {
            document.documentElement.style.setProperty("--scroll-bg", c.bg);
            document.documentElement.style.setProperty("--scroll-fg", c.text);
          }
        }
      });
    }, { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -20% 0px" });
    zones.forEach(function (z) { observer.observe(z); });
  }

  function updateDeskNav(routeId) {
    var overflowRoutes = ["spacing", "color", "applications", "components", "accessibility"];

    document.querySelectorAll(".desk-nav__btn, .bottom-nav__btn[data-route]").forEach(function (btn) {
      var active = btn.getAttribute("data-route") === routeId;
      btn.classList.toggle("is-active", active);
      if (active) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });

    var menuBtn = document.getElementById("bottomMenuTrigger");
    if (menuBtn) {
      var overflowActive = overflowRoutes.indexOf(routeId) !== -1;
      menuBtn.classList.toggle("is-active", overflowActive);
      if (overflowActive) menuBtn.setAttribute("aria-current", "page");
      else menuBtn.removeAttribute("aria-current");
    }
  }

  function initMenu() {
    var trigger = document.getElementById("bottomMenuTrigger");
    var menu = document.getElementById("siteMenu");
    var backdrop = document.getElementById("menuBackdrop");
    var menuMode = document.getElementById("menuModeToggle");
    if (!trigger || !menu) return;

    function openMenu() {
      menu.hidden = false;
      document.body.classList.add("menu-open");
      trigger.setAttribute("aria-expanded", "true");
      trigger.setAttribute("aria-label", "Close menu");
    }
    function closeMenu() {
      menu.hidden = true;
      document.body.classList.remove("menu-open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-label", "More sections");
    }

    trigger.addEventListener("click", function () {
      if (document.body.classList.contains("menu-open")) closeMenu();
      else openMenu();
    });
    if (backdrop) backdrop.addEventListener("click", closeMenu);
    menu.querySelectorAll("[data-route]").forEach(function (btn) {
      btn.addEventListener("click", function () { closeMenu(); });
    });
    if (menuMode) {
      menuMode.addEventListener("click", function () {
        setMode(document.documentElement.getAttribute("data-mode") === "dark" ? "light" : "dark");
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) closeMenu();
    });
  }

  function initMagneticTiles() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".bento, .tile").forEach(function (tile) {
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

  document.querySelectorAll("[data-mode-set]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.getAttribute("data-mode-set"));
    });
  });

  var savedMode = null;
  try {
    savedMode = localStorage.getItem("jemm-guide-mode") || localStorage.getItem("jemm-mode");
  } catch (e) {}

  setMode(savedMode === "dark" ? "dark" : "light");
  refreshBuiltInLogos();
  syncHeights();
  window.addEventListener("resize", syncHeights, { passive: true });
  window.addEventListener("load", syncHeights);

  initMenu();
  initRouting();
  initCopy();
  initContrastPairings();
  initInteractiveComponents();
  initMagneticTiles();
  initPaletteScroll();
  if (tileGrid) tileGrid.classList.add("is-idle");
  observeReveals(viewHome);
})();
