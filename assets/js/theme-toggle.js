// Theme Toggle Implementation
// Supports system preference detection and manual override with localStorage persistence

(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  const THEME_ATTR = 'data-theme';
  
  // Get stored theme preference or detect system preference
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    
    // Detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }
  
  // Apply theme to document
  function applyTheme(theme) {
    document.body.setAttribute(THEME_ATTR, theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButton(theme);
  }
  
  // Update toggle button icon
  function updateToggleButton(theme) {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    
    if (theme === 'dark') {
      button.innerHTML = '☀️';
      button.setAttribute('aria-label', 'Switch to light mode');
      button.setAttribute('title', 'Switch to light mode');
    } else {
      button.innerHTML = '🌙';
      button.setAttribute('aria-label', 'Switch to dark mode');
      button.setAttribute('title', 'Switch to dark mode');
    }
  }
  
  // Toggle between themes
  function toggleTheme() {
    const currentTheme = document.body.getAttribute(THEME_ATTR) || getPreferredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }
  
  // Initialize theme on page load
  function initTheme() {
    const theme = getPreferredTheme();
    applyTheme(theme);
  }
  
  // Listen for system theme changes
  function watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Only react to system changes if user hasn't set a manual preference
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  // Setup event listeners
  function setupToggleButton() {
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.addEventListener('click', toggleTheme);
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTheme();
      setupToggleButton();
      watchSystemTheme();
    });
  } else {
    initTheme();
    setupToggleButton();
    watchSystemTheme();
  }
  
  // Expose toggle function globally for manual use if needed
  window.toggleTheme = toggleTheme;
})();
