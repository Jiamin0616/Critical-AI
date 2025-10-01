/*************** Config ***************/
const MIN_TAGS = 5; // 你要的最少 5 个
const DS_TARGET = 70;

/*************** DOM ***************/
const wrap = document.getElementById("poolWrap");
const canvas = document.getElementById("poolCanvas");
const ctx = canvas.getContext("2d");

const searchInput = document.getElementById("searchInput");
const zoomCircle = document.getElementById("zoomCircle");
const feedView = document.getElementById("feedView");
const backBtn = document.getElementById("backBtn");
const toggleViewBtn = document.getElementById("toggleViewBtn");
const teleportBtn = document.getElementById("teleportBtn");
const modeBackBtn = document.getElementById("modeBackBtn");
const compareBtn = document.getElementById("compareBtn");
const diversityBadge = document.getElementById("diversityBadge");
const feedTag = document.getElementById("feedTag");
const feedCat = document.getElementById("feedCategory");
const feedList = document.getElementById("feedList");
const hiddenPanel = document.getElementById("hiddenPanel");
const hiddenList = document.getElementById("hiddenList");
const modeNotice = document.getElementById("modeNotice");
const burstCanvas = document.getElementById("burstCanvas");
const bctx = burstCanvas.getContext("2d");
const progressBar = document.getElementById("progressBar");

/* Builder */
const buildBtn = document.getElementById("buildBtn");
const builderUI = document.getElementById("builderUI");
const builderExit = document.getElementById("builderExit");
const tagLayer = document.getElementById("tagLayer");
const bigBubble = document.getElementById("bigBubble");
const enterBtn = document.getElementById("enterBtn");
const bbTags = document.getElementById("bbTags");
const resetBuildBtn = document.getElementById("resetBuildBtn");
const pickedCountEl = document.getElementById("pickedCount");
const chipLegend = document.getElementById("chipLegend");
const builderSub = document.querySelector(".builder-sub");

/*************** Sizing ***************/
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = wrap.clientWidth,
    h = wrap.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  burstCanvas.width = Math.floor(window.innerWidth * dpr);
  burstCanvas.height = Math.floor(window.innerHeight * dpr);
  burstCanvas.style.width = window.innerWidth + "px";
  burstCanvas.style.height = window.innerHeight + "px";
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (builderUI.classList.contains("active")) {
    layoutTagGrid(); // 先排 tag
    layoutBuildStage(); // 再定位 Cocoon，保证分离
  }
}
window.addEventListener("resize", resize);
resize();

/*************** App State ***************/
let appMode = "normal"; // normal | hidden | teleport | compare | mybubble
let lastMainCat = null;
let lastLabel = null;

/*************** Data ***************/
const hiddenPosts = {
  Faith: {
    aligned: [
      {
        t: "Interfaith youth initiatives that work",
        u: "https://www.interfaithamerica.org/",
        stance: "pro",
        topic: "youth",
      },
      {
        t: "Pluralism in diverse cities",
        u: "https://pluralism.org/",
        stance: "pro",
        topic: "community",
      },
      {
        t: "Secular ethics in everyday life",
        u: "https://aeon.co/",
        stance: "neutral",
        topic: "ethics",
      },
    ],
    hidden: [
      {
        t: "When interfaith projects fail",
        u: "https://www.tandfonline.com/",
        stance: "con",
        topic: "critique",
      },
      {
        t: "Religious restrictions: global trends",
        u: "https://www.pewresearch.org/religion/",
        stance: "con",
        topic: "report",
      },
    ],
  },
  Region: {
    aligned: [
      {
        t: "Remote work and regional migration",
        u: "https://www.brookings.edu/",
        stance: "neutral",
        topic: "migration",
      },
      {
        t: "How rail upgrades reshape small towns",
        u: "https://www.ft.com/",
        stance: "pro",
        topic: "infrastructure",
      },
      {
        t: "Urban–rural income gaps",
        u: "https://ourworldindata.org/",
        stance: "neutral",
        topic: "economy",
      },
    ],
    hidden: [
      {
        t: "Megaprojects that miss local needs",
        u: "https://www.nature.com/",
        stance: "con",
        topic: "policy",
      },
      {
        t: "Hidden downsides of remote work",
        u: "https://hbr.org/",
        stance: "con",
        topic: "work",
      },
    ],
  },
  Age: {
    aligned: [
      {
        t: "Gen Z’s workplace norms",
        u: "https://hbr.org/",
        stance: "pro",
        topic: "work",
      },
      {
        t: "Student mental health resources",
        u: "https://www.who.int/",
        stance: "neutral",
        topic: "health",
      },
      {
        t: "Retirees as hidden volunteers",
        u: "https://www.theguardian.com/",
        stance: "pro",
        topic: "community",
      },
    ],
    hidden: [
      {
        t: "Age bias in tech hiring",
        u: "https://www.ft.com/",
        stance: "con",
        topic: "bias",
      },
      {
        t: "Debunking generational myths",
        u: "https://www.brookings.edu/",
        stance: "neutral",
        topic: "research",
      },
    ],
  },
  Hobby: {
    aligned: [
      {
        t: "Esports global rise",
        u: "https://newzoo.com/",
        stance: "pro",
        topic: "esports",
      },
      {
        t: "Makers and open hardware",
        u: "https://makezine.com/",
        stance: "pro",
        topic: "maker",
      },
      {
        t: "Indie cinema’s comeback",
        u: "https://www.indiewire.com/",
        stance: "neutral",
        topic: "film",
      },
    ],
    hidden: [
      {
        t: "Gaming addiction patterns",
        u: "https://www.nature.com/",
        stance: "con",
        topic: "health",
      },
      {
        t: "Environmental cost of hobby electronics",
        u: "https://www.iea.org/",
        stance: "con",
        topic: "energy",
      },
    ],
  },
  Politics: {
    aligned: [
      {
        t: "What the center means today",
        u: "https://www.economist.com/",
        stance: "pro",
        topic: "center",
      },
      {
        t: "How to participate in local civics",
        u: "https://www.usa.gov/elected-officials",
        stance: "neutral",
        topic: "civics",
      },
      {
        t: "A primer on global populism",
        u: "https://www.chathamhouse.org/",
        stance: "neutral",
        topic: "populism",
      },
    ],
    hidden: [
      {
        t: "Media bias & ideological silos",
        u: "https://www.allsides.com/",
        stance: "con",
        topic: "media",
      },
      {
        t: "What drives polarization",
        u: "https://www.voterstudygroup.org/",
        stance: "con",
        topic: "polarization",
      },
    ],
  },
  Climate: {
    aligned: [
      {
        t: "Renewables growth 2020–2025",
        u: "https://www.iea.org/",
        stance: "pro",
        topic: "energy",
      },
      {
        t: "Plastic-free initiatives that work",
        u: "https://www.unep.org/",
        stance: "pro",
        topic: "plastic",
      },
      {
        t: "Diet choices & climate",
        u: "https://www.nature.com/",
        stance: "neutral",
        topic: "diet",
      },
    ],
    hidden: [
      {
        t: "Intermittency & cost challenges",
        u: "https://www.iea.org/",
        stance: "con",
        topic: "constraints",
      },
      {
        t: "Resilience trade-offs in transition",
        u: "https://www.nature.com/",
        stance: "con",
        topic: "resilience",
      },
    ],
  },
  Gender: {
    aligned: [
      {
        t: "Closing gender gaps at work",
        u: "https://www.ilo.org/",
        stance: "pro",
        topic: "work",
      },
      {
        t: "Women in STEM: progress and barriers",
        u: "https://www.unesco.org/",
        stance: "neutral",
        topic: "STEM",
      },
      {
        t: "Parental leave policies that help",
        u: "https://www.oecd.org/",
        stance: "pro",
        topic: "policy",
      },
    ],
    hidden: [
      {
        t: "Backlash to gender quotas",
        u: "https://www.tandfonline.com/",
        stance: "con",
        topic: "quotas",
      },
      {
        t: "Debates on pay gap metrics",
        u: "https://www.nature.com/",
        stance: "neutral",
        topic: "metrics",
      },
    ],
  },
};
const categories = Object.keys(hiddenPosts);

/*************** Color system ***************/
const CAT_HUE = {
  Faith: 0,
  Region: 40,
  Age: 100,
  Hobby: 180,
  Politics: 220,
  Climate: 280,
  Gender: 320,
};
const HSL = (h, s, l, a = 1) => `hsla(${h} ${s}% ${l}% / ${a})`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function jitter(seed, range) {
  const x = Math.sin(seed * 1337.77) * 43758.5453;
  return (x - Math.floor(x)) * 2 * range - range;
}
function colorFor(cat, role, seed = 0) {
  const H = CAT_HUE[cat] ?? 210;
  if (role === "bubble") {
    const S = clamp(62 + jitter(seed, 8), 55, 75),
      L = clamp(66 + jitter(seed, 8), 56, 82),
      A = clamp(0.6 + jitter(seed, 0.06), 0.52, 0.75);
    return HSL(H, S, L, A);
  }
  if (role === "bar-aligned") return HSL(H, 72, 58, 1);
  if (role === "bar-hidden") return HSL(H, 78, 44, 1);
  if (role === "pill-solid") return HSL(H, 70, 62, 1);
  if (role === "zoom") return HSL(H, 70, 72, 0.95);
  if (role === "shadow") return HSL(H, 70, 50, 0.28);
  if (role === "chip-dot") return HSL(H, 70, 56, 1);
  return HSL(H, 60, 60, 1);
}

/*************** Category centers（7 个独立中心） ***************/
function makeCenters() {
  const w = wrap.clientWidth,
    h = wrap.clientHeight;
  const grid = [
    { x: w * 0.18, y: h * 0.28 },
    { x: w * 0.5, y: h * 0.28 },
    { x: w * 0.82, y: h * 0.28 },
    { x: w * 0.18, y: h * 0.58 },
    { x: w * 0.5, y: h * 0.58 },
    { x: w * 0.82, y: h * 0.58 },
    { x: w * 0.5, y: h * 0.85 },
  ];
  const map = {};
  categories.forEach((c, i) => (map[c] = grid[i]));
  return map;
}
let centers = makeCenters();
window.addEventListener("resize", () => (centers = makeCenters()));

/*************** Helpers ***************/
function wrapLines(context, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (let w of words) {
    const t = line ? line + " " + w : w;
    if (context.measureText(t).width > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}
function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

/*************** Pool labels ***************/
const tagBank = {
  Faith: [
    "Catholic youth",
    "Muslim student",
    "Secular humanist",
    "Buddhist meditator",
    "Agnostic reader",
    "Interfaith volunteer",
    "Christian choir member",
    "Synagogue visitor",
    "Hindu festival-goer",
    "Sikh community runner",
  ],
  Region: [
    "Urban resident",
    "Rural farmer",
    "East Asia local",
    "US Midwest voter",
    "European commuter",
    "Coastal dweller",
    "Inland migrant",
    "Inner-city renter",
    "Suburban parent",
    "Remote worker",
  ],
  Age: [
    "Teenager gamer",
    "Young professional",
    "Middle-aged parent",
    "Retired hobbyist",
    "College freshman",
    "Gap-year traveler",
    "Gen Z creator",
    "Millennial designer",
    "Gen X manager",
    "Boomer gardener",
  ],
  Hobby: [
    "K-pop fan",
    "DIY maker",
    "Trail runner",
    "Indie film lover",
    "Esports viewer",
    "Chess enthusiast",
    "Anime collector",
    "Foodie blogger",
    "Pet rescuer",
    "Vintage photographer",
  ],
  Politics: [
    "Conservative voter",
    "Progressive activist",
    "Centrist reader",
    "Libertarian blogger",
    "Populist supporter",
    "Community organizer",
    "Policy debater",
    "Local council watcher",
    "Union member",
    "Green party member",
  ],
  Climate: [
    "Climate activist",
    "Vegan activist",
    "Renewables advocate",
    "Climate skeptic",
    "Plastic-free advocate",
    "Local recycler",
    "Urban gardener",
    "Transit advocate",
    "Zero-waste learner",
    "Wildlife volunteer",
  ],
  Gender: [
    "Women in STEM",
    "Men’s health advocate",
    "Non-binary artist",
    "Working mother",
    "Stay-at-home dad",
    "DEI trainer",
    "Gender policy analyst",
    "LGBTQ+ ally",
    "Caregiver",
    "Tech lead (she/her)",
  ],
};

/*************** Bubble class ***************/
class Bubble {
  constructor(label, cat, index) {
    this.label = label;
    this.cat = cat;
    this.seed = (index + 1) * 0.37;
    const c = centers[cat],
      jitterR = 120,
      pad = 48;
    this.x = Math.max(
      pad,
      Math.min(wrap.clientWidth - pad, c.x + (Math.random() * 2 - 1) * jitterR)
    );
    this.y = Math.max(
      pad,
      Math.min(wrap.clientHeight - pad, c.y + (Math.random() * 2 - 1) * jitterR)
    );
    this.r = 30 + Math.random() * 30;
    this.baseR = this.r;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.phase = Math.random() * Math.PI * 2;
    this.alive = true;
    this.searchHit = false;
  }
  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }
  update() {
    if (!this.alive) return;
    this.phase += 0.02;
    const breathe = Math.sin(this.phase) * 0.22;
    const targetR =
      this.baseR +
      breathe +
      (this === hoverBubble ? 3 : 0) +
      (this.searchHit ? 4 : 0);
    this.r += (targetR - this.r) * 0.18;

    const vmax = 0.95,
      spd = Math.hypot(this.vx, this.vy);
    if (spd > vmax) {
      this.vx = (this.vx / spd) * vmax;
      this.vy = (this.vy / spd) * vmax;
    }

    this.x += this.vx;
    this.y += this.vy;

    // 边界（左右/上）
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -1;
    }
    if (this.x + this.r > wrap.clientWidth) {
      this.x = wrap.clientWidth - this.r;
      this.vx *= -1;
    }
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -1;
    }

    // 地面约束：避免“掉下去又弹上来”的乱跳
    const floor = wrap.clientHeight - 20;
    if (this.y + this.r > floor) {
      this.y = floor - this.r;
      this.vy = Math.min(this.vy, 0); // 不允许继续向下
    }
  }
  draw() {
    if (!this.alive) return;
    const fill = colorFor(this.cat, "bubble", this.seed);
    if (this === hoverBubble || this.searchHit) {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = colorFor(this.cat, "shadow");
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(20,40,60,.22)";
    ctx.stroke();

    ctx.fillStyle = "#0b2540";
    ctx.font = "600 13px system-ui, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = wrapLines(ctx, this.label, this.r * 1.7);
    const lh = 16,
      total = lines.length * lh;
    lines.forEach((ln, i) =>
      ctx.fillText(ln, this.x, this.y - total / 2 + i * lh + lh / 2)
    );
  }
  contains(mx, my) {
    return Math.hypot(mx - this.x, my - this.y) <= this.r;
  }
}

/*************** Generate bubbles ***************/
const used = new Set();
const bubbles = [];
for (const cat of categories) {
  tagBank[cat].forEach((label, i) => {
    if (!used.has(label)) {
      used.add(label);
      bubbles.push(new Bubble(label, cat, i));
    }
  });
}
/* Fill ratio */
(function autoFillIfSparse() {
  const area = wrap.clientWidth * wrap.clientHeight;
  let sum = 0;
  bubbles.forEach((b) => (sum += Math.PI * b.r * b.r));
  const cover = sum / area,
    target = 0.28;
  if (cover < target) {
    const factor = Math.sqrt(target / Math.max(0.001, cover));
    bubbles.forEach((b) => {
      b.r *= factor;
      b.baseR = b.r;
    });
  }
})();

/*************** Physics ***************/
function physicsStep() {
  const toCenter = 0.0025,
    attract = 0.0055,
    repel = 0.0095,
    separate = 0.03,
    minGap = 6;
  for (const a of bubbles) {
    if (!a.alive) continue;
    const c = centers[a.cat];
    a.applyForce((c.x - a.x) * toCenter, (c.y - a.y) * toCenter);
  }
  for (let i = 0; i < bubbles.length; i++) {
    const a = bubbles[i];
    if (!a.alive) continue;
    for (let j = i + 1; j < bubbles.length; j++) {
      const b = bubbles[j];
      if (!b.alive) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      let dist = Math.hypot(dx, dy) || 0.0001;
      const nx = dx / dist,
        ny = dy / dist;
      const desired = a.r + b.r + minGap;
      if (dist < desired) {
        const overlap = desired - dist,
          push = overlap * separate;
        a.applyForce(-nx * push, -ny * push);
        b.applyForce(nx * push, ny * push);
        const adjust = overlap * 0.5;
        a.x -= nx * adjust;
        a.y -= ny * adjust;
        b.x += nx * adjust;
        b.y += ny * adjust;
        dist = desired;
      }
      const base =
        (a.cat === b.cat ? attract : -repel) * Math.min(1, 220 / dist);
      a.applyForce(nx * base, ny * base);
      b.applyForce(-nx * base, -ny * base);
    }
  }
}

/*************** Hover & Search ***************/
let hoverBubble = null;
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left,
    my = e.clientY - rect.top;
  hoverBubble = null;
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (b.alive && b.contains(mx, my)) {
      hoverBubble = b;
      break;
    }
  }
  canvas.style.cursor = hoverBubble ? "pointer" : "default";
});
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  bubbles.forEach((b) => {
    b.searchHit = !!q && b.label.toLowerCase().includes(q);
    if (b.searchHit) {
      const cx = wrap.clientWidth / 2,
        cy = wrap.clientHeight / 2;
      b.applyForce((cx - b.x) * 0.02, (cy - b.y) * 0.02);
    }
  });
});

/*************** Mode helpers ***************/
function setProgress(step) {
  [...progressBar.children].forEach((s) =>
    s.classList.toggle("active", s.getAttribute("data-step") === step)
  );
}
function setMode(mode) {
  appMode = mode;
  toggleViewBtn.setAttribute("aria-pressed", String(mode === "hidden"));
  compareBtn.setAttribute("aria-pressed", String(mode === "compare"));
  modeBackBtn.style.display =
    mode === "teleport" || mode === "compare" ? "inline-block" : "none";
  if (mode === "teleport") {
    showNotice("Crossing the Information Cocoon → Viewing mixed perspectives");
  } else if (mode === "compare") {
    showNotice("Compare Mode (Left · Center · Right)");
  } else hideNotice();
  hiddenPanel.hidden = !(mode === "hidden" || mode === "compare");
}

/*************** Zoom & Notices ***************/
let noticeTimer = null;
function showNotice(text) {
  modeNotice.textContent = text;
  modeNotice.classList.add("show");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => modeNotice.classList.remove("show"), 2600);
}
function hideNotice() {
  modeNotice.classList.remove("show");
}

/*************** Open/Close feed ***************/
function colorifyPills(cat) {
  feedTag.style.background = colorFor(cat, "pill-solid");
  feedTag.style.color = "#102a43";
  feedTag.dataset.cat = cat;
  feedCat.dataset.cat = cat;
  feedCat.style.borderColor = colorFor(cat, "pill-solid");
  feedCat.style.color = "#102a43";
}
function openFeedFromBubble(b) {
  lastMainCat = b.cat;
  lastLabel = b.label;
  setProgress("B");

  const rect = wrap.getBoundingClientRect();
  const cx = rect.left + b.x,
    cy = rect.top + b.y;
  zoomCircle.style.background = colorFor(b.cat, "zoom");
  zoomCircle.style.left = `${cx}px`;
  zoomCircle.style.top = `${cy}px`;
  zoomCircle.style.width = `${b.r * 2}px`;
  zoomCircle.style.height = `${b.r * 2}px`;
  zoomCircle.style.opacity = "1";
  const diag = Math.hypot(window.innerWidth, window.innerHeight);
  const scale = (diag / b.r) * 0.6;
  requestAnimationFrame(() => {
    zoomCircle.style.transform = `translate(-50%,-50%) scale(${scale})`;
  });

  setTimeout(() => {
    feedTag.textContent = b.label;
    feedCat.textContent = b.cat;
    colorifyPills(b.cat);
    setMode("normal");
    renderFeed(b.cat, b.label, false);
    feedView.classList.add("active");
    feedView.setAttribute("aria-hidden", "false");
    document.body.classList.add("feed-active");
  }, 460);
}
function closeFeed() {
  feedView.classList.remove("active");
  feedView.setAttribute("aria-hidden", "true");
  zoomCircle.style.transform = `translate(-50%,-50%) scale(0.01)`;
  setTimeout(() => {
    zoomCircle.style.opacity = "0";
  }, 220);
  setProgress("A");
  document.body.classList.remove("feed-active");
}

/*************** DS ***************/
function calcDiversity(cat, items) {
  const cats = cat === "MyBubble" ? Object.keys(hiddenPosts) : [cat];
  const universe = new Set();
  cats.forEach((c) => {
    hiddenPosts[c].aligned.forEach((x) => universe.add(`${c}:${x.topic}`));
    hiddenPosts[c].hidden.forEach((x) => universe.add(`${c}:${x.topic}`));
  });
  const shown = new Set(items.map((x) => `${x.cat}:${x.topic}`));
  const coverage = universe.size ? shown.size / universe.size : 0;
  const total = Math.max(1, items.length);
  const stanceCounts = { pro: 0, neutral: 0, con: 0 };
  items.forEach(
    (x) => (stanceCounts[x.stance] = (stanceCounts[x.stance] || 0) + 1)
  );
  const maxShare =
    Math.max(stanceCounts.pro, stanceCounts.neutral, stanceCounts.con) / total;
  const stanceDiv = 1 - maxShare;
  const domains = new Set(items.map((x) => getDomain(x.u)));
  const sourceVar = Math.min(1, domains.size / total);
  const score = Math.min(
    100,
    Math.round(100 * (0.4 * coverage + 0.4 * stanceDiv + 0.2 * sourceVar))
  );
  return { score, coverage, stanceDiv, sourceVar };
}

/*************** Render feed ***************/
function renderFeed(
  cat,
  label,
  includeHidden = false,
  mixWithCat = null,
  mixRatio = 0.5
) {
  const A_aligned =
    hiddenPosts[cat]?.aligned.map((x) => ({ ...x, aligned: true, cat })) ?? [];
  const A_hidden =
    hiddenPosts[cat]?.hidden.map((x) => ({ ...x, aligned: false, cat })) ?? [];
  let items = includeHidden ? [...A_aligned, ...A_hidden] : [...A_aligned];

  // Teleport: mix with adjacent
  if (mixWithCat && hiddenPosts[mixWithCat]) {
    const B_aligned = hiddenPosts[mixWithCat].aligned.map((x) => ({
      ...x,
      aligned: true,
      cat: mixWithCat,
    }));
    const B_hidden = hiddenPosts[mixWithCat].hidden.map((x) => ({
      ...x,
      aligned: false,
      cat: mixWithCat,
    }));
    const fromB = [];
    const targetCount = Math.ceil(12 * mixRatio);
    fromB.push(...B_hidden.slice(0, targetCount));
    if (fromB.length < targetCount)
      fromB.push(...B_aligned.slice(0, targetCount - fromB.length));
    const merged = [];
    const a = includeHidden ? [...A_hidden, ...A_aligned] : [...A_aligned];
    const maxLen = Math.max(a.length, fromB.length);
    for (let i = 0; i < maxLen; i++) {
      if (fromB[i]) merged.push(fromB[i]);
      if (a[i]) merged.push(a[i]);
    }
    items = merged;
  }

  const ds = calcDiversity(cat === "MyBubble" ? "MyBubble" : cat, items);
  diversityBadge.textContent = `Diversity Score: ${ds.score}%`;
  diversityBadge.style.background =
    cat === "MyBubble"
      ? "#7b1e1e"
      : ds.score >= DS_TARGET
      ? "#1b9e77"
      : "#182d4d";

  feedList.classList.remove("compare-mode");
  feedList.innerHTML = "";
  items.slice(0, 12).forEach((it) => {
    const card = document.createElement("div");
    card.className = "feed-card";
    if (!it.aligned) {
      card.classList.add("hidden-bg", "hidden-border");
    }
    const barColor = it.aligned
      ? colorFor(it.cat, "bar-aligned")
      : colorFor(it.cat, "bar-hidden");
    card.innerHTML = `
      <h3 style="border-left-color:${barColor}">${it.t}</h3>
      <p>${
        it.aligned
          ? "Algorithm-friendly content"
          : "Contrasting perspective (Hidden)"
      } — <strong>${it.cat}</strong></p>
      <div class="meta">${it.cat} · ${it.topic} · ${it.stance}</div>
    `;
    if (it.u) {
      const a = document.createElement("a");
      a.href = it.u;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open link ↗";
      card.appendChild(a);
    }
    feedList.appendChild(card);
  });

  if (!hiddenPanel.hidden) {
    hiddenList.innerHTML = "";
    (hiddenPosts[cat]?.hidden ?? []).forEach((it) => {
      const box = document.createElement("div");
      box.className = "hidden-item";
      box.style.borderLeftColor = colorFor(cat, "bar-hidden");
      box.innerHTML = `<div><a href="${
        it.u
      }" target="_blank" rel="noopener noreferrer">${it.t}</a></div>
                       <div class="stance">${it.topic} · ${
        it.stance
      } · ${getDomain(it.u)}</div>`;
      hiddenList.appendChild(box);
    });
  }
}

/*************** Compare（真实聚合 + 强配色） ***************/
const COMP_COLORS = { con: "#d32f2f", neutral: "#455a64", pro: "#1565c0" };
function groupByTopicFromHidden(cat) {
  const src = hiddenPosts[cat] || { aligned: [], hidden: [] };
  const list = [
    ...src.aligned.map((x) => ({ ...x, source: "aligned" })),
    ...src.hidden.map((x) => ({ ...x, source: "hidden" })),
  ];
  const map = new Map();
  list.forEach((item) => {
    const topic = item.topic || "General";
    if (!map.has(topic)) map.set(topic, { con: [], neutral: [], pro: [] });
    const s = (item.stance || "neutral").toLowerCase();
    if (s === "con" || s === "neutral" || s === "pro") {
      map.get(topic)[s].push(item);
    }
  });
  return map;
}
const FALLBACKS = {
  con: {
    t: "Media bias and counterpoints",
    u: "https://www.allsides.com/media-bias",
  },
  neutral: {
    t: "Overview: topic explained",
    u: "https://en.wikipedia.org/wiki/Overview",
  },
  pro: { t: "Research summary & evidence", u: "https://ourworldindata.org/" },
};
function borrowEntry(cat, stance, usedSet) {
  const pool = [
    ...(hiddenPosts[cat]?.aligned || []),
    ...(hiddenPosts[cat]?.hidden || []),
  ].filter((x) => x.stance === stance);
  for (const e of pool) {
    const key = `${e.t}|${e.u}`;
    if (!usedSet.has(key)) return e;
  }
  return FALLBACKS[stance];
}
function renderCompareFromHidden(cat) {
  feedList.classList.add("compare-mode");
  feedList.innerHTML = "";
  const wrapEl = document.createElement("div");
  wrapEl.className = "compare-grid";
  const cols = [
    {
      key: "con",
      title: "Left Perspective",
      cls: "left",
      color: COMP_COLORS.con,
    },
    {
      key: "neutral",
      title: "Center",
      cls: "center",
      color: COMP_COLORS.neutral,
    },
    {
      key: "pro",
      title: "Right Perspective",
      cls: "right",
      color: COMP_COLORS.pro,
    },
  ];
  const colEls = cols.map((col) => {
    const el = document.createElement("div");
    el.className = `compare-col ${col.cls}`;
    const h = document.createElement("div");
    h.className = "col-title";
    h.textContent = col.title;
    el.appendChild(h);
    wrapEl.appendChild(el);
    return el;
  });

  const map = groupByTopicFromHidden(cat);
  const topics = [...map.keys()].sort();
  const used = new Set();

  topics.forEach((topic) => {
    const bucket = map.get(topic);
    cols.forEach((c, idx) => {
      let entry = bucket[c.key][0];
      if (!entry) {
        entry = borrowEntry(cat, c.key, used);
      }
      const card = document.createElement("div");
      card.className = "feed-card";
      const barColor = c.color;
      card.innerHTML = `
        <h3 style="border-left-color:${barColor}">${entry.t}</h3>
        <p>${topic} — ${c.title}</p>
        <div class="meta">${getDomain(entry.u)}</div>`;
      if (entry.u) {
        const a = document.createElement("a");
        a.href = entry.u;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Open link ↗";
        card.appendChild(a);
      }
      used.add(`${entry.t}|${entry.u}`);
      colEls[idx].appendChild(card);
    });
  });

  feedList.appendChild(wrapEl);
  hiddenPanel.hidden = false;
  diversityBadge.textContent = "Diversity Score: n/a";
  diversityBadge.style.background = "#182d4d";
}

/*************** Teleport ***************/
const ADJ = {
  Region: ["Climate", "Politics"],
  Climate: ["Region", "Hobby"],
  Age: ["Hobby", "Politics"],
  Hobby: ["Age", "Climate"],
  Politics: ["Region", "Age"],
  Faith: ["Politics", "Region"],
  Gender: ["Politics", "Work"],
};
function pickAdjacent(cat) {
  const list = ADJ[cat] || categories.filter((c) => c !== cat);
  return list[Math.floor(Math.random() * list.length)];
}

/*************** Particles ***************/
function runBurst(x, y, cat) {
  const color = colorFor(cat, "bar-hidden");
  burstCanvas.style.display = "block";
  const particles = [];
  const N = 90;
  for (let i = 0; i < N; i++) {
    const ang = Math.random() * Math.PI * 2,
      sp = 2 + Math.random() * 5;
    particles.push({
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 1,
      r: 2 + Math.random() * 3,
      life: 60 + Math.random() * 30,
    });
  }
  function step() {
    bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life--;
      bctx.beginPath();
      bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bctx.fillStyle = color;
      bctx.fill();
    });
    if (particles.some((p) => p.life > 0)) requestAnimationFrame(step);
    else burstCanvas.style.display = "none";
  }
  step();
}
function runSuction(cx, cy) {
  burstCanvas.style.display = "block";
  const particles = [];
  const N = 160;
  for (let i = 0; i < N; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const dx = cx - x,
      dy = cy - y,
      dist = Math.hypot(dx, dy) || 1;
    const vx = (dx / dist) * (1.5 + Math.random() * 2.5);
    const vy = (dy / dist) * (1.5 + Math.random() * 2.5);
    particles.push({
      x,
      y,
      vx,
      vy,
      r: 1 + Math.random() * 2,
      life: 50 + Math.random() * 40,
    });
  }
  function step() {
    bctx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      bctx.beginPath();
      bctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      bctx.fillStyle = "rgba(27,158,119,.8)";
      bctx.fill();
    });
    if (particles.some((p) => p.life > 0)) requestAnimationFrame(step);
    else burstCanvas.style.display = "none";
  }
  step();
}

/*************** Events: pool → feed ***************/
canvas.addEventListener("click", (e) => {
  if (
    builderUI.classList.contains("active") ||
    feedView.classList.contains("active")
  )
    return; // 防误触
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left,
    my = e.clientY - rect.top;
  setProgress("A");
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (b.alive && b.contains(mx, my)) {
      openFeedFromBubble(b);
      break;
    }
  }
});
backBtn.addEventListener("click", closeFeed);

/*************** Hidden toggle ***************/
toggleViewBtn.addEventListener("click", () => {
  if (!lastMainCat) return;
  if (appMode === "hidden") {
    setMode("normal");
    renderFeed(lastMainCat, lastLabel, false);
  } else {
    setMode("hidden");
    renderFeed(lastMainCat, lastLabel, true);
  }
});

/*************** Teleport ***************/
teleportBtn.addEventListener("click", () => {
  if (!lastMainCat) return;
  const mixCat = pickAdjacent(lastMainCat);
  setMode("teleport");
  const rect = feedView.getBoundingClientRect();
  runBurst(rect.left + rect.width / 2, rect.top + 120, mixCat);
  zoomCircle.style.background = colorFor(mixCat, "zoom");
  feedCat.textContent = `${lastMainCat} × ${mixCat}`;
  renderFeed(
    lastMainCat,
    lastLabel,
    true,
    (mixWithCat = mixCat),
    (mixRatio = 0.5)
  );
  setProgress("B");
});
modeBackBtn.addEventListener("click", () => {
  if (!lastMainCat) return;
  setMode("normal");
  feedCat.textContent = lastMainCat;
  renderFeed(lastMainCat, lastLabel, false);
});

/*************** Compare 按钮 ***************/
compareBtn.addEventListener("click", () => {
  if (!lastMainCat) return;
  if (appMode === "compare") {
    setMode("normal");
    feedList.classList.remove("compare-mode");
    renderFeed(lastMainCat, lastLabel, false);
  } else {
    setMode("compare");
    renderCompareFromHidden(lastMainCat);
  }
});

/*************** Builder（legend + 布局 + 拖拽 + 点击兜底） ***************/
const TAGS_SOURCE = [
  // Age
  { cat: "Age", label: "18–24" },
  { cat: "Age", label: "25–34" },
  { cat: "Age", label: "35–44" },
  { cat: "Age", label: "45–54" },
  { cat: "Age", label: "55+" },
  // Gender
  { cat: "Gender", label: "Female" },
  { cat: "Gender", label: "Male" },
  { cat: "Gender", label: "Non-binary" },
  // Region
  { cat: "Region", label: "Coastal" },
  { cat: "Region", label: "Urban" },
  { cat: "Region", label: "Rural" },
  { cat: "Region", label: "Suburban" },
  // Hobby
  { cat: "Hobby", label: "K-pop" },
  { cat: "Hobby", label: "Maker" },
  { cat: "Hobby", label: "Esports" },
  { cat: "Hobby", label: "Indie film" },
  { cat: "Hobby", label: "Chess" },
  { cat: "Hobby", label: "Anime" },
  // Politics
  { cat: "Politics", label: "Center" },
  { cat: "Politics", label: "Progressive" },
  { cat: "Politics", label: "Conservative" },
  { cat: "Politics", label: "Libertarian" },
  // Climate
  { cat: "Climate", label: "Plastic-free" },
  { cat: "Climate", label: "Renewables" },
  { cat: "Climate", label: "Skeptical" },
  { cat: "Climate", label: "Urban gardening" },
  // Faith
  { cat: "Faith", label: "Secular" },
  { cat: "Faith", label: "Religious" },
];
let pickedTags = [];

function renderLegend() {
  chipLegend.innerHTML = "";
  ["Age", "Gender", "Region", "Hobby", "Politics", "Climate", "Faith"].forEach(
    (c) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `<span class="dot" style="background:${colorFor(
        c,
        "chip-dot"
      )}"></span>${c}`;
      chipLegend.appendChild(chip);
    }
  );
}
renderLegend();

function builderToggle(on) {
  document.body.classList.toggle("builder-active", on);
  buildBtn.setAttribute("aria-pressed", String(on));
  builderUI.classList.toggle("active", on);
  builderUI.setAttribute("aria-hidden", on ? "false" : "true");
  tagLayer.innerHTML = "";
  pickedTags = [];
  updateBigBubble();
  setProgress(on ? "C" : "A");

  if (builderSub) {
    builderSub.textContent = `Drag at least ${MIN_TAGS} tags into the big bubble.`;
  }

  if (on) {
    tagLayer.style.display = "block";
    tagLayer.style.gridTemplateColumns = "none";
    tagLayer.style.gridAutoFlow = "unset";

    TAGS_SOURCE.forEach((t) => {
      const node = document.createElement("div");
      node.className = "t-bubble";
      node.textContent = t.label;
      node.style.borderColor = colorFor(t.cat, "chip-dot");
      node.style.boxShadow = `0 8px 20px ${colorFor(t.cat, "shadow")}`;
      node.dataset.cat = t.cat;
      node.dataset.label = t.label;
      node.style.position = "absolute";
      tagLayer.appendChild(node);
      makeDraggable(node);
      node.addEventListener("click", () => pickTagByClick(node));
    });

    layoutTagGrid();
    layoutBuildStage();
    document.documentElement.style.overflow = "hidden";
  } else {
    document.documentElement.style.overflow = "";
  }
}
buildBtn.addEventListener("click", () =>
  builderToggle(!builderUI.classList.contains("active"))
);
builderExit.addEventListener("click", () => builderToggle(false));

/* Cocoon 放置：父容器坐标 + 间距，保证不覆盖托盘 */
function layoutBuildStage() {
  const safeGap = 56;
  const wrapH = wrap.clientHeight;
  let size = Math.min(460, wrapH * 0.46);

  const trayTop = tagLayer.offsetTop;
  let top = trayTop - size - safeGap;
  top = Math.max(120, top);

  const minSize = 300;
  if (top === 120) {
    const room = trayTop - safeGap - 120;
    size = Math.max(minSize, Math.min(size, room));
    top = trayTop - size - safeGap;
  }
  bigBubble.style.width = size + "px";
  bigBubble.style.height = size + "px";
  bigBubble.style.left = "50%";
  bigBubble.style.top = top + "px";
  bigBubble.style.transform = "translate(-50%,0)";
}

/* 标签网格：absolute + 父容器坐标 */
/* 标签托盘：自适应行折叠（避免长标签互相覆盖） */
function layoutTagGrid() {
  const PADX = 14; // 左右内边距
  const PADY = 10; // 上下内边距
  const GAPX = 18; // pill 之间横向间距
  const GAPY = 18; // 纵向行距
  const W = tagLayer.clientWidth;

  let x = PADX,
    y = PADY,
    lineH = 0;

  const kids = [...tagLayer.children];
  kids.forEach((el) => {
    // 先让元素“自然撑开”以读取真实宽高（无需 position:static）
    el.style.width = "auto";
    el.style.maxWidth = ""; // 避免旧限制
    const rect = el.getBoundingClientRect();
    const w = Math.min(rect.width, W - PADX * 2); // 防止超宽
    const h = rect.height;

    // 若此行放不下，换行
    if (x + w > W - PADX) {
      x = PADX;
      y += lineH + GAPY;
      lineH = 0;
    }

    el.style.left = x + "px";
    el.style.top = y + "px";
    x += w + GAPX;
    lineH = Math.max(lineH, h);
  });

  // 如果托盘内容高度不足以留出拖拽余量，轻微增高（可选）
  const minH = y + lineH + PADY;
  if (tagLayer.clientHeight < minH) {
    tagLayer.style.height =
      Math.min(minH + 12, window.innerHeight * 0.48) + "px";
  }
}

/* 拖拽（自身监听 + Pointer Capture） */
function makeDraggable(el) {
  let dragging = false,
    sx = 0,
    sy = 0,
    sl = 0,
    st = 0,
    moved = false;
  if (!el.style.left) {
    el.style.left = "0px";
  }
  if (!el.style.top) {
    el.style.top = "0px";
  }

  const onDown = (e) => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.touchAction = "none";
    dragging = true;
    moved = false;
    el.classList.add("dragging");
    el.setPointerCapture(e.pointerId);
    sx = e.clientX;
    sy = e.clientY;
    sl = parseFloat(el.style.left || "0");
    st = parseFloat(el.style.top || "0");
  };
  const onMove = (e) => {
    if (!dragging) return;
    let nx = sl + (e.clientX - sx);
    let ny = st + (e.clientY - sy);
    if (Math.abs(e.clientX - sx) > 3 || Math.abs(e.clientY - sy) > 3)
      moved = true;
    const maxX = tagLayer.clientWidth - el.offsetWidth;
    const maxY = tagLayer.clientHeight - el.offsetHeight;
    if (nx < 0) nx = 0;
    if (ny < 0) ny = 0;
    if (nx > maxX) nx = maxX;
    if (ny > maxY) ny = maxY;
    el.style.left = nx + "px";
    el.style.top = ny + "px";
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    try {
      el.releasePointerCapture(e.pointerId);
    } catch (_) {}
    document.body.style.userSelect = "";
    document.body.style.touchAction = "";

    if (!moved) return; // 纯点击交给 click 兜底

    // 命中 Cocoon（容错 12px）
    const bb = bigBubble.getBoundingClientRect();
    const r = bb.width / 2 + 12;
    const cx = bb.left + bb.width / 2,
      cy = bb.top + bb.height / 2;
    const er = el.getBoundingClientRect();
    const ex = er.left + er.width / 2,
      ey = er.top + er.height / 2;
    const inside = Math.hypot(ex - cx, ey - cy) <= r;
    if (inside) addPicked(el);
  };

  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
}

/* 点击兜底：更宽容的添加 */
function pickTagByClick(el) {
  if (!el) return;
  const bb = bigBubble.getBoundingClientRect();
  const r = bb.width / 2 + 20;
  const cx = bb.left + bb.width / 2,
    cy = bb.top + bb.height / 2;
  const er = el.getBoundingClientRect();
  const ex = er.left + er.width / 2,
    ey = er.top + er.height / 2;
  const near = Math.hypot(ex - cx, ey - cy) <= r;
  if (near || pickedTags.length < MIN_TAGS) addPicked(el);
}
function addPicked(el) {
  const cat = el.dataset.cat,
    label = el.dataset.label;
  if (!pickedTags.find((p) => p.cat === cat && p.label === label)) {
    pickedTags.push({ cat, label });
    el.style.opacity = "0.35";
    updateBigBubble();
  }
}

function updateBigBubble() {
  bbTags.innerHTML = "";
  pickedTags.forEach((pt) => {
    const tag = document.createElement("span");
    tag.className = "bb-tag";
    tag.textContent = `${pt.cat}: ${pt.label}`;
    tag.style.borderColor = colorFor(pt.cat, "chip-dot");
    bbTags.appendChild(tag);
  });
  pickedCountEl.textContent = String(pickedTags.length);
  bigBubble.classList.toggle("forming", pickedTags.length >= 1);
  bigBubble.classList.toggle("formed", pickedTags.length >= MIN_TAGS);
  enterBtn.disabled = pickedTags.length < MIN_TAGS;
}
resetBuildBtn.addEventListener("click", () => {
  pickedTags = [];
  updateBigBubble();
  [...tagLayer.children].forEach((el) => (el.style.opacity = "1"));
});

/* Enter cocoon → personalized feed */
enterBtn.addEventListener("click", () => {
  if (pickedTags.length < MIN_TAGS) return;
  setProgress("D");

  const rect = bigBubble.getBoundingClientRect();
  const cx = rect.left + rect.width / 2,
    cy = rect.top + rect.height / 2;
  runSuction(cx, cy);

  setTimeout(() => {
    feedTag.textContent =
      pickedTags
        .map((p) => p.label)
        .slice(0, 3)
        .join(" · ") + (pickedTags.length > 3 ? " · …" : "");
    feedCat.textContent = "MyBubble";
    feedCat.dataset.cat = "MyBubble";

    const selectedCats = Array.from(
      new Set(pickedTags.map((p) => p.cat))
    ).filter((c) => hiddenPosts[c]);
    let pool = [];
    selectedCats.forEach((c) => {
      pool.push(
        ...hiddenPosts[c].aligned.map((x) => ({ ...x, aligned: true, cat: c }))
      );
      pool.push(
        ...hiddenPosts[c].hidden
          .slice(0, 1)
          .map((x) => ({ ...x, aligned: false, cat: c }))
      );
    });
    pool.sort((a, b) => getDomain(a.u).localeCompare(getDomain(b.u)));

    renderPersonalizedFeed(pool);

    feedView.classList.add("active");
    feedView.setAttribute("aria-hidden", "false");
    document.body.classList.add("feed-active");
    builderToggle(false);
    setMode("mybubble");
  }, 420);
});
function renderPersonalizedFeed(pool) {
  const items = pool
    .sort((m, n) => (m.aligned === n.aligned ? 0 : m.aligned ? -1 : 1))
    .slice(0, 12);
  const ds = calcDiversity("MyBubble", items);
  diversityBadge.textContent = `Diversity Score: ${ds.score}%`;
  diversityBadge.style.background = "#7b1e1e";

  feedList.classList.remove("compare-mode");
  feedList.innerHTML = "";
  items.forEach((it) => {
    const card = document.createElement("div");
    card.className =
      "feed-card" + (it.aligned ? "" : " hidden-bg hidden-border");
    const barColor = it.aligned
      ? colorFor(it.cat, "bar-aligned")
      : colorFor(it.cat, "bar-hidden");
    card.innerHTML = `
      <h3 style="border-left-color:${barColor}">${it.t}</h3>
      <p>${
        it.aligned ? "Personalized (aligned)" : "Mildly contrasting"
      } — <strong>${it.cat}</strong></p>
      <div class="meta">${it.cat} · ${it.topic} · ${it.stance}</div>
    `;
    if (it.u) {
      const a = document.createElement("a");
      a.href = it.u;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open link ↗";
      card.appendChild(a);
    }
    feedList.appendChild(card);
  });
  hiddenPanel.hidden = true;
}

/*************** Main loop ***************/
function loop() {
  physicsStep();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bubbles) {
    b.update();
    b.draw();
  }
  requestAnimationFrame(loop);
}
loop();

/* ---------- Pretty Sheet generator (mutually exclusive) ---------- */
function ensureSheet(id, title, html) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("section");
    el.id = id;
    el.className = "sheet";
    el.hidden = true;
    el.innerHTML = `
      <div class="sheet__backdrop" data-close="1"></div>
      <div class="sheet__card" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <button class="sheet__close" aria-label="Close" title="Close" data-close="1">×</button>
        <h3 id="${id}-title" class="sheet__title">${title}</h3>
        <div class="sheet__content">${html}</div>
      </div>`;
    document.body.appendChild(el);

    // 关闭：点遮罩/关闭键 或 Esc
    el.addEventListener("click", (e) => {
      if (e.target.dataset.close) el.hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (!el.hidden && e.key === "Escape") el.hidden = true;
    });
  }
  return el;
}

/* --- Updated English copy --- */
const HOME_COPY = `
  <p><em>Welcome to Bubble Switch.</em> Explore how identity, interests, and perspectives shape the bubbles around us. Start by dragging tags into your Cocoon and see how the world looks from within.</p>
`;
const METHOD_COPY = `
  <p><em>How it works</em></p>
  <ol>
    <li><strong>Build your Cocoon</strong> — Select tags that represent your identity or interests.</li>
    <li><strong>Enter the Feed</strong> — See articles and perspectives shaped by your chosen Cocoon.</li>
    <li><strong>Switch Views</strong> — Compare perspectives, reveal hidden posts, or teleport to explore different bubbles.</li>
  </ol>
  <p>The process shows how filter bubbles emerge — and how stepping across them opens new perspectives.</p>
`;
const ABOUT_COPY = `
  <p><em>About Bubble Switch</em></p>
  <p>This is an experimental project on <strong>filter bubbles</strong> and <strong>information diversity</strong>. It explores how algorithms shape what we see, and how our chosen identities reinforce or challenge these patterns. Bubble Switch is not just a visualization — it’s an invitation to test how fragile and flexible our own perspectives can be.</p>
`;

/* 创建两个互斥面板 */
const methodSheet = ensureSheet("methodSheet", "Method", METHOD_COPY);
const aboutSheet = ensureSheet("aboutSheet", "About", ABOUT_COPY);

function showSheet(which) {
  // 'method' | 'about' | 'none'
  methodSheet.hidden = which !== "method";
  aboutSheet.hidden = which !== "about";
}

/* 顶部导航互斥行为 */
document
  .querySelector('.menu a[title="Method"]')
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showSheet(methodSheet.hidden ? "method" : "none");
  });
document
  .querySelector('.menu a[title="About"]')
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showSheet(aboutSheet.hidden ? "about" : "none");
  });
document
  .querySelector('.menu a[title="Home"]')
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    showSheet("none");
    // 可选：Home 弹个轻提示（使用你已有的 showNotice）
    // showNotice('Welcome to Bubble Switch — drag tags to build your Cocoon.');
  });
