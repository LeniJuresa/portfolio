const widgetPopupOverlay = document.getElementById("widgetPopupOverlay");
const widgetPopupTitle = document.getElementById("widgetPopupTitle");
const widgetPopupBody = document.getElementById("widgetPopupBody");
const widgetPopupClose = document.getElementById("widgetPopupClose");
const widgetPopupCover = document.getElementById("widgetPopupCover");

// ---------- popup open / close ----------
if (widgetPopupOverlay && widgetPopupTitle && widgetPopupBody) {
  let lastFocusedTile = null;
  const popupBox = widgetPopupOverlay.querySelector(".widget-popup");

  function openWidgetPopup(key, triggerEl) {
    const tpl = document.querySelector(`template[data-popup-key="${key}"]`);
    if (!tpl) return;

    widgetPopupTitle.textContent = tpl.dataset.title || "";
    widgetPopupBody.innerHTML = tpl.innerHTML;
    widgetPopupOverlay.dataset.size = tpl.dataset.size || "lg";

    const cover = tpl.dataset.cover || "";
    if (widgetPopupCover) {
      widgetPopupCover.style.backgroundImage = cover ? `url("${cover}")` : "";
      widgetPopupCover.classList.toggle("has-cover", !!cover);
    }

    if (key === "activity") loadGithubActivity(widgetPopupBody);
    if (key === "trophies") renderTrophies(widgetPopupBody);
    if (key === "contact") startContactClock(widgetPopupBody);

    if (popupBox) popupBox.scrollTop = 0;
    widgetPopupOverlay.classList.add("open");
    lastFocusedTile = triggerEl || null;
    widgetPopupClose.focus();
  }

  function closeWidgetPopup() {
    widgetPopupOverlay.classList.remove("open");
    if (lastFocusedTile) lastFocusedTile.focus();
  }

  document.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-popup]");
    if (!tile) return; // fixes the TypeError on every non-tile click
    playSound("click");
    openWidgetPopup(tile.dataset.popup, tile);
  });

  widgetPopupClose.addEventListener("click", closeWidgetPopup);

  widgetPopupBody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const text = btn.dataset.copy;
    const label = btn.querySelector("[data-copy-label]");

    const done = () => {
      if (!label) return;
      const old = label.textContent;
      label.textContent = "Copied!";
      setTimeout(() => (label.textContent = old), 1600);
    };

    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (_) {}
      ta.remove();
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  });

  widgetPopupBody.addEventListener("click", (e) => {
    const t = e.target.closest("[data-nav-target]");
    if (!t) return;
    lastFocusedTile = null; // don't pull focus back to the About tile
    closeWidgetPopup();
    navigateToWidgetTarget(t.dataset.navTarget);
  });

  onActivate("[data-popup]", (tile) =>
    openWidgetPopup(tile.dataset.popup, tile),
  );
  registerEscape(
    10,
    () => widgetPopupOverlay.classList.contains("open"),
    closeWidgetPopup,
  );
}