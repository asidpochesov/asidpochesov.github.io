const progressBar = document.getElementById('scrollProgress');
const root = document.documentElement;

const updateScrollProgress = () => {
  if (!progressBar) return;
  const max = root.scrollHeight - root.clientHeight;
  const scrolled = max > 0 ? root.scrollTop / max : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, scrolled * 100))}%`;
};

document.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('.card, .project-card, .contact-card').forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// ===== Theme =====
const THEME_KEY = 'am-site-theme';
const themeButtons = document.querySelectorAll('.theme-toggle');

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.textContent = theme === 'light' ? '☀' : '◐';
    button.setAttribute('aria-label', theme === 'light' ? 'Включить темную тему' : 'Включить светлую тему');
  });
};

applyTheme(localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark');

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';

    // Overlay: fade to new bg color → switch theme → fade out
    const overlay = document.createElement('div');
    const bg = nextTheme === 'light' ? '#f4faf6' : '#07090a';
    overlay.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;background:${bg};opacity:0;transition:opacity 0.18s ease`;
    document.body.appendChild(overlay);

    overlay.getBoundingClientRect(); // force reflow
    overlay.style.opacity = '0.98';

    setTimeout(() => {
      localStorage.setItem(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
      overlay.style.opacity = '0';
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }, 195);
  });
});

// ===== Avatar modal =====
const avatarModal = document.getElementById('avatarModal');
const avatarModalImage = document.getElementById('avatarModalImage');
const avatarModalTitle = document.getElementById('avatarModalTitle');

if (avatarModal && avatarModalImage && avatarModalTitle) {
  const closeAvatarModal = () => {
    avatarModal.classList.remove('is-open');
    avatarModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  document.querySelectorAll('[data-avatar-open]').forEach((button) => {
    button.addEventListener('click', () => {
      avatarModalImage.src = button.dataset.avatarSrc || '';
      avatarModalImage.alt = button.dataset.avatarName || '';
      avatarModalTitle.textContent = button.dataset.avatarName || '';
      avatarModal.classList.add('is-open');
      avatarModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });

  avatarModal.querySelectorAll('[data-avatar-close]').forEach((element) => {
    element.addEventListener('click', closeAvatarModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && avatarModal.classList.contains('is-open')) {
      closeAvatarModal();
    }
  });
}

// ===== Hamburger menu =====
const menuToggle = document.querySelector('.menu-toggle');
const headerEl = document.querySelector('header');

if (menuToggle && headerEl) {
  const setMenuOpen = (open) => {
    headerEl.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(!headerEl.classList.contains('menu-open'));
  });

  document.querySelectorAll('.menu a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && headerEl.classList.contains('menu-open')) setMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenuOpen(false);
  });
}

// ===== Glitch effect on hero h1 =====
const heroH1 = document.querySelector('.hero h1');
if (heroH1) {
  const triggerGlitch = () => {
    heroH1.classList.add('is-glitching');
    setTimeout(() => heroH1.classList.remove('is-glitching'), 550);
    setTimeout(triggerGlitch, 3500 + Math.random() * 5000);
  };
  setTimeout(triggerGlitch, 2000);
}

// ===== Typing effect on hero code =====
async function typeCode(element, html, speed) {
  const temp = document.createElement('code');
  temp.innerHTML = html;

  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '█';
  element.appendChild(cursor);

  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  const typeText = async (text, before) => {
    for (const ch of text) {
      before.parentNode.insertBefore(document.createTextNode(ch), before);
      await pause(ch === '\n' ? speed * 4 : speed);
    }
  };

  for (const node of Array.from(temp.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      await typeText(node.textContent, cursor);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = document.createElement(node.tagName.toLowerCase());
      for (const { name, value } of node.attributes) el.setAttribute(name, value);
      cursor.parentNode.insertBefore(el, cursor);
      el.appendChild(cursor);
      await typeText(node.textContent, cursor);
      el.parentNode.insertBefore(cursor, el.nextSibling);
    }
  }

  cursor.remove();
}

const heroCode = document.querySelector('.hero-code code');
if (heroCode) {
  const savedHTML = heroCode.innerHTML;
  heroCode.innerHTML = '';
  setTimeout(() => typeCode(heroCode, savedHTML, 22), 800);
}
