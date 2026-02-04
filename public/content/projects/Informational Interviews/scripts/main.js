/**
 * Main JavaScript - Informational Interviews Meta-Essay Site
 * Author: Graham Wahlberg
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle for main navigation
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.querySelector('.main-nav').classList.toggle('active');
      
      // Toggle menu icon (animated hamburger)
      const spans = this.querySelectorAll('span');
      if (document.querySelector('.main-nav').classList.contains('active')) {
        spans[0].style.transform = 'translateY(11px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-11px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }
  
  // Progress tracking across modules
  initializeProgress();
  
  // Link highlighting based on current page
  highlightCurrentPage();
});

/**
 * Initialize progress tracking
 */
function initializeProgress() {
  // Check if we're on a module page
  const moduleContent = document.querySelector('.module-content');
  if (!moduleContent) return;
  
  // Load progress from localStorage
  const savedProgress = localStorage.getItem('informational_interviews_progress');
  let progress = savedProgress ? JSON.parse(savedProgress) : {
    completedModules: [],
    currentModule: getCurrentModuleId(),
    overallProgress: 0
  };
  
  // If this is a new module, update the current module
  if (progress.currentModule !== getCurrentModuleId()) {
    progress.currentModule = getCurrentModuleId();
    saveProgress(progress);
  }
  
  // Update progress display
  updateProgressDisplay(progress);
  
  // Setup complete button if it exists
  const completeButton = document.getElementById('complete-button');
  if (completeButton) {
    // Check if already completed
    if (progress.completedModules.includes(getCurrentModuleId())) {
      completeButton.textContent = 'Completed!';
      completeButton.classList.add('completed');
      completeButton.disabled = true;
    }
    
    completeButton.addEventListener('click', function() {
      markModuleComplete(getCurrentModuleId());
    });
  }
}

/**
 * Get the current module ID from the URL
 */
function getCurrentModuleId() {
  const path = window.location.pathname;
  const matches = path.match(/module-(\d+)/);
  return matches ? parseInt(matches[1]) : null;
}

/**
 * Mark a module as complete
 */
function markModuleComplete(moduleId) {
  // Load current progress
  const savedProgress = localStorage.getItem('informational_interviews_progress');
  let progress = savedProgress ? JSON.parse(savedProgress) : {
    completedModules: [],
    currentModule: moduleId,
    overallProgress: 0
  };
  
  // Add to completed modules if not already there
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }
  
  // Calculate overall progress (8 modules total)
  progress.overallProgress = Math.min(100, Math.round((progress.completedModules.length / 8) * 100));
  
  // Save progress
  saveProgress(progress);
  
  // Update UI
  updateProgressDisplay(progress);
  
  // Update button
  const completeButton = document.getElementById('complete-button');
  if (completeButton) {
    completeButton.textContent = 'Completed!';
    completeButton.classList.add('completed');
    completeButton.disabled = true;
  }
  
  // Mark nav item as completed
  const activeNavItem = document.querySelector('.nav-item.active');
  if (activeNavItem) {
    activeNavItem.classList.add('completed');
  }
}

/**
 * Save progress to localStorage
 */
function saveProgress(progress) {
  localStorage.setItem('informational_interviews_progress', JSON.stringify(progress));
}

/**
 * Update progress display in the UI
 */
function updateProgressDisplay(progress) {
  // Update progress bar
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.style.width = progress.overallProgress + '%';
  }
  
  // Update progress text
  const progressText = document.querySelector('.progress-text');
  if (progressText) {
    progressText.textContent = progress.overallProgress + '% complete';
  }
  
  // Mark completed modules in navigation
  progress.completedModules.forEach(moduleId => {
    const navItem = document.querySelector(`.nav-item a[href*="module-${moduleId}"]`);
    if (navItem) {
      navItem.closest('.nav-item').classList.add('completed');
    }
  });
}

/**
 * Highlight the current page in navigation
 */
function highlightCurrentPage() {
  const currentPath = window.location.pathname;
  
  // Find all nav links
  const navLinks = document.querySelectorAll('nav a, .nav-items a');
  
  navLinks.forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    
    // Check if this link matches the current path
    if (currentPath === linkPath) {
      // Add active class to the navigation item
      const navItem = link.closest('.nav-item');
      if (navItem) {
        navItem.classList.add('active');
      } else {
        link.classList.add('active');
      }
    }
  });
}

/**
 * Template functions
 */
function copyTemplate(id) {
  const templateText = document.getElementById(id).textContent;
  navigator.clipboard.writeText(templateText).then(function() {
    alert('Template copied to clipboard!');
  }, function() {
    alert('Failed to copy template. Please try again.');
  });
}

function saveTemplate(id) {
  const templateText = document.getElementById(id).textContent;
  
  // Get existing saved templates
  const savedTemplates = localStorage.getItem('informational_interviews_templates');
  let templates = savedTemplates ? JSON.parse(savedTemplates) : {};
  
  // Add/update this template
  templates[id] = {
    text: templateText,
    savedAt: new Date().toISOString(),
    name: document.querySelector(`.template-box-title`).textContent
  };
  
  // Save to localStorage
  localStorage.setItem('informational_interviews_templates', JSON.stringify(templates));
  alert('Template saved to your library!');
}

// Enhanced header functionality
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      
      // Toggle menu button appearance
      if (mainNav.classList.contains('active')) {
        menuToggle.classList.add('active');
      } else {
        menuToggle.classList.remove('active');
        
        // Close any open dropdowns when closing the menu
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });
  }
  
  // Dropdown handling for all screen sizes
  const dropdownToggle = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggle.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Close all other open dropdowns first
      document.querySelectorAll('.dropdown.open').forEach(openDropdown => {
        if (openDropdown !== this.parentNode) {
          openDropdown.classList.remove('open');
        }
      });
      
      // Toggle the current dropdown
      this.parentNode.classList.toggle('open');
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown.open').forEach(dropdown => {
        dropdown.classList.remove('open');
      });
    }
  });
  
  // Fix relative paths based on current directory level
  function fixRelativePaths() {
    // Determine how many directory levels deep we are
    const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
    let prefix = '';
    
    // Skip for the root
    if (pathParts.length > 0) {
      for (let i = 0; i < pathParts.length - 1; i++) {
        prefix += '../';
      }
      
      // Fix logo link
      const logo = document.querySelector('.logo');
      if (logo && logo.getAttribute('href') === '/') {
        logo.setAttribute('href', prefix || './');
      }
      
      // Fix navigation links that start with /
      document.querySelectorAll('.main-nav a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('/')) {
          link.setAttribute('href', prefix + href.substring(1));
        }
      });
    }
  }
  
  // Call the function to fix paths
  fixRelativePaths();
});