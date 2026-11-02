// ==========================================================
// MEDIA GALLERY 

(function () {
const STORAGE = {
  main: {unit:"GB", capacityGB: 500, usedGB: 438.6, capturesGB: 254.44, otherGB: 184.16 },
  life: {unit:"Years", capacityGB: 100, usedGB: 21.4,    capturesGB: 14.4,     otherGB: 7 },
};

  const fmtGB = (gb) => +gb.toFixed(2) + " GB";

  function initMediaGallery() {
    widgetsPanel.querySelectorAll("[data-mg-root]").forEach((root) => {
      if (root.dataset.ready) return;

      const S = STORAGE[root.dataset.mgRoot];
      if (!S) {
        console.error(`No STORAGE entry for "${root.dataset.mgRoot}"`);
        return;
      }
      root.dataset.ready = "1";

      const q = (s) => root.querySelector(s);
      const items = [...root.querySelectorAll(".mg-grid .gallery-item")];

      // category tag + date on every tile
      items.forEach((it) => {
        const tag = document.createElement("span");
        tag.className = "mg-tag";
        tag.textContent = (it.dataset.cat || "").toUpperCase();
        const info = document.createElement("span");
        info.className = "mg-info";
        info.innerHTML = `<span>${it.dataset.date || ""}</span>`;
        it.append(tag, info);
      });

      const otherGb = Math.max(0, S.usedGB - S.capturesGB);
      const freeGb = Math.max(0, S.capacityGB - S.usedGB);

     const fmt = (n) => +n.toFixed(2) + " " + S.unit;

      q("[data-mg-used]").textContent = S.usedGB;
      q("[data-mg-cap]").textContent = S.capacityGB;
      root.querySelectorAll("[data-mg-unit]").forEach((el) => {
        el.textContent = S.unit;
      });
      q("[data-mg-captures]").textContent = fmt(S.capturesGB);
      q("[data-mg-other]").textContent = fmt(S.otherGB);
      q("[data-mg-free]").textContent = fmt(Math.max(0, S.capacityGB - S.usedGB));
      q("[data-mg-count]").textContent =
        items.length + (items.length === 1 ? " capture" : " captures");

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          q("[data-mg-seg-other]").style.width =
            (S.otherGB / S.capacityGB) * 100 + "%";
          q("[data-mg-seg-captures]").style.width =
            (S.capturesGB / S.capacityGB) * 100 + "%";
        }),
      );

      // filter chips built from data-cat
      const cats = [...new Set(items.map((i) => i.dataset.cat).filter(Boolean))];
      q("[data-mg-filters]").innerHTML = ["all", ...cats]
        .map(
          (c) =>
            `<button type="button" class="mg-chip${c === "all" ? " active" : ""}" data-mg-f="${c}">${c === "all" ? "All" : c}</button>`,
        )
        .join("");
    });
  }

  new MutationObserver(initMediaGallery).observe(widgetsPanel, {
    childList: true,
  });
  initMediaGallery();

  // filtering (delegated, scoped to the clicked chip's own gallery)
  widgetsPanel.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-mg-f]");
    if (!chip) return;
    const root = chip.closest("[data-mg-root]");
    const f = chip.dataset.mgF;
    root
      .querySelectorAll(".mg-chip")
      .forEach((c) => c.classList.toggle("active", c === chip));
    let shown = 0;
    root.querySelectorAll(".mg-grid .gallery-item").forEach((it) => {
      const vis = f === "all" || it.dataset.cat === f;
      it.hidden = !vis;
      if (vis) shown++;
    });
    root.querySelector("[data-mg-empty]").hidden = shown > 0;
    playSound("move");
  });
})();