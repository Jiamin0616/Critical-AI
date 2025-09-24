/* ========= Canvas & Sizing ========= */
const wrap = document.getElementById("poolWrap");
const canvas = document.getElementById("poolCanvas");
const ctx = canvas.getContext("2d");
const postLayer = document.getElementById("postLayer");
const searchInput = document.getElementById("searchInput");

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = wrap.clientWidth,
    h = wrap.clientHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

/* ========= Data ========= */
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
    "Climate denier",
    "Plastic-free advocate",
    "Local recycler",
    "Urban gardener",
    "Public transport advocate",
    "Zero-waste learner",
    "Wildlife volunteer",
  ],
};

const hiddenPosts = {
  Faith: [
    {
      t: "Why religious diversity matters in modern cities",
      u: "https://pluralism.org/",
    },
    { t: "Secular & spiritual ethics in everyday life", u: "https://aeon.co/" },
    {
      t: "Youth interfaith dialogues you can join",
      u: "https://www.interfaithyouthcore.org/",
    },
  ],
  Region: [
    {
      t: "Urban-rural income gaps: 10-year trends",
      u: "https://ourworldindata.org/",
    },
    { t: "How rail upgrades reshape small towns", u: "https://www.ft.com/" },
    {
      t: "Remote work and regional migration",
      u: "https://www.brookings.edu/",
    },
  ],
  Age: [
    { t: "Gen Z's new workplace norms", u: "https://hbr.org/" },
    { t: "Retirees: the hidden volunteers", u: "https://www.theguardian.com/" },
    { t: "Student mental health resources", u: "https://www.who.int/" },
  ],
  Hobby: [
    { t: "The global rise of esports", u: "https://www.newzoo.com/" },
    { t: "Indie cinema's comeback", u: "https://www.indiewire.com/" },
    { t: "Maker communities and open hardware", u: "https://makezine.com/" },
  ],
  Politics: [
    {
      t: "A primer on global populism shifts",
      u: "https://www.chathamhouse.org/",
    },
    { t: "What 'the center' means today", u: "https://www.economist.com/" },
    {
      t: "Local civics: how to participate",
      u: "https://www.usa.gov/elected-officials",
    },
  ],
  Climate: [
    { t: "Renewable energy growth 2020-2025", u: "https://www.iea.org/" },
    {
      t: "Diet choices & climate: current evidence",
      u: "https://www.nature.com/",
    },
    {
      t: "Plastic-free initiatives that actually work",
      u: "https://www.unep.org/",
    },
  ],
};

const categoryColors = {
  Faith: "rgba(255,120,120,0.65)",
  Region: "rgba(120,200,255,0.65)",
  Age: "rgba(180,120,255,0.65)",
  Hobby: "rgba(120,255,180,0.65)",
  Politics: "rgba(255,195,110,0.65)",
  Climate: "rgba(110,220,180,0.65)",
};
const categories = Object.keys(tagBank);

/* ========= Category centers (让同类聚在同一区域) ========= */
const centers = (() => {
  const w = wrap.clientWidth,
    h = wrap.clientHeight;
  // Divide into six categories → Arrange a 3x2 grid
  const grid = [
    { x: w * 0.2, y: h * 0.3 },
    { x: w * 0.5, y: h * 0.3 },
    { x: w * 0.8, y: h * 0.3 },
    { x: w * 0.2, y: h * 0.75 },
    { x: w * 0.5, y: h * 0.75 },
    { x: w * 0.8, y: h * 0.75 },
  ];
  const map = {};
  categories.forEach((c, i) => (map[c] = grid[i % grid.length]));
  return map;
})();

/* ========= Helpers ========= */
function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (let w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/* ========= Bubble ========= */
class Bubble {
  constructor(label, cat) {
    this.label = label;
    this.cat = cat;
    this.color = categoryColors[cat];

    // Initial position close to the center of this category (with a small amount of randomness)
    const c = centers[cat];
    const jitter = 120;
    const pad = 48;
    this.x = Math.max(
      pad,
      Math.min(wrap.clientWidth - pad, c.x + (Math.random() * 2 - 1) * jitter)
    );
    this.y = Math.max(
      pad,
      Math.min(wrap.clientHeight - pad, c.y + (Math.random() * 2 - 1) * jitter)
    );

    this.r = 30 + Math.random() * 30; // Bigger to be fuller
    this.baseR = this.r;
    this.vx = (Math.random() - 0.5) * 0.45; // Slow
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
    // Hovering or search hit slightly increases size
    const targetR =
      this.baseR +
      breathe +
      (this === hoverBubble ? 3 : 0) +
      (this.searchHit ? 4 : 0);
    this.r += (targetR - this.r) * 0.18;

    // Speed limit
    const vmax = 0.95;
    const spd = Math.hypot(this.vx, this.vy);
    if (spd > vmax) {
      this.vx = (this.vx / spd) * vmax;
      this.vy = (this.vy / spd) * vmax;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Boundary bounce
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
    if (this.y + this.r > wrap.clientHeight) {
      this.y = wrap.clientHeight - this.r;
      this.vy *= -1;
    }
  }

  draw() {
    if (!this.alive) return;

    // glow 高亮
    if (this === hoverBubble || this.searchHit) {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(255,215,0,0.9)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(20,40,60,.25)";
    ctx.stroke();

    // Tag label
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

/* ========= Create unique bubbles ========= */
const used = new Set();
const bubbles = [];
for (const cat of categories) {
  for (const label of tagBank[cat]) {
    if (used.has(label)) continue; // 确保唯一
    used.add(label);
    bubbles.push(new Bubble(label, cat));
  }
}

/* ========= Auto fill: 若覆盖率不足，整体放大 ========= */
function autoFillIfSparse() {
  const area = wrap.clientWidth * wrap.clientHeight;
  let sum = 0;
  bubbles.forEach((b) => (sum += Math.PI * b.r * b.r));
  const cover = sum / area; // 当前覆盖率
  const target = 0.28; // 目标覆盖率（可调）
  if (cover < target) {
    const factor = Math.sqrt(target / Math.max(0.001, cover));
    bubbles.forEach((b) => {
      b.r *= factor;
      b.baseR = b.r;
    });
  }
}
autoFillIfSparse();

/* ========= Physics: 同类吸中心 + 同类吸引 / 异类排斥 / 分离 ========= */
function physicsStep() {
  const toCenter = 0.0025; // 类别 → 自己中心的吸力
  const attract = 0.0055; // 同类相互吸
  const repel = 0.0095; // 异类排斥
  const separate = 0.03; // 分离力
  const minGap = 6;

  // 吸向所属类别中心（保持大致分区）
  for (const a of bubbles) {
    if (!a.alive) continue;
    const c = centers[a.cat];
    const dx = c.x - a.x,
      dy = c.y - a.y;
    a.applyForce(dx * toCenter, dy * toCenter);
  }

  // 两两作用
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

      // 分离（不重叠）
      const desired = a.r + b.r + minGap;
      if (dist < desired) {
        const overlap = desired - dist;
        const push = overlap * separate;
        a.applyForce(-nx * push, -ny * push);
        b.applyForce(nx * push, ny * push);
        const adjust = overlap * 0.5;
        a.x -= nx * adjust;
        a.y -= ny * adjust;
        b.x += nx * adjust;
        b.y += ny * adjust;
        dist = desired;
      }

      // 同类吸引 / 异类排斥
      const base =
        (a.cat === b.cat ? attract : -repel) * Math.min(1, 220 / dist);
      a.applyForce(nx * base, ny * base);
      b.applyForce(-nx * base, -ny * base);
    }
  }
}

/* ========= Hover & Search ========= */
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
    // 命中时轻微吸向画面中心，方便看到
    if (b.searchHit) {
      const cx = wrap.clientWidth / 2,
        cy = wrap.clientHeight / 2;
      const dx = cx - b.x,
        dy = cy - b.y;
      b.applyForce(dx * 0.02, dy * 0.02);
    }
  });
});

/* ========= Click → Pop bubble & show hidden post cards ========= */
function createPostCards(screenX, screenY, cat) {
  // 在postLayer（fixed层）上定位：已传入的是“相对窗口”的坐标
  const pool = hiddenPosts[cat] || [];
  const picks = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(2, Math.min(3, pool.length)));
  const offsets = [
    { dx: 0, dy: -90 },
    { dx: 0, dy: 90 },
    { dx: 170, dy: 0 },
    { dx: -170, dy: 0 },
  ];

  picks.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.style.left = `${screenX}px`;
    card.style.top = `${screenY}px`;
    card.innerHTML = `
      <h4>Hidden Post (${cat})</h4>
      <a href="${item.u}" target="_blank" rel="noopener noreferrer">${item.t}</a>
    `;
    postLayer.appendChild(card);
    // 小动画错位
    requestAnimationFrame(() => {
      const off = offsets[idx % offsets.length];
      card.style.transform = `translate(${off.dx}px, ${off.dy}px)`;
    });
    // 12 秒后淡出并移除
    setTimeout(() => (card.style.opacity = "0"), 12000);
    setTimeout(() => card.remove(), 13000);
  });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left,
    my = e.clientY - rect.top;
  // 找到被点击的泡泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    if (b.alive && b.contains(mx, my)) {
      // 屏幕坐标（postLayer是fixed）
      const screenX = rect.left + b.x;
      const screenY = rect.top + b.y;
      createPostCards(screenX, screenY, b.cat);
      b.alive = false; // 戳破
      break;
    }
  }
});

/* ========= Main Loop ========= */
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
