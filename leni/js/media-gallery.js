// ==========================================================
// MEDIA GALLERY 

(function () {
  const STORAGE = {
    capacityGB: 500,
    usedGB: 438.6,
    capturesGB: 254.4458,
  };

  const fmtGB = (gb) => +gb.toFixed(2) + " GB";

  function initMediaGallery() {
    const root = widgetsPanel.querySelector("#mgRoot");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";

    const q = (s) => root.querySelector(s);
    const items = [...root.querySelectorAll(".mg-grid .gallery-item")];

    // hover info (date + size) and category tag on every tile
    items.forEach((it) => {
      const gb = parseFloat(it.dataset.gb) || 0;
      const tag = document.createElement("span");
      tag.className = "mg-tag";
      tag.textContent = (it.dataset.cat || "").toUpperCase();
      const info = document.createElement("span");
      info.className = "mg-info";
      info.innerHTML = `<span>${it.dataset.date || ""}</span>`;
      it.append(tag, info);
    });

    // storage numbers (typed in above, nothing is calculated from the tiles)
    const otherGb = Math.max(0, STORAGE.usedGB - STORAGE.capturesGB);
    const freeGb = Math.max(0, STORAGE.capacityGB - STORAGE.usedGB);

    q("[data-mg-used]").textContent = STORAGE.usedGB;
    q("[data-mg-cap]").textContent = STORAGE.capacityGB;
    q("[data-mg-captures]").textContent = fmtGB(STORAGE.capturesGB);
    q("[data-mg-other]").textContent = fmtGB(otherGb);
    q("[data-mg-free]").textContent = fmtGB(freeGb);
    q("[data-mg-count]").textContent =
      items.length + (items.length === 1 ? " capture" : " captures");

    // animate the bar in after first paint
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        q("[data-mg-seg-other]").style.width =
          (otherGb / STORAGE.capacityGB) * 100 + "%";
        q("[data-mg-seg-captures]").style.width =
          (STORAGE.capturesGB / STORAGE.capacityGB) * 100 + "%";
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
  }

  // the panel's innerHTML is replaced on every card change, so watch for it
  new MutationObserver(initMediaGallery).observe(widgetsPanel, {
    childList: true,
  });
  initMediaGallery();

  // filtering (delegated, because the panel itself is never replaced)
  widgetsPanel.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-mg-f]");
    if (!chip) return;
    const root = chip.closest("#mgRoot");
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