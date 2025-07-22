/**
 * Module 1: Introduction - JavaScript
 * This file contains module-specific functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load module resources
    loadModuleResources();
    
    // Initialize interactive elements
    initializeInteractiveElements();
  });
  
  /**
   * Load module-specific resources from resources.json
   */
  async function loadModuleResources() {
    try {
      const response = await fetch('resources.json');
      const resources = await response.json();
      
      // Set estimated reading time if element exists
      const readingTimeElement = document.querySelector('.reading-time');
      if (readingTimeElement) {
        readingTimeElement.textContent = resources.estimatedReadingTime;
      }
      
      // Load related modules if container exists
      const relatedModulesContainer = document.querySelector('.related-modules');
      if (relatedModulesContainer && resources.relatedModules) {
        const moduleLinks = resources.relatedModules.map(moduleId => {
          return `<a href="../module-${moduleId}/index.html" class="related-module-link">Module ${moduleId}</a>`;
        }).join('');
        
        relatedModulesContainer.innerHTML = moduleLinks;
      }
      
      console.log('Module resources loaded successfully');
    } catch (error) {
      console.error('Failed to load module resources:', error);
    }
  }
  
  /**
   * Initialize interactive elements specific to this module
   */
  function initializeInteractiveElements() {
    // Interactive note hover effects
    const interactiveNotes = document.querySelectorAll('.interactive-note');
    
    interactiveNotes.forEach(note => {
      note.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
      });
      
      note.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      });
    });
    
    // Success story expand/collapse functionality
    const successStories = document.querySelectorAll('.success-story-box');
    
    successStories.forEach(story => {
      const content = story.querySelector('.success-story-content');
      
      // If the content is longer than 3 lines, add expand/collapse
      if (content && content.scrollHeight > 120) {
        content.style.maxHeight = '120px';
        content.style.overflow = 'hidden';
        content.style.position = 'relative';
        
        const expandButton = document.createElement('button');
        expandButton.className = 'expand-button';
        expandButton.textContent = 'Read more';
        expandButton.style.marginTop = '0.5rem';
        expandButton.style.background = 'none';
        expandButton.style.border = 'none';
        expandButton.style.color = 'var(--primary)';
        expandButton.style.cursor = 'pointer';
        expandButton.style.fontWeight = '500';
        
        story.appendChild(expandButton);
        
        expandButton.addEventListener('click', function() {
          if (content.style.maxHeight === '120px') {
            content.style.maxHeight = content.scrollHeight + 'px';
            this.textContent = 'Show less';
          } else {
            content.style.maxHeight = '120px';
            this.textContent = 'Read more';
          }
        });
      }
    });
    
    // Initialize any tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      const tooltipText = element.getAttribute('data-tooltip');
      
      element.addEventListener('mouseenter', function(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        
        // Style the tooltip
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'var(--dark)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '0.5rem 1rem';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '0.85rem';
        tooltip.style.zIndex = '1000';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.whiteSpace = 'nowrap';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + window.scrollX + 'px';
        tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + 'px';
        
        element.tooltipElement = tooltip;
      });
      
      element.addEventListener('mouseleave', function() {
        if (element.tooltipElement) {
          element.tooltipElement.remove();
          element.tooltipElement = null;
        }
      });
    });
  }
  
  /**
   * Track and update reading progress
   */
  function trackReadingProgress() {
    const contentBody = document.querySelector('.module-content-body');
    if (!contentBody) return;
    
    const contentHeight = contentBody.scrollHeight;
    const visibleHeight = window.innerHeight;
    
    window.addEventListener('scroll', function() {
      // Calculate how far down the page the user has scrolled
      const scrolled = window.scrollY;
      const maxScrollable = contentHeight - visibleHeight;
      
      // Calculate percentage (capped at 100%)
      const percentage = Math.min(100, Math.round((scrolled / maxScrollable) * 100));
      
      // Update module's reading progress
      updateModuleProgress(percentage);
    });
  }
  
  /**
   * Update module progress in localStorage
   */
  function updateModuleProgress(percentage) {
    // Only update if significant progress has been made (> 80%)
    if (percentage < 80) return;
    
    // Get current progress
    const savedProgress = localStorage.getItem('informational_interviews_progress');
    let progress = savedProgress ? JSON.parse(savedProgress) : {
      completedModules: [],
      currentModule: 1,
      overallProgress: 0
    };
    
    // Mark current module as read if significant progress
    if (percentage >= 80 && !progress.readModules) {
      progress.readModules = [];
    }
    
    if (percentage >= 80 && !progress.readModules.includes(1)) {
      progress.readModules.push(1);
      
      // Update overall progress
      const totalModules = 8;
      progress.overallProgress = Math.round((progress.readModules.length / totalModules) * 100);
      
      // Save updated progress
      localStorage.setItem('informational_interviews_progress', JSON.stringify(progress));
    }
  }
  
  // Initialize reading progress tracking
  trackReadingProgress();