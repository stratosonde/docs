// Simple theme toggle implementation
(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  
  // Get theme from localStorage or system preference
  function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // Apply theme to document
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    
    // Update button
    const button = document.querySelector('.theme-toggle');
    if (button) {
      if (theme === 'dark') {
        button.textContent = '☀️';
        button.setAttribute('aria-label', 'Switch to light mode');
      } else {
        button.textContent = '🌙';
        button.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }
  
  // Toggle theme
  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }
  
  // Initialize on page load
  function init() {
    const theme = getTheme();
    setTheme(theme);
    
    // Add click handler to button
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.addEventListener('click', toggleTheme);
    }
  }
  
  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
