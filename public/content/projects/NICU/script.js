// NICU Parent Guide JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Navigation between sections
  const sections = ['welcome', 'first24', 'understanding', 'advocacy', 'feeding', 'selfcare', 'discharge', 'stories'];
  let currentSectionIndex = 0;
  
  // Get navigation elements
  const navButtons = document.querySelectorAll('.nav-button');
  const contentSections = document.querySelectorAll('.content-section');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const actionButtons = document.querySelectorAll('.action-button');
  
  // Condition accordions
  const conditionHeaders = document.querySelectorAll('.condition-header');
  
  // Initialize the page - hide prev button on first page
  updateNavigationButtons();
  
  // Add event listeners to main navigation
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetSection = this.getAttribute('data-section');
      showSection(targetSection);
    });
  });
  
  // Add event listeners to action buttons within content
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetSection = this.getAttribute('data-section');
      showSection(targetSection);
    });
  });
  
  // Add event listeners to prev/next buttons
  prevButton.addEventListener('click', goToPreviousSection);
  nextButton.addEventListener('click', goToNextSection);
  
  // Add event listeners to condition accordions
  conditionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const conditionId = this.getAttribute('data-condition');
      toggleConditionContent(conditionId);
    });
  });
  
  // Function to show a specific section
  function showSection(sectionId) {
    // Remove active class from all sections and buttons
    contentSections.forEach(section => {
      section.classList.remove('active');
    });
    
    navButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    // Add active class to target section and button
    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`.nav-button[data-section="${sectionId}"]`).classList.add('active');
    
    // Update current section index
    currentSectionIndex = sections.indexOf(sectionId);
    
    // Update prev/next buttons
    updateNavigationButtons();
    
    // Scroll to top of content
    window.scrollTo({
      top: document.querySelector('header').offsetHeight,
      behavior: 'smooth'
    });
  }
  
  // Function to go to previous section
  function goToPreviousSection() {
    if (currentSectionIndex > 0) {
      currentSectionIndex--;
      showSection(sections[currentSectionIndex]);
    }
  }
  
  // Function to go to next section
  function goToNextSection() {
    if (currentSectionIndex < sections.length - 1) {
      currentSectionIndex++;
      showSection(sections[currentSectionIndex]);
    }
  }
  
  // Function to update prev/next button visibility
  function updateNavigationButtons() {
    // Hide prev button on first page
    if (currentSectionIndex === 0) {
      prevButton.style.visibility = 'hidden';
    } else {
      prevButton.style.visibility = 'visible';
    }
    
    // Hide next button on last page
    if (currentSectionIndex === sections.length - 1) {
      nextButton.style.visibility = 'hidden';
    } else {
      nextButton.style.visibility = 'visible';
    }
  }
  
  // Function to toggle condition content
  function toggleConditionContent(conditionId) {
    const content = document.getElementById(`${conditionId}-content`);
    const header = document.querySelector(`.condition-header[data-condition="${conditionId}"]`);
    const toggleIcon = header.querySelector('.toggle-icon');
    
    if (content.classList.contains('active')) {
      content.classList.remove('active');
      toggleIcon.textContent = '+';
    } else {
      content.classList.add('active');
      toggleIcon.textContent = '−';
    }
  }
});