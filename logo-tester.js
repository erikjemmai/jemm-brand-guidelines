(function () {
  var STORAGE_KEY = "jemm-guide-logo-test";
  var MAX_BYTES = 1024 * 1024;
  var DEFAULT_ID = "default";

  var activeUpload = null;

  function createId() {
    return "logo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function emptyState() {
    return { activeId: DEFAULT_ID, logos: [] };
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      var data = JSON.parse(raw);

      if (Array.isArray(data.logos)) {
        return {
          activeId: data.activeId || DEFAULT_ID,
          logos: data.logos.filter(function (item) {
            return item && item.id && item.logo && item.tone;
          })
        };
      }

      if (data.logo && data.tone) {
        var legacyId = createId();
        return {
          activeId: legacyId,
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

  function testableTargets() {
    return document.querySelectorAll("[data-logo-auto], [data-logo-testable]");
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

  function cacheDefaultSources() {
    document.querySelectorAll("[data-logo-testable]").forEach(function (el) {
      if (!el.getAttribute("data-logo-default-src")) {
        el.setAttribute("data-logo-default-src", el.getAttribute("src") || "");
      }
    });
  }

  function applyBuiltInLogos() {
    activeUpload = null;
    document.querySelectorAll("[data-logo-testable]").forEach(function (el) {
      var src = el.getAttribute("data-logo-default-src");
      if (src) {
        el.src = src;
        clearTreatment(el);
      }
    });
    if (typeof window.jemmGuideRefreshBuiltInLogos === "function") {
      window.jemmGuideRefreshBuiltInLogos();
    }
  }

  function applyUpload(dataUrl, uploadTone) {
    activeUpload = { logo: dataUrl, tone: uploadTone };
    testableTargets().forEach(function (el) {
      el.src = dataUrl;
      setTreatment(el, treatmentFor(uploadTone, el));
    });
  }

  function applyActive(state) {
    var entry = getLogoById(state, state.activeId);
    if (!entry) {
      applyBuiltInLogos();
      updatePreview(null);
      return;
    }
    applyUpload(entry.logo, entry.tone);
    updatePreview(entry.logo);
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
            tone: tone
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
    var tester = document.getElementById("logoTester");
    if (!tester) return;

    cacheDefaultSources();
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
      if (!activeUpload) return;
      applyUpload(activeUpload.logo, activeUpload.tone);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLogoTester);
  } else {
    initLogoTester();
  }
})();
