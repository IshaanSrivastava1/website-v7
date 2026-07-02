const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

if (tabButtons.length) {
  function activateTab(btn, { focus = true, updateHash = false } = {}) {
    tabButtons.forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
      b.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== btn.dataset.tab;
    });
    if (focus) btn.focus();
    if (updateHash) {
      history.pushState(null, '', `#${btn.dataset.tab}`);
    }
  }

  function tabForHash() {
    const id = location.hash.slice(1);
    return document.querySelector(`.tab-btn[data-tab="${id}"]`);
  }

  activateTab(tabForHash() || document.querySelector('.tab-btn.active'), { focus: false });

  window.addEventListener('popstate', () => {
    const btn = tabForHash() || document.querySelector('.tab-btn[data-tab="about"]');
    activateTab(btn, { focus: false });
  });

  tabButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => activateTab(btn, { focus: false, updateHash: true }));

    btn.addEventListener('keydown', (e) => {
      const lastIndex = tabButtons.length - 1;
      let newIndex;
      switch (e.key) {
        case 'ArrowRight':
          newIndex = index === lastIndex ? 0 : index + 1;
          break;
        case 'ArrowLeft':
          newIndex = index === 0 ? lastIndex : index - 1;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = lastIndex;
          break;
        default:
          return;
      }
      e.preventDefault();
      activateTab(tabButtons[newIndex], { updateHash: true });
    });
  });
}

// --- Print / save as PDF ---
document.getElementById('print-button').addEventListener('click', () => {
  window.print();
});

// --- Dark mode toggle ---
const themeToggle = document.getElementById('theme-toggle');
const iconMoon = themeToggle.querySelector('.icon-moon');
const iconSun = themeToggle.querySelector('.icon-sun');
const THEME_KEY = 'theme';

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  // SVG elements don't reflect the `.hidden` property to the attribute like
  // HTML elements do, so toggle the attribute directly.
  iconMoon.toggleAttribute('hidden', isDark);
  iconSun.toggleAttribute('hidden', !isDark);
  const nextLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', nextLabel);
  themeToggle.setAttribute('title', nextLabel);
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// --- Copy email to clipboard ---
const copyEmailBtn = document.querySelector('.copy-email-btn');
const copyIcon = copyEmailBtn.querySelector('.icon-copy');
const checkIcon = copyEmailBtn.querySelector('.icon-check');
const copyFeedback = document.querySelector('.copy-feedback');
let copyFeedbackTimeout;

copyEmailBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyEmailBtn.dataset.email);
  } catch {
    return;
  }
  copyIcon.toggleAttribute('hidden', true);
  checkIcon.toggleAttribute('hidden', false);
  copyEmailBtn.setAttribute('aria-label', 'Copied!');
  copyEmailBtn.setAttribute('title', 'Copied!');
  copyFeedback.textContent = 'Copied!';
  copyFeedback.classList.add('visible');

  clearTimeout(copyFeedbackTimeout);
  copyFeedbackTimeout = setTimeout(() => {
    copyIcon.toggleAttribute('hidden', false);
    checkIcon.toggleAttribute('hidden', true);
    copyEmailBtn.setAttribute('aria-label', 'Copy email address');
    copyEmailBtn.setAttribute('title', 'Copy email address');
    copyFeedback.classList.remove('visible');
    copyFeedback.textContent = '';
  }, 1500);
});

// --- Back to top ---
const backToTopBtn = document.getElementById('back-to-top');
const BACK_TO_TOP_THRESHOLD = 400;
let scrollTicking = false;

function updateBackToTopVisibility() {
  backToTopBtn.classList.toggle('visible', window.scrollY > BACK_TO_TOP_THRESHOLD);
  scrollTicking = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateBackToTopVisibility);
      scrollTicking = true;
    }
  },
  { passive: true }
);

backToTopBtn.addEventListener('click', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

updateBackToTopVisibility();
