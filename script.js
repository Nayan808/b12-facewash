/* ═══════════════════════════════════════════════
   B12 FACE WASH — INTERACTIONS & ANIMATIONS
═══════════════════════════════════════════════ */

/* ── Mobile Menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeMenu() : openMenu();
});

// Close on any mobile menu link click
document.querySelectorAll('.mobile-menu__links a, .mobile-menu__cta').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on backdrop tap (outside inner panel)
mobileMenu.addEventListener('click', (e) => {
  if (e.target === mobileMenu) closeMenu();
});

/* ── Theme Toggle ── */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('b12-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('b12-theme', next);
});

/* ── Navbar Scroll Effect ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── Intersection Observer: Reveal animations ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-card, .reveal-panel').forEach(el => {
  revealObserver.observe(el);
});

/* ── Animated Counter ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat__num').forEach(el => counterObserver.observe(el));

/* ── Ingredient Bars ── */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const width = entry.target.dataset.width;
      entry.target.style.width = width + '%';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.ingredient-fill').forEach(el => barObserver.observe(el));

/* ── Scroll Story: Sticky Product Position Morphing ── */
const scrollStory = document.getElementById('scrollStory');
const storyProduct = document.getElementById('storyProduct');
const storyPanels = document.querySelectorAll('.story-panel');

function lerp(a, b, t) { return a + (b - a) * t; }

const productPositions = [
  { x: 0,   y: 0,   rotate: -5,  scale: 1.05 },   // Panel 1: left text → product center-right
  { x: 60,  y: -30, rotate: 8,   scale: 0.95 },   // Panel 2: right text → product center-left
  { x: 0,   y: 20,  rotate: 0,   scale: 1.1  },   // Panel 3: center  → product big center
];

let targetPos = { ...productPositions[0] };
let currentPos = { x: 0, y: 0, rotate: 0, scale: 1 };
let animFrame;

function updateProductTransform() {
  currentPos.x      = lerp(currentPos.x,      targetPos.x,      0.08);
  currentPos.y      = lerp(currentPos.y,      targetPos.y,      0.08);
  currentPos.rotate = lerp(currentPos.rotate, targetPos.rotate, 0.08);
  currentPos.scale  = lerp(currentPos.scale,  targetPos.scale,  0.08);

  if (storyProduct) {
    storyProduct.style.transform = `
      translate(${currentPos.x}px, ${currentPos.y}px)
      rotate(${currentPos.rotate}deg)
      scale(${currentPos.scale})
    `;
  }

  animFrame = requestAnimationFrame(updateProductTransform);
}

updateProductTransform();

/* ── Determine which story panel is most visible ── */
function getActivePanelIndex() {
  let activeIdx = 0;
  let maxRatio = 0;

  storyPanels.forEach((panel, i) => {
    const rect = panel.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    const ratio = visible / vh;

    if (ratio > maxRatio) {
      maxRatio = ratio;
      activeIdx = i;
    }
  });

  return activeIdx;
}

/* ── Glow color cycling ── */
const glowEl = document.querySelector('.story-product__glow');
const glowColors = [
  'radial-gradient(circle, rgba(168,230,207,0.35) 0%, transparent 70%)',
  'radial-gradient(circle, rgba(100,200,160,0.3) 0%, transparent 70%)',
  'radial-gradient(circle, rgba(168,230,207,0.5) 0%, transparent 65%)',
];

let lastPanelIdx = -1;

function onScroll() {
  // Only run if scroll-story is in view
  if (!scrollStory) return;
  const storyRect = scrollStory.getBoundingClientRect();
  if (storyRect.bottom < 0 || storyRect.top > window.innerHeight) return;

  const idx = getActivePanelIndex();
  if (idx !== lastPanelIdx) {
    lastPanelIdx = idx;
    targetPos = { ...productPositions[idx] };
    if (glowEl && glowColors[idx]) {
      glowEl.style.background = glowColors[idx];
    }

    // Highlight active panel
    storyPanels.forEach((p, i) => {
      p.classList.toggle('active', i === idx);
    });
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ── Hero Product Parallax ── */
const heroProduct = document.getElementById('heroProduct');

window.addEventListener('scroll', () => {
  if (!heroProduct) return;
  const scrolled = window.scrollY;
  const speed = 0.3;
  heroProduct.style.transform = `translateY(${scrolled * speed}px)`;
}, { passive: true });

/* ── Mouse-follow tilt on hero product (desktop only) ── */
const hero = document.getElementById('hero');
if (hero && heroProduct && !isTouchDevice) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    heroProduct.style.transform = `
      translateY(${window.scrollY * 0.3}px)
      perspective(800px)
      rotateY(${dx * 8}deg)
      rotateX(${-dy * 5}deg)
    `;
  });

  hero.addEventListener('mouseleave', () => {
    heroProduct.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  });
}

/* ── Cursor Glow Orb (desktop only) ── */
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouchDevice) {
  const cursorOrb = document.createElement('div');
  cursorOrb.style.cssText = `
    position: fixed;
    pointer-events: none;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168,230,207,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 0;
    transition: opacity 0.3s;
    will-change: transform;
  `;
  document.body.appendChild(cursorOrb);

  let mouseX = 0, mouseY = 0;
  let orbX = 0, orbY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateOrb() {
    orbX = lerp(orbX, mouseX, 0.1);
    orbY = lerp(orbY, mouseY, 0.1);
    cursorOrb.style.left = orbX + 'px';
    cursorOrb.style.top  = orbY + 'px';
    requestAnimationFrame(animateOrb);
  }
  animateOrb();
}

/* ── Buy Button ── */
const buyBtn = document.getElementById('buyBtn');
const cartToast = document.getElementById('cartToast');

if (buyBtn && cartToast) {
  buyBtn.addEventListener('click', () => {
    buyBtn.textContent = 'Added! ✓';
    buyBtn.style.background = '#6fcfad';

    cartToast.classList.add('show');

    setTimeout(() => {
      cartToast.classList.remove('show');
      buyBtn.textContent = 'Add to Cart';
      buyBtn.style.background = '';
    }, 3000);
  });
}

/* ── Newsletter Form ── */
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn = e.target.querySelector('button');
  if (input.value) {
    btn.textContent = '✓';
    btn.style.background = '#6fcfad';
    input.value = '';
    setTimeout(() => {
      btn.textContent = '→';
      btn.style.background = '';
    }, 2500);
  }
});

/* ── Smooth Active Nav Link Highlighting ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--accent)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ── Particle burst on buy btn ── */
function createParticle(x, y) {
  const p = document.createElement('div');
  const angle = Math.random() * Math.PI * 2;
  const distance = 60 + Math.random() * 60;
  const size = 4 + Math.random() * 4;

  p.style.cssText = `
    position: fixed;
    left: ${x}px; top: ${y}px;
    width: ${size}px; height: ${size}px;
    background: var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.8s ease-out, opacity 0.8s ease-out;
    will-change: transform, opacity;
  `;

  document.body.appendChild(p);

  requestAnimationFrame(() => {
    p.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
    p.style.opacity = '0';
  });

  setTimeout(() => p.remove(), 900);
}

buyBtn?.addEventListener('click', (e) => {
  const rect = buyBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 16; i++) createParticle(cx, cy);
});

/* ── Page Entry Animation ── */
window.addEventListener('load', () => {
  // Stagger the hero elements
  const heroEls = document.querySelectorAll('.hero .reveal');
  heroEls.forEach((el, i) => {
    el.style.transitionDelay = `${0.2 + i * 0.1}s`;
    el.classList.add('visible');
  });

  setTimeout(() => {
    document.querySelectorAll('.floating-badge').forEach(b => {
      b.style.opacity = '1';
    });
  }, 600);
});
