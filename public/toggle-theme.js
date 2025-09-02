/**
 * Comprehensive Theme System
 * Based on Astro Paper's approach with enhanced features
 */

const THEME_KEY = "theme";
const THEME_ATTRIBUTE = "data-theme";
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system"
};

const primaryColorScheme = ""; // "light" | "dark" | "system"

// Enhanced theme storage with validation
class ThemeStorage {
  static get() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return Object.values(THEMES).includes(stored) ? stored : null;
    } catch (e) {
      console.warn("Failed to read theme from localStorage:", e);
      return null;
    }
  }

  static set(theme) {
    try {
      if (Object.values(THEMES).includes(theme)) {
        localStorage.setItem(THEME_KEY, theme);
      }
    } catch (e) {
      console.warn("Failed to save theme to localStorage:", e);
    }
  }

  static remove() {
    try {
      localStorage.removeItem(THEME_KEY);
    } catch (e) {
      console.warn("Failed to remove theme from localStorage:", e);
    }
  }
}

// Enhanced system preference detection
class SystemTheme {
  static getPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  }

  static addListener(callback) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Use addEventListener (modern approach, supported in all modern browsers)
    mediaQuery.addEventListener("change", callback);
    
    return mediaQuery;
  }
}

// Get effective theme preference
function getPreferredTheme() {
  // 1. Check localStorage
  const stored = ThemeStorage.get();
  if (stored) return stored;

  // 2. Check primary color scheme config
  if (primaryColorScheme && Object.values(THEMES).includes(primaryColorScheme)) {
    return primaryColorScheme;
  }

  // 3. Default to system preference
  return THEMES.SYSTEM;
}

// Resolve actual theme for display (system -> light/dark)
function resolveTheme(theme) {
  return theme === THEMES.SYSTEM ? SystemTheme.getPreference() : theme;
}

let currentTheme = getPreferredTheme();

// Enhanced preference setting with validation
function setPreference(newTheme) {
  if (!Object.values(THEMES).includes(newTheme)) {
    console.warn("Invalid theme:", newTheme);
    return;
  }

  currentTheme = newTheme;
  ThemeStorage.set(currentTheme);
  reflectPreference();
  dispatchThemeChangeEvent();
}

// Enhanced reflection with better error handling and accessibility
function reflectPreference() {
  const resolvedTheme = resolveTheme(currentTheme);
  const documentElement = document.documentElement;
  
  if (!documentElement) return;

  // Set theme attribute with validation
  documentElement.setAttribute(THEME_ATTRIBUTE, resolvedTheme);

  // Update theme button accessibility
  updateThemeButtonAccessibility(resolvedTheme);

  // Update meta theme-color
  updateMetaThemeColor();

  // Add transition class for smooth theme changes
  documentElement.classList.add("theme-transition");
  
  // Remove transition class after animation completes
  setTimeout(() => {
    documentElement.classList.remove("theme-transition");
  }, 300);
}

// Enhanced theme button accessibility
function updateThemeButtonAccessibility(resolvedTheme) {
  const themeBtn = document.querySelector("#theme-btn");
  if (!themeBtn) return;

  const labels = {
    [THEMES.LIGHT]: "Switch to dark theme",
    [THEMES.DARK]: "Switch to light theme"
  };

  themeBtn.setAttribute("aria-label", labels[resolvedTheme] || "Toggle theme");
  themeBtn.setAttribute("title", labels[resolvedTheme] || "Toggle theme");
}

// Enhanced meta theme-color update
function updateMetaThemeColor() {
  // Wait for next frame to ensure styles are applied
  requestAnimationFrame(() => {
    const body = document.body;
    if (!body) return;

    try {
      const computedStyles = window.getComputedStyle(body);
      const bgColor = computedStyles.backgroundColor;
      
      const metaThemeColor = document.querySelector("meta[name='theme-color']");
      if (metaThemeColor && bgColor) {
        metaThemeColor.setAttribute("content", bgColor);
      }
    } catch (e) {
      console.warn("Failed to update meta theme-color:", e);
    }
  });
}

// Custom theme change event for better coordination
function dispatchThemeChangeEvent() {
  const event = new CustomEvent("themechange", {
    detail: {
      theme: currentTheme,
      resolvedTheme: resolveTheme(currentTheme)
    }
  });
  
  document.dispatchEvent(event);
}

// Theme cycling for better UX
function cycleTheme() {
  const themeOrder = [THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM];
  const currentIndex = themeOrder.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themeOrder.length;
  
  setPreference(themeOrder[nextIndex]);
}

// Initialize theme immediately to prevent flash
reflectPreference();

// Enhanced initialization
function initializeThemeSystem() {
  // Ensure preference is reflected on load
  reflectPreference();

  // Setup theme button click handler
  const themeBtn = document.querySelector("#theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", cycleTheme);
    
    // Add keyboard support
    themeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        cycleTheme();
      }
    });
  }
}

// Enhanced system theme listener with cleanup
let systemThemeMediaQuery = null;
let systemThemeCallback = null;

function setupSystemThemeListener() {
  systemThemeCallback = () => {
    // Only update if current theme is system
    if (currentTheme === THEMES.SYSTEM) {
      reflectPreference();
      dispatchThemeChangeEvent();
    }
  };
  
  systemThemeMediaQuery = SystemTheme.addListener(systemThemeCallback);
}

// Enhanced page transition handling
function setupPageTransitions() {
  // Preserve theme-color during transitions
  document.addEventListener("astro:before-swap", (event) => {
    const currentMetaThemeColor = document.querySelector("meta[name='theme-color']");
    const newMetaThemeColor = event.newDocument.querySelector("meta[name='theme-color']");
    
    if (currentMetaThemeColor && newMetaThemeColor) {
      const bgColor = currentMetaThemeColor.getAttribute("content");
      if (bgColor) {
        newMetaThemeColor.setAttribute("content", bgColor);
      }
    }
  });

  // Re-initialize after page swap
  document.addEventListener("astro:after-swap", initializeThemeSystem);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeThemeSystem();
    setupSystemThemeListener();
    setupPageTransitions();
  });
} else {
  initializeThemeSystem();
  setupSystemThemeListener();
  setupPageTransitions();
}

// Cleanup function for event listeners
function cleanup() {
  if (systemThemeMediaQuery && systemThemeCallback) {
    systemThemeMediaQuery.removeEventListener("change", systemThemeCallback);
  }
}

// Add cleanup on page unload
window.addEventListener("beforeunload", cleanup);
window.addEventListener("pagehide", cleanup);

// Global API for external theme control
window.themeSystem = {
  get current() { return currentTheme; },
  get resolved() { return resolveTheme(currentTheme); },
  set: setPreference,
  cycle: cycleTheme,
  isSystem: () => currentTheme === THEMES.SYSTEM,
  themes: THEMES,
  cleanup: cleanup
};
