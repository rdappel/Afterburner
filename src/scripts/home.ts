// Afterburner — home page interactions.
// Everything here is progressive: without JS the page still renders every section in place.

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/* ---------- hero: rolling word + cursor spotlight ---------- */
const slot = $('[data-slot]');
if (slot && !reduceMotion) {
  let i = 0;
  setInterval(() => {
    i = (i + 1) % 4;
    slot.style.transform = `translateY(-${(i * 0.86).toFixed(2)}em)`;
  }, 2200);
}
const hero = $('.hero');
if (hero) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

/* ---------- stats: count up when they scroll into view ---------- */
const stats = $('[data-stats]');
if (stats && 'IntersectionObserver' in window && !reduceMotion) {
  stats.classList.add('stats-wait');
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      requestAnimationFrame(() => stats.classList.remove('stats-wait'));
      io.disconnect();
    }
  }, { threshold: 0.3 });
  io.observe(stats);
}

/* ---------- selected work: filters + pinned fly-in/fly-out showcase ---------- */
const show = $('[data-show]');
const showSticky = show ? $('.show-sticky', show) : null;
const showFill = show ? $('.show-fill', show) : null;
const allItems = show ? $$('.show-item', show) : [];
const workCount = $('[data-work-count]');

$$('[data-filter]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter!;
    $$('[data-filter]').forEach((b) => {
      b.classList.toggle('on', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    let n = 0;
    allItems.forEach((it) => {
      const on = f === 'all' || it.dataset.cat === f;
      it.hidden = !on;
      if (on) n++;
    });
    show?.style.setProperty('--n', String(n));
    if (workCount) workCount.textContent = String(n).padStart(2, '0');
    if (show) {
      const top = show.getBoundingClientRect().top + window.scrollY - 72;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

let showWasPinned = false;
function updateShow() {
  if (!show || !showSticky) return;
  const items = allItems.filter((it) => !it.hidden);
  const pinned = getComputedStyle(showSticky).position === 'sticky';
  if (!pinned) {
    if (showWasPinned) {
      allItems.forEach((it) => {
        it.style.visibility = ''; it.style.pointerEvents = '';
        $$('.info, .screen', it).forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
      });
      showWasPinned = false;
    }
    return;
  }
  showWasPinned = true;
  const r = show.getBoundingClientRect();
  const total = Math.max(1, r.height - showSticky.offsetHeight);
  const p = Math.min(1, Math.max(0, (72 - r.top) / total));
  if (showFill) showFill.style.transform = `scaleX(${p})`;
  const n = items.length;
  const f = p * n;
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  items.forEach((it, i) => {
    const dir = i % 2 ? -1 : 1;
    const t = f - i;
    let phase: 'in' | 'hold' | 'out' = 'hold';
    let k = 0;
    if (t < 0.22) { if (i !== 0) { phase = 'in'; k = 1 - ease(Math.max(0, t) / 0.22); } }
    else if (t > 0.78) { if (i !== n - 1) { phase = 'out'; k = ease(Math.min(1, (t - 0.78) / 0.22)); } }
    const info = $('.info', it);
    const screen = $('.screen', it);
    let st = 'none';
    let inf = 'none';
    if (phase === 'in' && k > 0) {
      st = `translate(${60 * dir * k}%, ${115 * k}%) rotate(${16 * dir * k}deg) scale(${1 - 0.25 * k})`;
      inf = `translateY(${160 * k}px)`;
    } else if (phase === 'out' && k > 0) {
      st = `translate(${-50 * dir * k}%, ${-125 * k}%) rotate(${-14 * dir * k}deg) scale(${1 - 0.25 * k})`;
      inf = `translateY(${-160 * k}px)`;
    }
    const op = 1 - k;
    if (screen) { screen.style.transform = st; screen.style.opacity = String(op); }
    if (info) { info.style.transform = inf; info.style.opacity = String(op); }
    it.style.visibility = op > 0.02 ? 'visible' : 'hidden';
    it.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
  });
}

/* ---------- the lab: live broad-phase collision demo ---------- */
const lab = $('[data-lab]');
const canvas = lab ? $<HTMLCanvasElement>('canvas', lab) : null;
const out = (k: string) => (lab ? $(`[data-out="${k}"]`, lab) : null);
const labState = { mode: 'grid' as 'grid' | 'brute', n: 400 };
type Obj = { x: number; y: number; vx: number; vy: number; r: number; hit: number };
const objs: Obj[] = [];
let ptr: { x: number; y: number } | null = null;
let labVisible = true;

if (lab && canvas) {
  $$<HTMLButtonElement>('[data-mode]', lab).forEach((b) => b.addEventListener('click', () => {
    labState.mode = b.dataset.mode as 'grid' | 'brute';
    $$<HTMLButtonElement>('[data-mode]', lab).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    const m = out('mode'); if (m) m.textContent = labState.mode === 'grid' ? 'Spatial grid · 40px sectors' : 'Brute force · every pair';
  }));
  const range = $<HTMLInputElement>('#lab-n', lab)!;
  const onRange = () => {
    labState.n = Number(range.value);
    const nOut = out('n'); if (nOut) nOut.textContent = String(labState.n);
    const b = out('brute'); if (b) b.textContent = fmt((labState.n * (labState.n - 1)) / 2);
  };
  range.addEventListener('input', onRange);
  canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); ptr = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  canvas.addEventListener('pointerleave', () => { ptr = null; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { labVisible = es.some((e) => e.isIntersecting); }).observe(canvas);
  }
}

let frames = 0;
let lastStat = performance.now();
const css = getComputedStyle(document.querySelector('.site') || document.body);
const LIME = css.getPropertyValue('--accent').trim() || '#D4FF3A';
const palette = [LIME, '#3A60FF', '#A8C2FF'];

function stepLab(t: number) {
  if (!canvas || !labVisible) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = labState.n;
  while (objs.length < n) objs.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 2.4, vy: (Math.random() - 0.5) * 2.4, r: 2 + Math.random() * 4, hit: 0 });
  if (objs.length > n) objs.length = n;
  const p = ptr;
  for (const o of objs) {
    if (p) {
      const dx = o.x - p.x, dy = o.y - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 16900 && d2 > 1) { const d = Math.sqrt(d2), f = ((130 - d) / 130) * 1.1; o.vx += (dx / d) * f; o.vy += (dy / d) * f; }
    }
    o.vx *= 0.985; o.vy *= 0.985;
    const sp = Math.hypot(o.vx, o.vy);
    if (sp < 0.7) { o.vx *= 1.06; o.vy *= 1.06; }
    if (sp > 6) { o.vx *= 0.9; o.vy *= 0.9; }
    o.x += o.vx; o.y += o.vy;
    if (o.x < o.r) { o.x = o.r; o.vx = Math.abs(o.vx); }
    if (o.x > w - o.r) { o.x = w - o.r; o.vx = -Math.abs(o.vx); }
    if (o.y < o.r) { o.y = o.r; o.vy = Math.abs(o.vy); }
    if (o.y > h - o.r) { o.y = h - o.r; o.vy = -Math.abs(o.vy); }
    o.hit = 0;
  }
  let checks = 0;
  const grid = labState.mode === 'grid';
  const cell = 40, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const test = (a: Obj, b: Obj) => { checks++; const dx = a.x - b.x, dy = a.y - b.y, rr = a.r + b.r; if (dx * dx + dy * dy < rr * rr) { a.hit = 1; b.hit = 1; } };
  let buckets: Obj[][] = [];
  if (grid) {
    buckets = Array.from({ length: cols * rows }, () => []);
    for (const o of objs) {
      const x0 = Math.max(0, Math.floor((o.x - o.r) / cell)), x1 = Math.min(cols - 1, Math.floor((o.x + o.r) / cell));
      const y0 = Math.max(0, Math.floor((o.y - o.r) / cell)), y1 = Math.min(rows - 1, Math.floor((o.y + o.r) / cell));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) buckets[y * cols + x].push(o);
    }
    for (const b of buckets) for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) test(b[i], b[j]);
  } else {
    for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) test(objs[i], objs[j]);
  }
  ctx.fillStyle = '#0B0B0B';
  ctx.fillRect(0, 0, w, h);
  if (grid) {
    for (let i = 0; i < buckets.length; i++) {
      const len = buckets[i].length;
      if (len > 1) { ctx.globalAlpha = Math.min(0.12 + len * 0.03, 0.35); ctx.fillStyle = palette[(len - 2) % palette.length]; ctx.fillRect((i % cols) * cell, Math.floor(i / cols) * cell, cell, cell); }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(244,244,240,0.08)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0; x <= w; x += cell) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 0; y <= h; y += cell) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(168,194,255,0.08)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < Math.min(4, objs.length); k++) { const a = objs[k]; for (let j = 0; j < objs.length; j += 2) { ctx.moveTo(a.x, a.y); ctx.lineTo(objs[j].x, objs[j].y); } }
    ctx.stroke();
  }
  ctx.fillStyle = '#F4F4F0'; ctx.beginPath();
  for (const o of objs) if (!o.hit) { ctx.moveTo(o.x + o.r, o.y); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); }
  ctx.fill();
  ctx.fillStyle = palette[0]; ctx.beginPath();
  for (const o of objs) if (o.hit) { ctx.moveTo(o.x + o.r + 2, o.y); ctx.arc(o.x, o.y, o.r + 2, 0, Math.PI * 2); }
  ctx.fill();
  if (p) {
    ctx.fillStyle = palette[2]; ctx.beginPath();
    ctx.moveTo(p.x, p.y - 16); ctx.lineTo(p.x + 12, p.y + 12); ctx.lineTo(p.x, p.y + 6); ctx.lineTo(p.x - 12, p.y + 12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = palette[2]; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(p.x, p.y, 130, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
  frames++;
  if (t - lastStat > 400) {
    const fps = Math.round((frames * 1000) / (t - lastStat));
    frames = 0; lastStat = t;
    const bruteN = (n * (n - 1)) / 2;
    const c = out('checks'); if (c) c.textContent = fmt(checks);
    const s = out('saved'); if (s) s.textContent = grid && bruteN ? `${Math.max(0, Math.round((1 - checks / bruteN) * 1000) / 10)}%` : '0%';
    const fo = out('fps'); if (fo) fo.textContent = String(fps);
  }
}

/* ---------- teaching: current / archived + rail arrows ---------- */
const rails = $$('[data-rail-list]');
$$('[data-courses]').forEach((btn) => btn.addEventListener('click', () => {
  $$('[data-courses]').forEach((b) => { b.classList.toggle('on', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
  rails.forEach((r) => { r.hidden = r.dataset.railList !== btn.dataset.courses; r.scrollLeft = 0; });
}));
$$('[data-rail]').forEach((btn) => btn.addEventListener('click', () => {
  const rail = rails.find((r) => !r.hidden);
  rail?.scrollBy({ left: Number(btn.dataset.rail) * 350, behavior: 'smooth' });
}));

/* ---------- stack tabs (un-hiding a panel replays its entrance animation) ---------- */
const tabs = $$<HTMLButtonElement>('[data-tab]');
tabs.forEach((btn) => btn.addEventListener('click', () => {
  tabs.forEach((b) => { b.classList.toggle('on', b === btn); b.setAttribute('aria-selected', String(b === btn)); });
  $$('.stack-panel').forEach((p) => { p.hidden = p.id !== `panel-${btn.dataset.tab}`; });
}));
// Arrow-key navigation between tabs
tabs.forEach((btn, i) => btn.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
  next.focus(); next.click();
}));

/* ---------- contact: magnetic button + form ---------- */
const cta = $('[data-cta]');
const magnet = $('[data-magnet]');
if (cta && magnet && window.matchMedia('(hover: hover)').matches) {
  cta.addEventListener('pointermove', (e) => {
    const r = magnet.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    magnet.style.transform = Math.hypot(dx, dy) < 320 ? `translate(${dx * 0.35}px, ${dy * 0.35}px) rotate(${dx * 0.05}deg)` : '';
  });
  cta.addEventListener('pointerleave', () => { magnet.style.transform = ''; });
}

const form = $<HTMLFormElement>('[data-contact]');
if (form) {
  const status = $('[data-status]', form);
  const sent = $('[data-sent]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = form.getAttribute('action');
    if (!endpoint) {
      if (status) { status.textContent = 'The contact form isn’t connected yet — see README (PUBLIC_CONTACT_ENDPOINT).'; status.classList.add('err'); }
      return;
    }
    if (status) { status.textContent = 'Sending…'; status.classList.remove('err'); }
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.hidden = true;
      if (sent) sent.hidden = false;
    } catch {
      if (status) { status.textContent = 'Something went wrong — please try again.'; status.classList.add('err'); }
    }
  });
}

/* ---------- one animation loop for the showcase + lab ---------- */
function loop(t: number) {
  requestAnimationFrame(loop);
  updateShow();
  stepLab(t);
}
requestAnimationFrame(loop);
