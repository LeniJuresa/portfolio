// ==========================================================
// Life & hobbies
(function () {
  const $text = document.getElementById("cardDetailText");
  if (!$text) return;

  // show one box + its panel
  function select(box, focus) {
    const root = box.closest(".bc");
    root.querySelectorAll(".bc-box").forEach((b) => {
      const on = b === box;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1; // only the active box is a tab stop
    });
    root.querySelectorAll(".bc-panel").forEach((p) => {
      p.hidden = p.dataset.bcPanel !== box.dataset.bc;
    });
    if (focus) box.focus();
  }

  $text.addEventListener("click", (e) => {
    // switch box
    const box = e.target.closest(".bc-box");
    if (box) {
      if (!box.classList.contains("is-active")) {
        playSound("move");
        select(box);
      }
      return;
    }

    const pet = e.target.closest("[data-bc-pet]");
    if (pet) {
      playSound("click");
      const n = (+pet.dataset.n || 0) + 1;
      pet.dataset.n = n;
      pet.querySelector("[data-bc-count]").textContent = n;

      const heart = document.createElement("span");
      heart.className = "bc-heart";
      heart.textContent = "♥";
      pet.parentElement.appendChild(heart);
      setTimeout(() => heart.remove(), 900);
    }
  });

  // arrows move between the boxes (the card selector behind must not move)
  $text.addEventListener("keydown", (e) => {
    const box = e.target.closest(".bc-box");
    if (box) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const boxes = [
          ...box.closest(".bc-picker").querySelectorAll(".bc-box"),
        ];
        const next =
          boxes[boxes.indexOf(box) + (e.key === "ArrowRight" ? 1 : -1)];
        if (!next) return; // at the edge: let the card selector move as usual
        e.preventDefault();
        e.stopPropagation();
        playSound("move");
        select(next, true);
      } else if (e.key === "Enter") {
        e.stopPropagation(); // Enter must not "open" the card behind
      }
    } else if (e.key === "Enter" && e.target.closest("[data-bc-pet]")) {
      e.stopPropagation();
    }
  });
})();
