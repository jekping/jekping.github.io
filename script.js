const photoImg = document.querySelector('.hero-photo-circle img');
if (photoImg) {
  photoImg.addEventListener('error', () => {
    document.getElementById('photo-fallback').style.display = 'block';
  });
}

const navLinks = document.getElementById('nav-links');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('is-active');
    navLinks.classList.toggle('mobile-open');
  });
}

window.addEventListener('scroll', () => {
  navLinks.classList.toggle('hidden', window.scrollY > 60);
  
  // Close the mobile menu automatically upon scrolling
  if (mobileMenuBtn && mobileMenuBtn.classList.contains('is-active')) {
    mobileMenuBtn.classList.remove('is-active');
    navLinks.classList.remove('mobile-open');
  }
}, { passive: true });

// ══════════════════════════════
// THEME TOGGLE
// ══════════════════════════════
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.body.classList.add('dark-mode');
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// ══════════════════════════════
// SKELETON LOADER
// ══════════════════════════════
window.addEventListener('load', () => {
  const skeleton = document.getElementById('page-skeleton');
  if (skeleton) {
    setTimeout(() => skeleton.classList.add('loaded'), 400);
  }
});

const canvas = document.getElementById('airplane-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
}
resizeCanvas();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { resizeCanvas(); spline = buildSpline(); }, 200);
});

function buildControlPoints() {
  const W = canvas.width;
  const H = canvas.height;
  return [
    // Hero — top right, sweeps left
    { x: 0.82*W, y: 0.03*H },
    { x: 0.60*W, y: 0.06*H },
    { x: 0.35*W, y: 0.10*H },
    { x: 0.18*W, y: 0.14*H },
    // First big arc — dips down-right
    { x: 0.12*W, y: 0.20*H },
    { x: 0.25*W, y: 0.26*H },
    { x: 0.52*W, y: 0.28*H },
    { x: 0.74*W, y: 0.24*H },
    // Loop back left
    { x: 0.82*W, y: 0.33*H },
    { x: 0.70*W, y: 0.40*H },
    { x: 0.45*W, y: 0.42*H },
    { x: 0.22*W, y: 0.48*H },
    // Second sweep down
    { x: 0.14*W, y: 0.55*H },
    { x: 0.28*W, y: 0.61*H },
    { x: 0.56*W, y: 0.64*H },
    { x: 0.76*W, y: 0.70*H },
    // Final descent — glide down-left toward bottom
    { x: 0.72*W, y: 0.78*H },
    { x: 0.50*W, y: 0.83*H },
    { x: 0.30*W, y: 0.88*H },
    { x: 0.16*W, y: 0.93*H },
    { x: 0.32*W, y: 0.97*H },
  ];
}

function catmullRom(pts, segs = 60) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i-1, 0)];
    const p1 = pts[i];
    const p2 = pts[i+1];
    const p3 = pts[Math.min(i+2, pts.length-1)];
    for (let s = 0; s <= segs; s++) {
      const t = s/segs, t2 = t*t, t3 = t2*t;
      out.push({
        x: 0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
        y: 0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
      });
    }
  }
  return out;
}

function buildSpline() { return catmullRom(buildControlPoints()); }
let spline = buildSpline();

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(window.scrollY / max, 1) : 0;
}

function drawTrail(idx) {
  if (idx < 2) return;
  const TRAIL = 150;
  const start = Math.max(0, idx - TRAIL);
  ctx.save();
  ctx.setLineDash([5, 8]);
  ctx.lineWidth = 1.8;
  const isDark = document.body.classList.contains('dark-mode');
  for (let i = start; i < idx; i++) {
    const a = 0.05 + 0.55 * ((i - start) / Math.max(1, idx - start));
    ctx.beginPath();
    ctx.moveTo(spline[i].x, spline[i].y);
    ctx.lineTo(spline[i+1].x, spline[i+1].y);
    ctx.strokeStyle = isDark ? `rgba(200,200,200,${a})` : `rgba(70,70,70,${a})`;
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawPlane(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(0.9, 0.9);
  const isDark = document.body.classList.contains('dark-mode');
  // Wings
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.lineTo(-14, -11);
  ctx.lineTo(-7,  0);
  ctx.lineTo(-14, 11);
  ctx.closePath();
  ctx.fillStyle = isDark ? '#f8f9fa' : '#1a1a1a';
  ctx.fill();
  // Centre crease
  ctx.beginPath();
  ctx.moveTo(26, 0); ctx.lineTo(-7, 0);
  ctx.strokeStyle = isDark ? '#121212' : '#f5f2ed';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Tail lines
  ctx.beginPath();
  ctx.moveTo(-7,  0); ctx.lineTo(-17, -4);
  ctx.moveTo(-7,  0); ctx.lineTo(-17,  4);
  ctx.strokeStyle = isDark ? 'rgba(248,249,250,0.4)' : 'rgba(26,26,26,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// Render every frame; progress is driven by scroll
(function renderLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const p   = scrollProgress();
  const idx = Math.min(Math.floor(p * (spline.length - 1)), spline.length - 1);
  const pt  = spline[idx];
  let angle = 0;
  if (idx < spline.length - 1) {
    angle = Math.atan2(spline[idx+1].y - pt.y, spline[idx+1].x - pt.x);
  }
  drawTrail(idx);
  drawPlane(pt.x, pt.y, angle);
  requestAnimationFrame(renderLoop);
})();

// ══════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════
const revEls = document.querySelectorAll('.reveal');
new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.12 }).observe && (() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });
  revEls.forEach(el => obs.observe(el));
})();

// ══════════════════════════════
// COUNTER ANIMATION
// ══════════════════════════════
new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(el => {
        const target = +el.dataset.count;
        let cur = 0;
        const step = Math.ceil(target / 60);
        const iv = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = cur;
          if (cur >= target) clearInterval(iv);
        }, 20);
      });
    }
  });
}, { threshold: 0.5 }).observe(document.querySelector('.stats-grid'));

// ══════════════════════════════
// PORTFOLIO CARD 3D TILT
// ══════════════════════════════
document.querySelectorAll('.portfolio-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
    const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
    card.style.transform = `translate(-5px,-5px) perspective(600px) rotateY(${dx*7}deg) rotateX(${-dy*7}deg) rotate(-0.5deg)`;
    card.style.boxShadow = 'var(--shadow-lg)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});