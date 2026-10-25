// ==========================================================
// TROPHIES POPUP
// To add a trophy, add one line to a section.
// tier: "bronze" | "silver" | "gold" | "platinum"
// img can be "" if you don't have a picture yet.
// ==========================================================
const TROPHIES = {
  IT: [
    {
      img: "../assets/images/placeholder.svg",
      title: "Platinum example ",
      tier: "platinum",
      date: "Future",
      desc: "This will be the description of the trophie, here i will explain how i got thie achivement and why it is mentioned here",
    },
    {
      img: "../assets/images/placeholder.svg",
      title: "Gold example ",
      tier: "gold",
      date: "Future",
      desc: "This will be the description of the trophie, here i will explain how i got thie achivement and why it is mentioned here",
    },
    {
      img: "../assets/images/placeholder.svg",
      title: "Silver example ",
      tier: "silver",
      date: "Future",
      desc: "This will be the description of the trophie, here i will explain how i got thie achivement and why it is mentioned here",
    },
    {
      img: "../assets/images/placeholder.svg",
      title: "Bronze example ",
      tier: "bronze",
      date: "Future",
      desc: "This will be the description of the trophie, here i will explain how i got thie achivement and why it is mentioned here",
    },
  ],
  "My life": [
    {
      img: "../assets/images/placeholder.svg",
      title: "First 40+ meter dive",
      tier: "gold",
      date: "2024",
      desc: "This will be the description of the trophie, here i will explain how i got thie achivement and why it is mentioned here",
    },
  ],
};

function renderTrophies(root) {
  const box = root.querySelector("[data-trophies]");
  if (!box) return;
  box.innerHTML = Object.entries(TROPHIES)
    .map(
      ([section, list]) => `
      <h4 class="pb-h">${ghEsc(section)}</h4>
      <div class="tr-list">
        ${list
          .map(
            (t, i) => `
          <button type="button" class="tr-row" data-section="${ghEsc(section)}" data-i="${i}">
            ${t.img ? `<img src="${ghEsc(t.img)}" alt="" loading="lazy">` : `<span class="tr-noimg"></span>`}
            <span class="tr-title">${ghEsc(t.title)}</span>
            <span class="tr-date">${ghEsc(t.date || "")}</span>
            <span class="tr-tier" data-tier="${t.tier}">${TROPHY_SVG}<span></span></span>
          </button>`,
          )
          .join("")}
      </div>`,
    )
    .join("");
}

// small popup that slides up when a trophy is clicked
const trPop = document.createElement("div");
trPop.className = "tr-pop-overlay";
trPop.innerHTML = `
  <div class="tr-pop" role="dialog" aria-modal="true" aria-labelledby="trPopTitle">
    <button class="tr-pop-close" type="button" aria-label="Close">&times;</button>
    <img class="tr-pop-img" alt="">
    <div class="tr-pop-tier"></div>
    <h3 class="tr-pop-title" id="trPopTitle"></h3>
      <div class="tr-pop-date"></div>
    <p class="tr-pop-desc"></p>
  </div>`;
document.body.appendChild(trPop);

let trLastTrigger = null;

function openTrophy(t, trigger) {
  const img = trPop.querySelector(".tr-pop-img");
  img.hidden = !t.img;
  img.src = t.img || "";
  const tier = trPop.querySelector(".tr-pop-tier");
  tier.dataset.tier = t.tier;
  tier.innerHTML = `${TROPHY_SVG}<span>${t.tier}</span>`;
  trPop.querySelector(".tr-pop-title").textContent = t.title;
  trPop.querySelector(".tr-pop-date").textContent = t.date || "";
  trPop.querySelector(".tr-pop-desc").textContent = t.desc || "";
  trLastTrigger = trigger || null;
  trPop.classList.add("open");
  trPop.querySelector(".tr-pop-close").focus();
}

function closeTrophy() {
  trPop.classList.remove("open");
  if (trLastTrigger) trLastTrigger.focus();
}

widgetPopupBody.addEventListener("click", (e) => {
  const row = e.target.closest(".tr-row");
  if (!row) return;
  const t = TROPHIES[row.dataset.section]?.[row.dataset.i];
  if (t) openTrophy(t, row);
});

trPop.querySelector(".tr-pop-close").addEventListener("click", closeTrophy);
trPop.addEventListener("click", (e) => {
  if (e.target === trPop) closeTrophy();
});
// keep arrow keys / Enter from moving the profile selector behind the popups
trPop.addEventListener("keydown", (e) => e.stopPropagation());
registerEscape(14, () => trPop.classList.contains("open"), closeTrophy);