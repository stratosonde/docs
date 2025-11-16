// Theme toggle with debugging
console.log('Theme toggle script loaded');

(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  
  function getTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log('Theme from storage:', stored);
      return stored;
    }
    
    const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    console.log('System prefers:', systemPrefers);
    return systemPrefers;
  }
  
  function setTheme(theme) {
    console.log('Setting theme to:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.textContent = theme === 'dark' ? '☀️' : '🌙';
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      console.log('Button updated');
    } else {
      console.warn('Toggle button not found');
    }
  }
  
  function toggleTheme(e) {
    e.preventDefault();
    console.log('Toggle clicked');
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }
  
  function init() {
    console.log('Initializing theme toggle');
    const theme = getTheme();
    setTheme(theme);
    
    const button = document.querySelector('.theme-toggle');
    if (button) {
      console.log('Found button, adding click handler');
      button.addEventListener('click', toggleTheme);
    } else {
      console.error('Button .theme-toggle not found in DOM');
    }
  }
  
  // Wait a bit to ensure DOM is fully ready
  setTimeout(init, 100);
})();
