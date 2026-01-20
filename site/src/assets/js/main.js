/*
 * Lightweight client-side enhancements.
 *
 * - Mobile nav toggle.
 * - Copies a deep-link when a heading permalink is clicked.
 * - Copies a code snippet when a copy button is pressed.
 */

(function () {
  function copyToClipboard(text) {
    if (!text) {
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      // Ignore.
    }
    document.body.removeChild(textarea);
  }

  function setupNav() {
    const header = document.querySelector('[data-header]');
    if (!header) {
      return;
    }

    const toggle = header.querySelector('[data-nav-toggle]');
    const nav = header.querySelector('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    function closeNav() {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openNav() {
      header.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (!header.classList.contains('is-open')) {
        return;
      }

      if (target.closest('[data-header]')) {
        return;
      }

      closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (!header.classList.contains('is-open')) {
        return;
      }

      closeNav();
    });

    nav.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const link = target.closest('a');
      if (!link) {
        return;
      }

      closeNav();
    });
  }

  function setupHeadingPermalinks() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const link = target.closest('a.heading-anchor');
      if (!link) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        return;
      }

      const url = `${window.location.origin}${window.location.pathname}${href}`;
      copyToClipboard(url);
    });
  }

  function setupCopyButtons() {
    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest('[data-copy-text]');
      if (!button) {
        return;
      }

      const text = button.getAttribute('data-copy-text');
      copyToClipboard(text);

      const label = button.getAttribute('data-copy-label');
      if (label) {
        button.textContent = label;
        window.setTimeout(() => {
          button.textContent = 'Copy';
        }, 1200);
      }
    });
  }

  setupNav();
  setupHeadingPermalinks();
  setupCopyButtons();
})();
