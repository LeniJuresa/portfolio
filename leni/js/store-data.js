// ==========================================================
// PS STORE DATA
// ==========================================================
const COVER = "../assets/images/placeholder.svg"; // swap per game later
const LINK = "https://github.com/lenijuresa"; // swap per game later

const FEAT = [
  "1 developer, fully solo project",
  "Offline play Disabled",
  "Remote play supported, works in any browser",
  "Game help supported, documented code",
];

// ======= EDIT YOUR "GAMES" HERE =======
// status: "out" = released ("Buy now"), "soon" = in the works ("Pre-order")
const GAMES = [
  {
    id: "edms",
    title: "EDMS",
    tag: "PHP / Laravel",
    status: "out",
    card: "Emergency Dispatch Management System",
    badges: ["featured"],
    rating: 5,
    count: 1,
    price: 499.99, // the old / full price in euros
    discount: 100, // percent off. Leave it out and it defaults to 100
    per: "",
    year: "2025",
    href: LINK,
    tags: ["PHP", "Laravel", "Web", "SQL", "XAMPP"],
    blurb:
      "Emergency dispatch management system for first responders. Dispatch center for police to manage, track, and coordinate responses for anonymous reports.",
    desc: "Placeholder description for EDMS. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    tech: [
      ["PHP", "What it's written in"],
      ["Laravel", "What it runs on"],
      ["XAMPP", "Anything else worth showing off"],
    ],
  },
  {
    id: "church",
    title: "Church App",
    tag: "Desktop / Java",
    status: "out",
    card: "Church", // Spojnica s profilnom karticom u biblioteci
    badges: ["featured"],
    rating: 4.8,
    count: 212,
    price: 89.99, // the old / full price in euros
    discount: 100, // percent off. Leave it out and it defaults to 100
    per: "",
    year: "2025",
    href: LINK,
    tags: ["Java", "Desktop", "Community"],
    blurb:
      "A Java desktop app for church communities to manage events and members. Used constantly by my local church, Many hours of manual work into just a few clicks ",
    desc: "Placeholder description. Explain what the app does, who uses it every day and what problem it solves.",
    tech: [
      ["Java", "Main language and application logic"],
      ["[GUI toolkit]", "Replace with what you used"],
      ["[Storage / database]", "Replace with what you used"],
      ["Git / GitHub", "Version control"],
    ],
  },

  {
    id: "ISS",
    title: "ISS tracker",
    tag: "Python",
    status: "out",
    card: "ISS tracker",
    badges: [],
    rating: 4.5,
    count: 34,
    price: 19.99, // the old / full price in euros
    discount: 100, // percent off. Leave it out and it defaults to 100
    per: "",
    year: "2024",
    href: LINK,
    tags: ["WIP", "Coming soon"],
    blurb: "Placeholder blurb for ISS tracker.",
    desc: "Placeholder description for ISS tracker. Maecenas eget condimentum velit, sit amet feugiat lectus.",
    tech: [
      ["Python", "Main language"],
      ["[Library]", "Replace with what you used"],
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio: PS5 Edition",
    tag: "Web / Interactive",
    status: "soon",
    card: "Welcome",
    badges: [],
    rating: 4.9,
    count: 128,
    price: 69.99, // the old / full price in euros
    discount: 100, // percent off. Leave it out and it defaults to 100
    per: "",
    year: "Winter 2026",
    tags: ["Web", "UI / UX", "Solo", "sigma studio"],
    blurb: "Coming soon! The site you're standing in.",
    desc: "A portfolio disguised as a console dashboard. Browse profiles with arrow keys or mouse, open widgets, flip through galleries and, of course, shop for things that cost nothing.",
    tech: [
      ["HTML", "Structure, templates, accessibility attributes"],
      ["CSS", "Grid, flexbox, animations, glass effects"],
      ["JavaScript", "Card selector, popups, this store"],
      ["Git / GitHub", "Version control and hosting"],
      ["Gangdam / Style", "Version control and hosting"],
    ],
    stage: "Still figuring it all out ",
    progress: 85,
    eta: "Winter 2026",
    roadmap: [
      ["done", "Dizajn i koncept"],
      ["done", "Biblioteka, trgovina i popupi"],
      ["now", "Sadržaj i dokumentacija"],
      ["next", "Završno testiranje i objava"],
    ],
    expect: [
      "Svi moji projekti na jednom mjestu",
      "Posebni profili za recruitere i developere",
      "Galerije, demo i izvorni kod",
    ],
    gallery: [
      "../assets/galery/placeholder.svg",
      "../assets/galery/placeholder.svg",
      "../assets/galery/placeholder.svg",
      "../assets/galery/placeholder.svg",
    ],
  },

  {
    id: "Resume",
    title: "Resume",
    tag: "In development",
    status: "soon",
    badges: ["job"],
    rating: 0,
    count: 0,
    price: 24.99, // the old / full price in euros
    discount: 100, // percent off. Leave it out and it defaults to 100
    per: "/m",
    year: "Coming soon",
    href: LINK,
    tags: ["WIP", "Coming soon"],
    blurb: "Still cooking. Pre-order to get notified at launch.",
    desc: "Display of all my employment history, education, and skills. This project is still in the works as i have not yet had a job :).",
    tech: [
      ["English/Croatian", "Languages"],
      ["MS Word", "Tools"],
    ],
    stage: "Still getting educated :/",
    progress: 38,
    eta: "2027",
    roadmap: [
      ["done", "Getting education"],
      ["done", "Small projects"],
      ["now", "Writing my resume"],
      ["next", "Having a job!"],
    ],
    expect: [
      "My employment history, education, and skills",
      "Professional templates",
      "Wanting to hire me B)",
    ],
    gallery: [
      "../assets/galery/placeholder.svg",
      "../assets/galery/placeholder.svg",
      "../assets/galery/placeholder.svg",
      "../assets/galery/placeholder.svg",
    ],
  },
];

const BADGES = {
  featured: { label: "FEATURED", tip: "Featured project" },
  job: { label: "JOB", tip: "Part of my CV / resume" },
};

/* ---------- "hire me" block, only for projects with the "job" badge ---------- */
const HIRE = {
  title: "You could be the first!",
  text: "Why not hire me? :)",
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/soon",
      icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    },
    {
      label: "GitHub",
      href: "https://github.com/lenijuresa",
      icon: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    },
    {
      label: "Email",
      href: "mailto:you@example.com",
      icon: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/soon",
      icon: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
    },
  ],
};
