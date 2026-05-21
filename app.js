// ---------- Demo password gate ----------
// Note: client-side password is obfuscation, not real security.
// Default access code: irx2026 — change PASS_HASH below to rotate.
// To generate a new hash: printf '%s' 'yourcode' | shasum -a 256
const PASS_HASH = '0f77bbbb3b3499d03da1447a61b27b18a31279f251e563247c45467936923f58';
const STORAGE_KEY = 'irx-demo-unlocked-v1';

async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const gate = document.getElementById('gate');
const banner = document.getElementById('demo-banner');
const gateForm = document.getElementById('gate-form');
const gateInput = document.getElementById('gate-input');
const gateError = document.getElementById('gate-error');

function unlock() {
  gate.classList.add('hidden');
  banner.hidden = false;
  document.body.style.overflow = '';
}

function lockedInit() {
  document.body.style.overflow = 'hidden';
  setTimeout(() => gateInput && gateInput.focus(), 100);
}

if (sessionStorage.getItem(STORAGE_KEY) === '1') {
  unlock();
} else {
  lockedInit();
}

if (gateForm) {
  gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = gateInput.value.trim();
    if (!value) return;
    const hash = await sha256(value);
    if (hash === PASS_HASH) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      unlock();
    } else {
      gateError.textContent = 'Incorrect access code. Please try again.';
      gateError.classList.remove('shake');
      void gateError.offsetWidth;
      gateError.classList.add('shake');
      gateInput.value = '';
      gateInput.focus();
    }
  });
}

// Reveal-on-scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll('.section, .card, .feat, .adopt, .hero-panel, .panel-row, .win-points > div, .check-list li').forEach((el) => {
  el.classList.add('reveal');
  io.observe(el);
});

// Subtle parallax for orbs on mouse
const orbs = document.querySelectorAll('.orb');
let raf = null;
window.addEventListener('mousemove', (e) => {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    orbs.forEach((o, i) => {
      const k = i === 0 ? 1 : -1;
      o.style.transform = `translate3d(${x * k}px, ${y * k}px, 0)`;
    });
    raf = null;
  });
});
