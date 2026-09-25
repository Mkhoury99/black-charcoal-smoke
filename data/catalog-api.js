/* Shared catalog load/save for the shop and admin.
 * Prefers Firebase Realtime Database when BCS_BACKEND.databaseURL is set.
 */
(function (global) {
  const LOCAL_KEY = "bcs-catalog";

  function dbRoot() {
    const cfg = global.BCS_BACKEND || {};
    const url = (cfg.databaseURL || "").trim().replace(/\/+$/, "");
    return url || "";
  }

  function cloudEnabled() {
    return !!dbRoot();
  }

  function catalogUrl() {
    return dbRoot() + "/catalog.json";
  }

  function readLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeLocal(data) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function clearLocal() {
    try {
      localStorage.removeItem(LOCAL_KEY);
    } catch (e) {}
  }

  function looksLikeCatalog(data) {
    return data && Array.isArray(data.products);
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function loadSeed() {
    const base = document.currentScript && document.currentScript.src
      ? new URL(".", document.currentScript.src).href
      : "";
    // Prefer relative paths used by each page.
    const candidates = [
      "data/catalog.json?ts=" + Date.now(),
      "../data/catalog.json?ts=" + Date.now()
    ];
    for (const path of candidates) {
      try {
        const data = await fetchJson(path);
        if (looksLikeCatalog(data)) return data;
      } catch (e) {}
    }
    if (base) {
      try {
        const data = await fetchJson(base + "catalog.json?ts=" + Date.now());
        if (looksLikeCatalog(data)) return data;
      } catch (e) {}
    }
    throw new Error("Could not load catalog.json");
  }

  async function loadCloud() {
    if (!cloudEnabled()) return null;
    const data = await fetchJson(catalogUrl());
    return looksLikeCatalog(data) ? data : null;
  }

  async function saveCloud(data) {
    if (!cloudEnabled()) throw new Error("Cloud backend is not configured");
    const res = await fetch(catalogUrl(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Cloud save failed (HTTP " + res.status + ")");
    return res.json().catch(() => data);
  }

  /**
   * Load catalog for the public shop.
   * Cloud (if configured) → else local override → else catalog.json
   */
  async function loadForShop() {
    if (cloudEnabled()) {
      try {
        const cloud = await loadCloud();
        if (cloud) return { catalog: cloud, source: "cloud" };
      } catch (e) {}
      const seed = await loadSeed();
      return { catalog: seed, source: "file" };
    }
    const local = readLocal();
    if (looksLikeCatalog(local)) return { catalog: local, source: "local" };
    const seed = await loadSeed();
    return { catalog: seed, source: "file" };
  }

  /**
   * Load catalog for the admin editor.
   * Cloud (if configured) → else local → else catalog.json
   */
  async function loadForAdmin() {
    if (cloudEnabled()) {
      try {
        const cloud = await loadCloud();
        if (cloud) return { catalog: cloud, source: "cloud" };
      } catch (e) {}
      const seed = await loadSeed();
      return { catalog: seed, source: "file" };
    }
    const local = readLocal();
    if (looksLikeCatalog(local)) return { catalog: local, source: "local" };
    const seed = await loadSeed();
    return { catalog: seed, source: "file" };
  }

  /**
   * Persist catalog. Cloud when configured; always mirrors to localStorage as cache.
   */
  async function saveCatalog(data) {
    if (cloudEnabled()) {
      await saveCloud(data);
      writeLocal(data);
      return { source: "cloud" };
    }
    writeLocal(data);
    return { source: "local" };
  }

  global.BCSCatalog = {
    cloudEnabled,
    dbRoot,
    loadForShop,
    loadForAdmin,
    saveCatalog,
    readLocal,
    writeLocal,
    clearLocal,
    loadSeed
  };
})(window);
