// ==========================================================
// PS STORE (Discover card)
// Data (GAMES, COVER, LINK, FEAT, BADGES, HIRE) lives in store-data.js
// ==========================================================
(function () {
  const CHECK =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  // state lives out here so it survives the panel being re-injected
  const S = {
    cur: null,
    step: "detail",
    lib: {},
    wish: {},
    timer: null,
    filter: "all",
    last: null,
  };

  const $ = (id) => document.getElementById(id);
  const game = (id) => GAMES.find((x) => x.id === id);
  const isOpen = () => {
    const o = $("psOverlay");
    return !!o && o.classList.contains("open");
  };
  function lock(on) {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  }
  const stars = (r) => {
    const n = Math.round(r);
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  };

  /* ---------- browser (hero + tiles) ---------- */
  const fmt = (n) =>
    "€" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  function pr(x) {
    const price = x.price || 0;
    const pct = x.discount == null ? 100 : x.discount;
    const now = Math.round(price * (100 - pct)) / 100;
    const per = x.per ? " " + x.per : "";
    return {
      pct,
      sale: pct > 0 && price > 0,
      free: now === 0,
      old: fmt(price) + per,
      now: fmt(now) + per,
      save: fmt(price - now),
    };
  }
  const offHTML = (p) =>
    p.sale ? '<span class="ps-off">-' + p.pct + "%</span>" : "";
  const oldHTML = (p) => (p.sale ? "<s>" + p.old + "</s>" : "");

  function badgesHTML(x) {
    if (!x.badges || !x.badges.length) return "";
    return (
      '<span class="ps-badges">' +
      x.badges
        .filter((b) => BADGES[b])
        .map(
          (b) =>
            '<span class="ps-badge ps-badge--' +
            b +
            '" title="' +
            BADGES[b].tip +
            '">' +
            BADGES[b].label +
            "</span>",
        )
        .join("") +
      "</span>"
    );
  }

  const featuredList = () => {
    const f = GAMES.filter((g) => g.badges && g.badges.includes("featured"));
    return f.length ? f : [GAMES[0]];
  };
  function heroHTML(x) {
    const p = pr(x);
    const list = featuredList();
    const multi = list.length > 1;
    const dots = multi
      ? '<div class="ps-dots">' +
        list
          .map(
            (g, i) =>
              '<button type="button" class="ps-dot' +
              (g.id === x.id ? " active" : "") +
              '" data-act="hero" data-i="' +
              i +
              '" aria-label="Show ' +
              g.title +
              '"></button>',
          )
          .join("") +
        "</div>"
      : "";
    const arrows = multi
      ? '<button type="button" class="ps-hero-nav ps-hero-prev" data-act="hero-prev" aria-label="Previous featured game">&#10094;</button>' +
        '<button type="button" class="ps-hero-nav ps-hero-next" data-act="hero-next" aria-label="Next featured game">&#10095;</button>'
      : "";
    return (
      '<div class="ps-hero' +
      (multi ? " ps-hero--multi" : "") +
      '"><img class="ps-hero-bg" src="' +
      COVER +
      '" alt="">' +
      '<div class="ps-hero-shade"></div>' +
      arrows +
      '<div class="ps-hero-body">' +
      badgesHTML(x) +
      "<h2>" +
      x.title +
      "</h2><p>" +
      x.blurb +
      "</p>" +
      '<div class="ps-price">' +
      offHTML(p) +
      oldHTML(p) +
      "<b>" +
      p.now +
      "</b></div>" +
      '<button type="button" class="ps-btn ps-btn--primary" data-act="open" data-id="' +
      x.id +
      '">View game</button>' +
      dots +
      "</div></div>"
    );
  }
  function renderHero(refocus, dir) {
    const root = $("psHero");
    if (!root) return;
    const list = featuredList();
    S.hero = ((S.hero % list.length) + list.length) % list.length;
    root.innerHTML = heroHTML(list[S.hero]);
    const body = root.querySelector(".ps-hero-body");
    if (body && dir) body.classList.add(dir > 0 ? "slide-next" : "slide-prev");
    if (refocus) {
      const b = root.querySelector('[data-act="' + refocus + '"]');
      if (b) b.focus();
    }
  }
  function stepHero(d, refocus) {
    const n = featuredList().length;
    if (n < 2) return;
    S.hero = (S.hero + d + n) % n;
    renderHero(refocus, d);
  }

  let heroTimer = null;
  function startHeroAuto() {
    clearInterval(heroTimer); // restarting resets the 5 second countdown
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = setInterval(() => {
      const hero = document.querySelector("#psHero .ps-hero");
      if (!hero || document.hidden || isOpen()) return;
      if (hero.matches(":hover") || hero.contains(document.activeElement))
        return;
      stepHero(1);
    }, 5000); //scroll every 5 seconds if not hovered or focused, for the featured games list
  }
  function tileHTML(x) {
    const p = pr(x);
    return (
      '<button type="button" class="ps-tile" data-act="open" data-id="' +
      x.id +
      '" data-status="' +
      x.status +
      '">' +
      '<span class="ps-art"><img src="' +
      COVER +
      '" alt="" loading="lazy">' +
      (x.status === "soon" ? '<span class="ps-soon">Pre-order</span>' : "") +
      '<span class="ps-flags">' +
      offHTML(p) +
      badgesHTML(x) +
      "</span>" +
      "</span>" +
      '<span class="ps-tname">' +
      x.title +
      '</span><span class="ps-tsub">' +
      x.tag +
      "</span>" +
      '<span class="ps-tprice"><b>' +
      p.now +
      "</b>" +
      oldHTML(p) +
      "</span>" +
      '<span class="ps-own">' +
      CHECK +
      " In Library</span></button>"
    );
  }
  function sync() {
    let shown = 0;
    document.querySelectorAll(".ps-tile").forEach((t) => {
      const own = !!S.lib[t.dataset.id];
      const f = S.filter;
      const vis = f === "all" || f === t.dataset.status || (f === "lib" && own);
      t.classList.toggle("is-owned", own);
      t.hidden = !vis;
      if (vis) shown++;
    });
    const e = $("psEmpty");
    if (e) e.hidden = shown > 0;
  }

  /* ---------- popup views ---------- */
  function steps(n) {
    const L = ["Order summary", "Payment", "Complete"];
    return (
      '<ol class="ps-steps">' +
      L.map(
        (l, i) =>
          '<li class="' +
          (i < n ? "done" : i === n ? "now" : "") +
          '"><span>' +
          (i < n ? CHECK : i + 1) +
          "</span>" +
          l +
          "</li>",
      ).join("") +
      "</ol>"
    );
  }
  function libUI(x) {
    const l = S.lib[x.id] || {};
    const dl = l.dl || 0;
    if (x.status === "soon")
      return (
        '<span class="ps-installed">' +
        CHECK +
        " Pre-ordered · arrives in your library at launch</span>"
      );
    if (l.running)
      return (
        '<div class="ps-dl"><div class="ps-dl-top"><span>Downloading…</span><span id="psPct">' +
        Math.floor(dl) +
        '%</span></div><div class="ps-bar"><i id="psBar" style="width:' +
        dl +
        '%"></i></div></div>'
      );
    if (dl >= 100)
      return (
        '<button type="button" class="ps-btn ps-btn--primary" data-act="launch" data-id="' +
        x.id +
        '">▶ Launch project</button>' +
        '<span class="ps-installed">' +
        CHECK +
        " Installed</span>"
      );
    return (
      '<button type="button" class="ps-btn ps-btn--primary" data-act="dl" data-id="' +
      x.id +
      '" data-tooltip="! pressing this will not download anything on your device">Download</button>'
    );
  }
  const li = (a) =>
    "<li>" +
    CHECK +
    "<span>" +
    a[0] +
    (a[1] ? "<small>" + a[1] + "</small>" : "") +
    "</span></li>";

  /* ---------- extra info, only for pre-order ("soon") projects ---------- */
  const ROAD_ICON = { done: "✓", now: "●", next: "○" };
  function soonHTML(x) {
    const progress = x.progress == null ? 0 : x.progress;
    const road = x.roadmap || [];
    const expect = x.expect || [];
    const gallery = x.gallery || [];
    const level = progress < 34 ? "low" : progress < 80 ? "mid" : "high";

    const dev =
      '<div class="ps-dev"><div class="ps-dev-top"><b>Development progress</b><span>' +
      progress +
      '%</span></div><div class="ps-bar"><i class="lvl-' +
      level +
      '" style="width:' +
      progress +
      '%"></i></div><div class="ps-dev-meta"><span>Expected <b>' +
      (x.eta || x.year) +
      "</b></span><span>Stage <b>" +
      (x.stage || "In development") +
      "</b></span></div></div>";

    const roadmap = road.length
      ? '<div><h3>Roadmap</h3><ol class="ps-road">' +
        road
          .map(
            (r) =>
              '<li class="' +
              r[0] +
              '"><span>' +
              ROAD_ICON[r[0]] +
              "</span>" +
              r[1] +
              "</li>",
          )
          .join("") +
        "</ol></div>"
      : "";

    const expectList = expect.length
      ? "<div><h3>What to expect</h3><ul>" +
        expect.map((e) => li([e])).join("") +
        "</ul></div>"
      : "";

    const cols =
      roadmap || expectList
        ? '<div class="ps-cols ps-cols--soon">' +
          roadmap +
          expectList +
          "</div>"
        : "";

    const gal = gallery.length
      ? '<div class="ps-soon-gallery"><h3>Preview</h3><div class="gallery-grid">' +
        gallery
          .map(
            (src, i) =>
              '<div class="gallery-item" tabindex="0" role="button" aria-haspopup="dialog"><img src="' +
              src +
              '" alt="' +
              x.title +
              " preview " +
              (i + 1) +
              '" loading="lazy"></div>',
          )
          .join("") +
        "</div></div>"
      : "";

    return '<div class="ps-soon-info">' + dev + cols + gal + "</div>";
  }

  const isJob = (x) => !!x.badges && x.badges.includes("job");

  function hireHTML() {
    return (
      '<div class="ps-hire"><b class="ps-hire-title">' +
      HIRE.title +
      '</b><p class="ps-hire-text">' +
      HIRE.text +
      '</p><div class="ps-hire-links">' +
      HIRE.links
        .map(
          (l) =>
            '<a class="ps-hire-link" href="' +
            l.href +
            '" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true">' +
            l.icon +
            "</svg>" +
            l.label +
            "</a>",
        )
        .join("") +
      "</div></div>"
    );
  }

  const V = {
    detail(x) {
      const own = S.lib[x.id];
      const p = pr(x);
      const actions = own
        ? '<div class="ps-actions">' + libUI(x) + "</div>"
        : '<div class="ps-actions"><button type="button" class="ps-btn ps-btn--primary ps-whisper" data-act="go" data-step="cart" >' +
          (x.status === "soon" ? "Pre-order" : "Buy now") +
          "</button>" +
          '<button type="button" class="ps-btn ps-btn--ghost" data-act="wish">' +
          (S.wish[x.id] ? "♥ Wishlisted" : "♡ Add to wishlist") +
          "</button></div>";
      const rating = x.count
        ? '<div class="ps-rate"><span class="ps-stars" aria-hidden="true">' +
          stars(x.rating) +
          "</span><b>" +
          x.rating.toFixed(1) +
          "</b><small>" +
          x.count +
          " ratings</small></div>"
        : '<div class="ps-rate"><small>Not enough ratings yet</small></div>';
      return (
        '<div class="ps-detail"><div class="ps-cover"><img src="' +
        COVER +
        '" alt="">' +
        offHTML(p) +
        badgesHTML(x) +
        "</div>" +
        '<div class="ps-info"><h2 class="ps-h" id="psTitle">' +
        x.title +
        "</h2>" +
        '<p class="ps-pub">LJ Studios · ' +
        x.tag +
        " · " +
        x.year +
        "</p>" +
        '<div class="ps-tags">' +
        x.tags.map((t) => "<span>" + t + "</span>").join("") +
        "</div>" +
        rating +
        '<div class="ps-price">' +
        offHTML(p) +
        oldHTML(p) +
        "<b>" +
        p.now +
        "</b></div>" +
        actions +
        '<p class="ps-desc">' +
        x.desc +
        "</p></div></div>" +
        '<div class="ps-cols"><div><h3>Skills &amp; tools used</h3><ul>' +
        x.tech.map(li).join("") +
        "</ul></div>" +
        "<div><h3>Features</h3><ul>" +
        (x.feat || FEAT).map((f) => li([f])).join("") +
        "</ul></div></div>" +
        (x.status === "soon" ? soonHTML(x) : "")
      );
    },
    cart(x) {
      const p = pr(x);
      return (
        '<div class="ps-flow">' +
        steps(0) +
        '<h2 class="ps-h" id="psTitle">Order summary</h2>' +
        '<div class="ps-order"><img src="' +
        COVER +
        '" alt=""><div><b>' +
        x.title +
        "</b><small>" +
        x.tag +
        " · Digital</small></div>" +
        '<div class="ps-op">' +
        oldHTML(p) +
        "<b>" +
        p.now +
        "</b></div></div>" +
        '<dl class="ps-sum"><div><dt>Subtotal</dt><dd>' +
        p.old +
        "</dd></div>" +
        (p.sale
          ? '<div class="g"><dt>Discount (' +
            p.pct +
            "%)</dt><dd>-" +
            p.save +
            "</dd></div>"
          : "") +
        '<div class="total"><dt>Total</dt><dd>' +
        p.now +
        "</dd></div></dl>" +
        '<div class="ps-actions"><button type="button" class="ps-btn ps-btn--primary" data-act="go" data-step="pay">Continue to payment</button>' +
        '<button type="button" class="ps-btn ps-btn--ghost" data-act="go" data-step="detail">Back</button></div></div>'
      );
    },
    pay(x) {
      const p = pr(x);
      return (
        '<div class="ps-flow">' +
        steps(1) +
        '<h2 class="ps-h" id="psTitle">Payment</h2>' +
        '<div class="ps-method"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' +
        "<div><b>Wallet</b><small>" +
        (p.free
          ? "€0.00 will be charged. No payment details needed."
          : p.now +
            " would be charged. Don't worry, this is a demo and nothing is actually charged.") +
        "</small></div></div>" +
        '<label class="ps-tos"><input type="checkbox" id="psTos">' +
        "<span>" +
        (p.free
          ? "I agree to the Terms of Service and understand that " +
            x.title +
            " is, in fact, free."
          : "I agree to the Terms of Service and understand that this is a demo store.") +
        "</span></label>" +
        '<div class="ps-actions"><button type="button" class="ps-btn ps-btn--primary" id="psConfirm" disabled data-act="go" data-step="proc" data-achievement="purchase">Confirm ' +
        (x.status === "soon" ? "pre-order" : "purchase") +
        "</button>" +
        '<button type="button" class="ps-btn ps-btn--ghost" data-act="go" data-step="cart">Back</button></div></div>'
      );
    },
    proc() {
      return (
        '<div class="ps-flow ps-center">' +
        steps(2) +
        '<div class="ps-spin" role="status" aria-label="Processing"></div>' +
        '<h2 class="ps-h" id="psTitle" style="padding:0;font-size:28px">Processing</h2>' +
        '<p class="ps-order-no" id="psProcTxt">Processing your order…</p></div>'
      );
    },
    done(x) {
      const l = S.lib[x.id] || {};
      const p = pr(x);
      return (
        '<div class="ps-flow ps-center">' +
        steps(3) +
        '<svg class="ps-bigcheck" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg>' +
        '<h2 class="ps-h" id="psTitle" style="padding:0">' +
        (x.status === "soon" ? "Pre-order complete" : "Purchase complete") +
        "</h2>" +
        '<p class="ps-order-no">' +
        x.title +
        " · Order #" +
        (l.order || "") +
        " · " +
        p.now +
        "</p>" +
        (isJob(x) ? hireHTML() : "") +
        '<div class="ps-actions" style="justify-content:center">' +
        libUI(x) +
        '<button type="button" class="ps-btn ps-btn--ghost" data-act="close">Keep browsing</button></div></div>'
      );
    },
  };

  /* ---------- "scroll for more" hint (pre-order popup only) ---------- */
  function ensureHint() {
    let b = $("psScrollHint");
    if (!b) {
      const p = $("psPanel");
      if (!p) return null;
      b = document.createElement("button");
      b.type = "button";
      b.id = "psScrollHint";
      b.className = "ps-scroll-hint";
      b.dataset.act = "scrolldown";
      b.disabled = true;
      b.innerHTML =
        'Scroll for more <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
      p.appendChild(b);
    }
    return b;
  }

  function updateHint() {
    const s = $("psScroll");
    const b = ensureHint();
    if (!s || !b) return;
    const g = game(S.cur);
    const more =
      !!g &&
      g.status === "soon" &&
      S.step === "detail" &&
      isOpen() &&
      s.scrollHeight - s.scrollTop - s.clientHeight > 40;
    b.classList.toggle("show", more);
    b.disabled = !more;
  }

  function render(anim) {
    const body = $("psBody");
    if (!body || !S.cur) return;
    body.className = "ps-body" + (anim ? " ps-anim" : "");
    body.innerHTML = V[S.step](game(S.cur));
    if (anim) {
      const s = $("psScroll");
      if (s) s.scrollTop = 0;
    }
    updateHint();
    requestAnimationFrame(updateHint);
  }
  function focusPrimary() {
    const b = document.querySelector(
      "#psBody .ps-btn--primary:not([disabled])",
    );
    if (b) b.focus();
  }

  /* ---------- actions ---------- */
  function openGame(id) {
    S.cur = id;
    S.step = "detail";
    S.last = document.activeElement;
    $("psOverlay").classList.add("open");
    lock(true);
    render(true);
    setTimeout(() => {
      const x = document.querySelector(".ps-x");
      if (x) x.focus();
    }, 50);
  }
  function closeGame() {
    clearTimeout(S.timer);
    if (S.step === "proc") S.step = "detail";
    const o = $("psOverlay");
    if (o) o.classList.remove("open");
    lock(false);
    if (S.last && S.last.focus) S.last.focus();
  }
  function launch(id) {
    const x = game(id);
    if (!x) return;

    const target = x.card
      ? [...document.querySelectorAll(".profile-item")].find(
          (el) => el.dataset.title === x.card || el.dataset.project === x.card,
        )
      : null;

    if (!target) {
      window.open(x.href, "_blank", "noopener,noreferrer");
      return;
    }

    closeGame();

    const fire = (el) => {
      ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(
        (type) =>
          el.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window,
            }),
          ),
      );
      updateHint();
    };

    const select = () => {
      const card = target.querySelector(".profile-card") || target;
      const name = target.querySelector(".profile-name");
      fire(card);
      // if the first try didn't change anything, try the item and its label too
      setTimeout(() => {
        const cur = document.getElementById("cardDetailTitle");
        const done =
          target.classList.contains("active") ||
          target.classList.contains("selected") ||
          target.classList.contains("is-active") ||
          (cur && cur.textContent.trim() === target.dataset.title);
        if (!done) {
          fire(target);
          if (name) fire(name);
        }
      }, 80);
    };

    // 1) scroll to the top, 2) wait until we're there, 3) open the card
    const scrollTopThenSelect = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const started = performance.now();
      const check = () => {
        const arrived = window.scrollY <= 2;
        const timedOut = performance.now() - started > 1500; // safety net
        if (arrived || timedOut) {
          setTimeout(select, 150); // small pause so it feels deliberate
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    };

    setTimeout(scrollTopThenSelect, 250); // let the popup finish closing first
  }
  function go(step) {
    S.step = step;
    render(true);
    if (step === "proc") {
      const id = S.cur;
      S.timer = setTimeout(() => {
        const t = $("psProcTxt");
        if (t) t.textContent = "Adding to your library…";
        S.timer = setTimeout(() => {
          if (S.cur !== id || S.step !== "proc") return;
          S.lib[id] = {
            dl: 0,
            running: false,
            order: "LJ-" + Math.floor(10000000 + Math.random() * 89999999),
          };
          S.step = "done";
          render(true);
          sync();
          focusPrimary();
        }, 1300);
      }, 1400);
    }
  }
  function download(id) {
    const l = S.lib[id];
    if (!l || l.running || l.dl >= 100) return;
    l.running = true;
    l.dl = 0;
    render(false);
    const t = setInterval(() => {
      l.dl = Math.min(100, l.dl + 2 + Math.random() * 7);
      if (l.dl >= 100) {
        clearInterval(t);
        l.running = false;
        l.dl = 100;
      }
      if (S.cur === id && isOpen() && $("psBody")) {
        if (l.running) {
          const b = $("psBar"),
            p = $("psPct");
          if (b) b.style.width = l.dl + "%";
          if (p) p.textContent = Math.floor(l.dl) + "%";
        } else {
          render(false);
          focusPrimary();
        }
      }
    }, 280);
  }

  /* ---------- build the browser whenever the Discover card is shown ---------- */
  function initStore() {
    const root = $("psStore");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";
    lock(false);
    clearTimeout(S.timer);
    S.filter = "all";
    S.cur = null;
    S.step = "detail";
    S.hero = 0;
    renderHero();
    $("psGrid").innerHTML = GAMES.map(tileHTML).join("");
    sync();
  }

  const panel = document.getElementById("widgetsPanel");
  if (!panel) return;

  // the card selector replaces the panel's innerHTML on every card change,
  // so we watch for the store appearing and fill it in.
  new MutationObserver(initStore).observe(panel, { childList: true });
  initStore();

  startHeroAuto();

  // when the mouse leaves the banner, give people a fresh 5 seconds
  panel.addEventListener("mouseout", (e) => {
    const from = e.target.closest && e.target.closest(".ps-hero");
    if (from && !(e.relatedTarget && from.contains(e.relatedTarget)))
      startHeroAuto();
  });

  /* ---------- whispers: little wavy text floats out of the buy button ---------- */
  const WHISPERS = [
    "it's free, I promise",
    "you won't need to enter any information!",
    "press the button.....",
    "Click meeee...",
    "go on, click me...",
    "WoOoOoOo, I'm floating away....",
    "I'm a button :)",
    "WoOoOoOoOo, nothing real will happen....",
  ];
  let whisperTimer = null;

  function whisper(btn) {
    if (!btn.isConnected) return;
    if (btn.querySelectorAll(".ps-whisper-text").length >= 3) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const s = document.createElement("span");
    s.className = "ps-whisper-text";
    s.setAttribute("aria-hidden", "true");
    s.textContent = WHISPERS[Math.floor(Math.random() * WHISPERS.length)];
    s.style.left = 10 + Math.random() * 55 + "%";
    s.style.setProperty("--sway", 8 + Math.random() * 10 + "px");
    s.style.animationDuration = 5.6 + Math.random() * 1.2 + "s";
    s.addEventListener("animationend", () => s.remove());
    btn.appendChild(s);
  }

  panel.addEventListener("mouseover", (e) => {
    const btn = e.target.closest && e.target.closest(".ps-whisper");
    if (!btn || (e.relatedTarget && btn.contains(e.relatedTarget))) return;
    clearInterval(whisperTimer);
    whisper(btn);
    whisperTimer = setInterval(() => {
      if (!btn.isConnected || !btn.matches(":hover")) {
        clearInterval(whisperTimer);
        return;
      }
      whisper(btn);
    }, 2100);
  });

  panel.addEventListener("mouseout", (e) => {
    const btn = e.target.closest && e.target.closest(".ps-whisper");
    if (btn && !(e.relatedTarget && btn.contains(e.relatedTarget))) {
      clearInterval(whisperTimer);
    }
  });

  // listeners go on the panel itself (it never gets replaced)
  panel.addEventListener("click", (e) => {
    if (!e.target.closest("#psStore")) return;
    if (e.target.id === "psOverlay") return closeGame();
    const t = e.target.closest("[data-act]");
    if (!t) return;
    switch (t.dataset.act) {
      case "launch":
        launch(t.dataset.id);
        break;
      case "open":
        openGame(t.dataset.id);
        break;
      case "close":
        closeGame();
        break;
      case "go":
        go(t.dataset.step);
        break;
      case "scrolldown": {
        const s = $("psScroll");
        if (s) s.scrollBy({ top: s.clientHeight * 0.8, behavior: "smooth" });
        break;
      }
      case "hero": {
        const i = +t.dataset.i;
        const dir = i >= S.hero ? 1 : -1;
        S.hero = i;
        renderHero(null, dir);
        startHeroAuto();
        break;
      }
      case "hero-prev":
        stepHero(-1, "hero-prev");
        startHeroAuto();
        break;
      case "hero-next":
        stepHero(1, "hero-next");
        startHeroAuto();
        break;
      case "wish":
        S.wish[S.cur] = !S.wish[S.cur];
        render(false);
        break;
      case "dl":
        download(t.dataset.id);
        break;
      case "filter":
        S.filter = t.dataset.f;
        document
          .querySelectorAll(".ps-chip")
          .forEach((c) => c.classList.toggle("active", c === t));
        sync();
        break;
    }
  });

  panel.addEventListener("change", (e) => {
    if (e.target.id === "psTos") {
      const c = $("psConfirm");
      if (c) c.disabled = !e.target.checked;
    }
  });

  panel.addEventListener("keydown", (e) => {
    if (!e.target.closest("#psStore")) return;
    e.stopPropagation(); // stops the main card selector from reacting to arrows / Enter

    if (e.key === "Tab" && isOpen()) {
      const f = [
        ...$("psPanel").querySelectorAll(
          "button:not([disabled]),a[href],input:not([disabled])",
        ),
      ];
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }

    if (!isOpen() && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const tiles = [...document.querySelectorAll(".ps-tile:not([hidden])")];
      const i = tiles.indexOf(document.activeElement);
      if (i > -1) {
        e.preventDefault();
        const n = tiles[i + (e.key === "ArrowRight" ? 1 : -1)];
        if (n) n.focus();
      }
    }
  });

  panel.addEventListener(
    "scroll",
    (e) => {
      if (e.target.id === "psScroll") updateHint();
    },
    true,
  );
  panel.addEventListener("load", updateHint, true); // gallery images change the height
  window.addEventListener("resize", updateHint);

  registerEscape(12, isOpen, closeGame);
})();