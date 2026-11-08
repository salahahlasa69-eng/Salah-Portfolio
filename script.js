document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const themeToggle = document.getElementById('themeToggle');
  const backTop = document.getElementById('backTop');
  const typed = document.querySelector('.typed');
  const avatarWrap = document.getElementById('avatarWrap');

  // Theme toggle
  themeToggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (_) {}
  });

  // Mobile navigation
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const icon = menuToggle?.querySelector('i');
    if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  };

  menuToggle?.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 820 && nav?.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) setMenu(false);
  });

  // Header + back-to-top state
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 22);
    backTop.classList.toggle('visible', y > 550);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  // Active section in navigation
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const sectionSpy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(section => sectionSpy.observe(section));

  // Typing effect
  if (typed && !reduceMotion) {
    let words = [];
    try { words = JSON.parse(typed.dataset.words); } catch (_) { words = ['Frontend Developer']; }
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;
    const type = () => {
      const word = words[wordIndex];
      if (deleting) {
        charIndex--;
        typed.textContent = word.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(type, 500);
          return;
        }
      } else {
        const nextWord = words[wordIndex];
        charIndex++;
        typed.textContent = nextWord.slice(0, charIndex);
        if (charIndex >= nextWord.length) {
          deleting = true;
          setTimeout(type, 1400);
          return;
        }
      }
      setTimeout(type, deleting ? 45 : 75);
    };
    setTimeout(type, 1500);
  }

  // Scroll reveal
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }

  // Skill bar animation
  const skillBars = document.querySelectorAll('.skill-fill');
  if ('IntersectionObserver' in window && skillBars.length) {
    const skillObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const level = entry.target.dataset.level;
        entry.target.style.width = `${level}%`;
        observer.unobserve(entry.target);
      });
    }, { threshold: .35 });
    skillBars.forEach(bar => skillObserver.observe(bar));
  } else {
    skillBars.forEach(bar => bar.style.width = `${bar.dataset.level}%`);
  }

  // Project filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const emptyState = document.getElementById('projectsEmpty');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
      let shown = 0;
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
        if (show) shown++;
      });
      if (emptyState) emptyState.hidden = shown !== 0;
    });
  });

  // Avatar pointer tilt — disabled for touch devices
  if (avatarWrap && window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    const avatar = avatarWrap.querySelector('.avatar');
    avatarWrap.addEventListener('pointermove', (e) => {
      const rect = avatarWrap.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      avatar.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
    });
    avatarWrap.addEventListener('pointerleave', () => { avatar.style.transform = ''; });
  }

  // Contact feedback — FormSubmit remains the actual submit destination.
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (message, error = false) => {
    toast.textContent = message;
    toast.classList.toggle('error', error);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
  };

  form?.addEventListener('submit', (e) => {
    const honeypot = form.querySelector('[name="_honey"]');
    if (honeypot?.value) {
      e.preventDefault();
      form.reset();
      return;
    }

    const endpoint = form.getAttribute('action') || '';
    if (endpoint.includes('your-salahahlasa69@gmail.com')) {
      e.preventDefault();
      showToast('Replace your-salahahlasa69@gmail.com in the HTML before publishing.', true);
      return;
    }

    const submit = form.querySelector('.submit-btn');
    if (submit) {
      submit.disabled = true;
      submit.innerHTML = 'Sending… <i class="fa-solid fa-spinner fa-spin"></i>';
    }
    showToast('Sending your message…');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
});
