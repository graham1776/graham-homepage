// header.js - Dynamically injects the universal header into any page
document.addEventListener('DOMContentLoaded', function() {
    // Create the header element
    const header = document.createElement('header');
    header.className = 'site-header';
    
    // Set the header HTML content with absolute paths
    header.innerHTML = `
      <div class="container">
        <a href="/" class="logo">Informational Interviews</a>
        <nav class="main-nav">
          <ul>
            <li><a href="/#about">About</a></li>
            <li><a href="/#journey">The Process</a></li>
            <li><a href="/#stories">Success Stories</a></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle">Tools <span class="dropdown-icon">▼</span></a>
              <ul class="dropdown-menu">
                <li><a href="/tools/email-generator.html">Email Templates</a></li>
                <li><a href="/tools/question-bank.html">Question Library</a></li>
                <li><a href="/tools/contact-tracker.html">Contact Tracker</a></li>
                <li><a href="/tools/scheduler.html">30-Day Plan</a></li>
              </ul>
            </li>
            <li><a href="/content/module-1/index.html" class="cta-button">Read the Guide</a></li>
          </ul>
        </nav>
        <button class="menu-toggle" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    `;
    
    // Insert the header at the beginning of the body
    const body = document.body;
    body.insertBefore(header, body.firstChild);
    
    // Set up event listeners for dropdown and mobile menu
    setupHeaderInteractions();
  });
  
  // Set up all header interactions
  function setupHeaderInteractions() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
      });
    }
    
    // Dropdown handling
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
  }