(function () {
  var STORAGE_KEY = "jemm-guide-logo-test";
  var MAX_BYTES = 1024 * 1024;
  var DEFAULT_ID = "default";

  var DISPLAY_FORMATS = {
    normal: { label: "Normal lockup" },
    landscape: { label: "Landscape lockup" },
    mark: { label: "Logomark" },
    wordmark: { label: "Logotype" }
  };

  var DEFAULT_FORMAT = "normal";
  var LOGOTYPE = "jemm";

  var MARK_DEFAULTS = {
    light: "assets/jemm-mark-light.svg",
    dark: "assets/jemm-mark-dark.svg"
  };

  var PALETTE = [
    { id: "auto", label: "Auto" },
    { id: "emerald", label: "Emerald", hex: "#059161" },
    { id: "neon", label: "Neon Green", hex: "#00D58C" },
    { id: "deep", label: "Deep Green", hex: "#002928" },
    { id: "steel", label: "Dark Steel", hex: "#283239" },
    { id: "white", label: "White", hex: "#FFFFFF" },
    { id: "ink", label: "Ink", hex: "#121212" }
  ];

  var activeUpload = null;
  var recolorCache = {};

  function createId() {
    return "logo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function emptyState() {
    return { activeId: DEFAULT_ID, logos: [], displayFormat: DEFAULT_FORMAT };
  }

  function normalizeDisplayFormat(value) {
    return DISPLAY_FORMATS[value] ? value : DEFAULT_FORMAT;
  }

  function getDisplayFormat(state) {
    return normalizeDisplayFormat(state && state.displayFormat);
  }

  function syncDisplayFormatAttr(format) {
    document.documentElement.setAttribute("data-logo-display", normalizeDisplayFormat(format));
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      var data = JSON.parse(raw);

      if (Array.isArray(data.logos)) {
        return {
          activeId: data.activeId || DEFAULT_ID,
          displayFormat: normalizeDisplayFormat(data.displayFormat),
          logos: data.logos.filter(function (item) {
            return item && item.id && item.logo && item.tone;
          })
        };
      }

      if (data.logo && data.tone) {
        var legacyId = createId();
        return {
          activeId: legacyId,
          displayFormat: DEFAULT_FORMAT,
          logos: [{ id: legacyId, name: "Uploaded logo", logo: data.logo, tone: data.tone }]
        };
      }

      return emptyState();
    } catch (e) {
      return emptyState();
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      window.alert("Could not save logos — storage may be full. Try removing some uploads.");
    }
  }

  function getLogoById(state, id) {
    if (id === DEFAULT_ID) return null;
    for (var i = 0; i < state.logos.length; i += 1) {
      if (state.logos[i].id === id) return state.logos[i];
    }
    return null;
  }

  function clearTreatment(img) {
    img.classList.remove("logo-auto-to-white", "logo-auto-to-black");
  }

  function setTreatment(img, treatment) {
    clearTreatment(img);
    if (treatment) img.classList.add(treatment);
  }

  function contextTone(el) {
    var tone = el.getAttribute("data-logo-tone") || "light";
    if (tone === "nav") {
      return document.documentElement.getAttribute("data-mode") === "dark" ? "dark" : "light";
    }
    return tone;
  }

  function isDarkContext(tone) {
    return tone === "dark" || tone === "emerald" || tone === "steel";
  }

  function treatmentFor(uploadTone, el) {
    var ctx = contextTone(el);
    if (isDarkContext(ctx)) {
      return uploadTone === "dark" ? "logo-auto-to-white" : null;
    }
    return uploadTone === "light" ? "logo-auto-to-black" : null;
  }

  function isLockupSrc(src) {
    return src && /lockup/i.test(src);
  }

  function sizeClassForImg(img) {
    if (img.classList.contains("logo-img--hero")) return "logo-lockup--hero";
    if (img.classList.contains("logo-img--nav")) return "logo-lockup--nav";
    if (img.classList.contains("logo-img--cell")) return "logo-lockup--cell";
    if (img.classList.contains("logo-img--lockup")) return "logo-lockup--spec";
    if (img.classList.contains("logo-img--sm")) return "logo-lockup--sm";
    if (img.classList.contains("logo-img--lg")) return "logo-lockup--lg";
    if (img.classList.contains("bento__logo")) return "logo-lockup--bento";
    return "";
  }

  function createComposedLockup(tone, alt) {
    var lockup = document.createElement("span");
    lockup.className = "logo-lockup";
    lockup.setAttribute("data-logo-tone", tone);

    var compose = document.createElement("span");
    compose.className = "logo-lockup__compose";

    var markLight = document.createElement("img");
    markLight.className = "logo-lockup__mark logo-lockup__mark--light";
    markLight.src = MARK_DEFAULTS.light;
    markLight.alt = alt || "";
    markLight.decoding = "async";

    var markDark = document.createElement("img");
    markDark.className = "logo-lockup__mark logo-lockup__mark--dark";
    markDark.src = MARK_DEFAULTS.dark;
    markDark.alt = alt || "";
    markDark.decoding = "async";

    var type = document.createElement("span");
    type.className = "logo-lockup__type";
    type.setAttribute("aria-hidden", "true");
    type.textContent = LOGOTYPE;

    compose.appendChild(markLight);
    compose.appendChild(markDark);
    compose.appendChild(type);
    lockup.appendChild(compose);
    return lockup;
  }

  function migrateLockupImages() {
    document.querySelectorAll("img[data-logo-auto], img[data-logo-testable]").forEach(function (img) {
      if (!isLockupSrc(img.getAttribute("src"))) return;
      if (img.closest(".logo-lockup")) return;
      if (img.classList.contains("logo-misuse") || img.closest(".logo-misuse")) return;

      var tone = img.getAttribute("data-logo-tone") || "light";
      var alt = img.getAttribute("alt") || "";
      var lockup = createComposedLockup(tone, alt);
      var sizeClass = sizeClassForImg(img);
      if (sizeClass) lockup.classList.add(sizeClass);

      if (img.hasAttribute("data-logo-testable")) lockup.setAttribute("data-logo-testable", "");
      if (img.hasAttribute("data-logo-auto")) lockup.setAttribute("data-logo-auto", "");

      img.replaceWith(lockup);
    });
  }

  function syncLogotypeLabels() {
    document.querySelectorAll(".logo-lockup__type").forEach(function (el) {
      el.textContent = LOGOTYPE;
    });
  }

  function applyDefaultMarks() {
    activeUpload = null;
    document.querySelectorAll(".logo-lockup__mark--light").forEach(function (img) {
      img.src = MARK_DEFAULTS.light;
      clearTreatment(img);
      img.style.display = "";
    });
    document.querySelectorAll(".logo-lockup__mark--dark").forEach(function (img) {
      img.src = MARK_DEFAULTS.dark;
      clearTreatment(img);
      img.style.display = "";
    });
    document.querySelectorAll('img[data-logo-part="mark"]').forEach(function (img) {
      clearTreatment(img);
    });
    document.querySelectorAll(".logo-lockup__type, [data-logo-part=\"type\"]").forEach(function (el) {
      el.style.color = "";
    });
    document.querySelectorAll(".logo-lockup").forEach(function (lockup) {
      lockup.style.color = "";
    });
    if (typeof window.jemmGuideRefreshBuiltInLogos === "function") {
      window.jemmGuideRefreshBuiltInLogos();
    }
  }

  function applyCustomMark(dataUrl, uploadTone, paletteColor) {
    activeUpload = {
      logo: dataUrl,
      tone: uploadTone,
      paletteColor: paletteColor || "auto"
    };
    var useAutoTone = !paletteColor || paletteColor === "auto";
    var hex = paletteColor && paletteColor !== "auto" ? paletteHex(paletteColor) : null;

    document.querySelectorAll(".logo-lockup").forEach(function (lockup) {
      var tone = lockup.getAttribute("data-logo-tone") || "light";
      var ctx = contextTone(lockup);
      var showLight = !isDarkContext(ctx);
      var lightMark = lockup.querySelector(".logo-lockup__mark--light");
      var darkMark = lockup.querySelector(".logo-lockup__mark--dark");
      if (!lightMark || !darkMark) return;

      lightMark.src = dataUrl;
      darkMark.src = dataUrl;
      lightMark.style.display = showLight ? "block" : "none";
      darkMark.style.display = showLight ? "none" : "block";

      clearTreatment(lightMark);
      clearTreatment(darkMark);
      if (useAutoTone) {
        setTreatment(showLight ? lightMark : darkMark, treatmentFor(uploadTone, lockup));
      }

      var type = lockup.querySelector(".logo-lockup__type");
      if (type) type.style.color = hex || "";
      if (!hex) lockup.style.color = "";
    });

    document.querySelectorAll('img[data-logo-part="mark"]').forEach(function (img) {
      img.src = dataUrl;
      clearTreatment(img);
      if (useAutoTone) setTreatment(img, treatmentFor(uploadTone, img));
    });

    document.querySelectorAll('[data-logo-part="type"]').forEach(function (el) {
      el.style.color = hex || "";
    });
  }

  function hexToRgb(hex) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    if (hex.length !== 6) return { r: 0, g: 0, b: 0 };
    var num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function paletteHex(colorId) {
    for (var i = 0; i < PALETTE.length; i += 1) {
      if (PALETTE[i].id === colorId) return PALETTE[i].hex || null;
    }
    return null;
  }

  function recolorDataUrl(dataUrl, hex, callback) {
    var rgb = hexToRgb(hex);
    var img = new Image();
    img.onload = function () {
      var width = img.naturalWidth || img.width || 1;
      var height = img.naturalHeight || img.height || 1;
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      var imageData;
      try {
        imageData = ctx.getImageData(0, 0, width, height);
      } catch (e) {
        callback(dataUrl);
        return;
      }
      var pixels = imageData.data;
      for (var i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 24) continue;
        pixels[i] = rgb.r;
        pixels[i + 1] = rgb.g;
        pixels[i + 2] = rgb.b;
      }
      ctx.putImageData(imageData, 0, 0);
      callback(canvas.toDataURL());
    };
    img.onerror = function () {
      callback(dataUrl);
    };
    img.src = dataUrl;
  }

  function getRecoloredLogo(source, colorId, callback) {
    var hex = paletteHex(colorId);
    if (!hex) {
      callback(source);
      return;
    }
    var key = colorId + "|" + source.length + "|" + source.slice(-48);
    if (recolorCache[key]) {
      callback(recolorCache[key]);
      return;
    }
    recolorDataUrl(source, hex, function (result) {
      recolorCache[key] = result;
      callback(result);
    });
  }

  function renderPalette(state) {
    var field = document.getElementById("logoPaletteField");
    var group = document.getElementById("logoColorSwatches");
    if (!field || !group) return;

    var entry = getLogoById(state, state.activeId);
    if (!entry) {
      field.hidden = true;
      return;
    }
    field.hidden = false;

    var current = entry.paletteColor || "auto";
    if (!group.dataset.rendered) {
      group.innerHTML = "";
      PALETTE.forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "logo-tester__swatch" + (item.id === "auto" ? " logo-tester__swatch--auto" : "");
        btn.setAttribute("data-logo-color", item.id);
        btn.setAttribute("aria-label", item.label);
        btn.title = item.label;
        if (item.hex) btn.style.setProperty("--swatch", item.hex);
        if (item.id === "auto") btn.textContent = "Auto";
        btn.addEventListener("click", function () {
          var next = loadState();
          var active = getLogoById(next, next.activeId);
          if (!active) return;
          active.paletteColor = item.id;
          saveState(next);
          syncUi(next);
        });
        group.appendChild(btn);
      });
      group.dataset.rendered = "1";
    }

    group.querySelectorAll(".logo-tester__swatch").forEach(function (btn) {
      var selected = btn.getAttribute("data-logo-color") === current;
      btn.classList.toggle("is-active", selected);
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function renderDisplaySelect(state) {
    var select = document.getElementById("logoDisplaySelect");
    if (!select) return;
    var format = getDisplayFormat(state);
    if (!select.dataset.rendered) {
      select.innerHTML = "";
      Object.keys(DISPLAY_FORMATS).forEach(function (key) {
        var option = document.createElement("option");
        option.value = key;
        option.textContent = DISPLAY_FORMATS[key].label;
        select.appendChild(option);
      });
      select.dataset.rendered = "1";
    }
    select.value = format;
  }

  function applyActive(state) {
    var format = getDisplayFormat(state);
    syncDisplayFormatAttr(format);
    renderDisplaySelect(state);
    syncLogotypeLabels();

    var entry = getLogoById(state, state.activeId);
    renderPalette(state);
    if (!entry) {
      applyDefaultMarks();
      updatePreview(null);
      return;
    }

    var paletteColor = entry.paletteColor || "auto";
    function finish(url) {
      applyCustomMark(url, entry.tone, paletteColor);
      updatePreview(url);
    }

    if (paletteColor === "auto") {
      finish(entry.logo);
      return;
    }

    getRecoloredLogo(entry.logo, paletteColor, finish);
  }

  function updatePreview(dataUrl) {
    var preview = document.getElementById("logoPreview");
    var dropzone = document.getElementById("logoDropzone");
    if (preview) {
      preview.style.backgroundImage = dataUrl ? "url(\"" + dataUrl + "\")" : "none";
    }
    if (dropzone) dropzone.classList.remove("has-file");
  }

  function truncateName(name, max) {
    if (!name) return "Logo";
    if (name.length <= max) return name;
    return name.slice(0, max - 1) + "…";
  }

  function renderSelect(state) {
    var select = document.getElementById("logoSelect");
    var removeBtn = document.getElementById("logoRemoveBtn");
    if (!select) return;

    var previous = select.value;
    select.innerHTML = "";

    var defaultOption = document.createElement("option");
    defaultOption.value = DEFAULT_ID;
    defaultOption.textContent = "Default — Jemm lockup";
    select.appendChild(defaultOption);

    state.logos.forEach(function (entry, index) {
      var option = document.createElement("option");
      option.value = entry.id;
      option.textContent = truncateName(entry.name || ("Logo " + (index + 1)), 36);
      select.appendChild(option);
    });

    if (getLogoById(state, state.activeId)) {
      select.value = state.activeId;
    } else if (getLogoById(state, previous)) {
      select.value = previous;
    } else {
      select.value = DEFAULT_ID;
    }

    if (removeBtn) {
      removeBtn.disabled = select.value === DEFAULT_ID;
    }
  }

  function syncUi(state) {
    if (!getLogoById(state, state.activeId)) {
      state.activeId = DEFAULT_ID;
    }
    renderSelect(state);
    applyActive(state);
    saveState(state);
  }

  function detectTone(dataUrl, callback) {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement("canvas");
      var width = Math.max(1, Math.min(img.naturalWidth || img.width || 200, 200));
      var height = Math.max(1, Math.min(img.naturalHeight || img.height || 200, 200));
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      var pixels;
      try {
        pixels = ctx.getImageData(0, 0, width, height).data;
      } catch (e) {
        callback("dark");
        return;
      }

      var total = 0;
      var count = 0;
      for (var i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 24) continue;
        total += pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        count += 1;
      }

      callback(!count || total / count < 140 ? "dark" : "light");
    };
    img.onerror = function () {
      callback("dark");
    };
    img.src = dataUrl;
  }

  function isImageFile(file) {
    if (!file) return false;
    if (file.type && file.type.indexOf("image/") === 0) return true;
    var name = file.name.toLowerCase();
    return name.slice(-4) === ".svg" || name.slice(-4) === ".png" || name.slice(-5) === ".webp";
  }

  function toFileList(files) {
    return Array.prototype.slice.call(files || []);
  }

  function addFiles(fileList) {
    var files = toFileList(fileList);
    if (!files.length) return;

    var skippedType = [];
    var skippedSize = [];
    var accepted = [];

    files.forEach(function (file) {
      if (!isImageFile(file)) {
        skippedType.push(file.name || "Unknown file");
        return;
      }
      if (file.size > MAX_BYTES) {
        skippedSize.push(file.name || "Unknown file");
        return;
      }
      accepted.push(file);
    });

    if (!accepted.length) {
      if (skippedType.length) {
        window.alert("No valid image files found. Use SVG, PNG, or WebP.");
      } else if (skippedSize.length) {
        window.alert("All files were over 1 MB. Please use smaller images.");
      }
      return;
    }

    if (skippedType.length || skippedSize.length) {
      var parts = [];
      if (skippedType.length) parts.push(skippedType.length + " unsupported file(s)");
      if (skippedSize.length) parts.push(skippedSize.length + " file(s) over 1 MB");
      window.alert("Added " + accepted.length + " logo(s). Skipped " + parts.join(" and ") + ".");
    }

    var pending = accepted.length;
    var entries = new Array(accepted.length);

    function finishBatch() {
      if (pending > 0) return;
      var added = entries.filter(Boolean);
      if (!added.length) return;

      var state = loadState();
      added.forEach(function (entry) {
        state.logos.push(entry);
      });
      state.activeId = added[added.length - 1].id;
      syncUi(state);
    }

    accepted.forEach(function (file, index) {
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        detectTone(dataUrl, function (tone) {
          entries[index] = {
            id: createId(),
            name: file.name || "Uploaded logo",
            logo: dataUrl,
            tone: tone,
            paletteColor: "auto"
          };
          pending -= 1;
          finishBatch();
        });
      };
      reader.onerror = function () {
        pending -= 1;
        window.alert("Could not read " + (file.name || "a file") + ".");
        finishBatch();
      };
      reader.readAsDataURL(file);
    });
  }

  function bindDropzone(zone, input) {
    input.addEventListener("change", function () {
      addFiles(input.files);
      input.value = "";
    });

    zone.addEventListener("dragover", function (event) {
      event.preventDefault();
      zone.classList.add("is-dragover");
    });

    zone.addEventListener("dragleave", function () {
      zone.classList.remove("is-dragover");
    });

    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      zone.classList.remove("is-dragover");
      addFiles(event.dataTransfer.files);
    });
  }

  function initLogoTester() {
    migrateLockupImages();

    var tester = document.getElementById("logoTester");
    if (!tester) return;

    var state = loadState();
    syncUi(state);

    var zone = document.getElementById("logoDropzone");
    var input = document.getElementById("logoFileInput");
    if (zone && input) bindDropzone(zone, input);

    var select = document.getElementById("logoSelect");
    if (select) {
      select.addEventListener("change", function () {
        var next = loadState();
        next.activeId = select.value || DEFAULT_ID;
        syncUi(next);
      });
    }

    var displaySelect = document.getElementById("logoDisplaySelect");
    if (displaySelect) {
      displaySelect.addEventListener("change", function () {
        var next = loadState();
        next.displayFormat = normalizeDisplayFormat(displaySelect.value);
        syncUi(next);
      });
    }

    var removeBtn = document.getElementById("logoRemoveBtn");
    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        var current = loadState();
        if (current.activeId === DEFAULT_ID) return;
        current.logos = current.logos.filter(function (entry) {
          return entry.id !== current.activeId;
        });
        current.activeId = DEFAULT_ID;
        syncUi(current);
      });
    }

    tester.addEventListener("toggle", function () {
      window.dispatchEvent(new Event("resize"));
    });

    document.addEventListener("click", function (event) {
      if (!tester.open || tester.contains(event.target)) return;
      tester.open = false;
    });
  }

  window.jemmLogoTester = {
    isActive: function () {
      return !!activeUpload;
    },
    reapply: function () {
      applyActive(loadState());
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogoTester);
  } else {
    initLogoTester();
  }
})();
