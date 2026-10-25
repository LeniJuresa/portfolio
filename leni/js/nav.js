// Nav bar — Projects / Media tabs
const navTabs = Array.from(document.querySelectorAll(".nav-tab"));
const views = Array.from(document.querySelectorAll(".view"));

navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.view;
    if (target === activeView) return;

    navTabs.forEach((t) => t.classList.toggle("active", t === tab));
    views.forEach((v) =>
      v.classList.toggle("active-view", v.dataset.view === target),
    );

    activeView = target;
    playSound("nav");
    selectors[activeView].reset();
  });
});

// Profile switcher dropdown
const profileNavButton = document.getElementById("profileNavButton");
const profileMenu = document.getElementById("profileMenu");

if (profileNavButton && profileMenu) {
  const setMenuOpen = (open) => {
    profileMenu.classList.toggle("open", open);
    profileNavButton.setAttribute("aria-expanded", String(open));
  };

  profileNavButton.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenuOpen(!profileMenu.classList.contains("open"));
  });

  // click anywhere outside the menu closes it
  document.addEventListener("click", (e) => {
    if (!profileMenu.classList.contains("open")) return;
    if (!profileMenu.contains(e.target) && e.target !== profileNavButton) {
      setMenuOpen(false);
    }
  });

  registerEscape(
    4,
    () => profileMenu.classList.contains("open"),
    () => setMenuOpen(false),
  );
}