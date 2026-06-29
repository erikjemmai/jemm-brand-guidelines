(function () {
  var STORAGE_KEY = "jemm-guide-dark-surface";
  var DEFAULT = "charcoal-steel";

  var SURFACES = {
    "charcoal-steel": { label: "Charcoal + steel footer", group: "Mixed" },
    "charcoal-deep": { label: "Charcoal + deep green footer", group: "Mixed" },
    "deep-charcoal": { label: "Deep green + charcoal cards", group: "Mixed" },
    "deep-steel": { label: "Deep green + steel surfaces", group: "Mixed" },
    "steel-charcoal": { label: "Steel + charcoal cards", group: "Mixed" },
    "steel-deep": { label: "Steel + deep green accents", group: "Mixed" },
    "ink-charcoal": { label: "Ink + charcoal lift", group: "Mixed" },
    "ink-deep": { label: "Ink + deep green footer", group: "Mixed" },
    charcoal: { label: "Charcoal mono", group: "Solid" },
    ink: { label: "Ink mono", group: "Solid" },
    deep: { label: "Deep green mono", group: "Solid" },
    steel: { label: "Dark steel mono", group: "Solid" }
  };

  var legacyMap = {
    charcoal: "charcoal-steel"
  };

  function normalize(id) {
    if (SURFACES[id]) return id;
    if (legacyMap[id]) return legacyMap[id];
    return DEFAULT;
  }

  function labelFor(id) {
    var spec = SURFACES[normalize(id)];
    return spec ? spec.label : "Dark";
  }

  function apply(id) {
    id = normalize(id);
    document.documentElement.setAttribute("data-dark-surface", id);
    var select = document.getElementById("darkSurfaceSelect");
    if (select && select.value !== id) select.value = id;
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
  }

  function clear() {
    document.documentElement.removeAttribute("data-dark-surface");
  }

  function savedId() {
    try {
      return normalize(localStorage.getItem(STORAGE_KEY) || DEFAULT);
    } catch (e) {
      return DEFAULT;
    }
  }

  function renderSelect() {
    var select = document.getElementById("darkSurfaceSelect");
    if (!select) return;
    if (select.dataset.rendered && select.options.length > 0) return;

    select.innerHTML = "";
    ["Mixed", "Solid"].forEach(function (groupName) {
      var group = document.createElement("optgroup");
      group.label = groupName;
      Object.keys(SURFACES).forEach(function (id) {
        if (SURFACES[id].group !== groupName) return;
        var option = document.createElement("option");
        option.value = id;
        option.textContent = SURFACES[id].label;
        group.appendChild(option);
      });
      if (group.children.length) select.appendChild(group);
    });

    select.dataset.rendered = "1";
    select.value = savedId();
  }

  function onModeChange(mode) {
    if (mode === "dark") apply(savedId());
    else clear();
  }

  function init() {
    renderSelect();
    var select = document.getElementById("darkSurfaceSelect");
    if (select && !select.dataset.bound) {
      select.addEventListener("change", function () {
        apply(select.value);
      });
      select.dataset.bound = "1";
    }
    if (document.documentElement.getAttribute("data-mode") === "dark") {
      apply(savedId());
    }
  }

  function initWhenReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  window.jemmDarkSurface = {
    DEFAULT: DEFAULT,
    SURFACES: SURFACES,
    normalize: normalize,
    labelFor: labelFor,
    apply: apply,
    clear: clear,
    savedId: savedId,
    onModeChange: onModeChange,
    init: init
  };

  initWhenReady();
})();
