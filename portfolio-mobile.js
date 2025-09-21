// Mobile Portfolio Navigation
class PortfolioMobile {
  constructor() {
    this.currentProject = 'detidetem';
    this.init();
  }

  init() {
    // Only initialize on mobile devices (under 600px)
    if (window.innerWidth > 600) return;
    
    this.setupEventListeners();
    this.setupInitialState();
  }

  setupEventListeners() {
    // Listen for window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 600 && !this.isInitialized) {
        this.init();
      } else if (window.innerWidth > 600 && this.isInitialized) {
        this.cleanup();
      }
    });

    // Listen for navigation button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('mobile-nav-btn')) {
        const projectId = e.target.dataset.project;
        this.switchProject(projectId);
      }
    });
  }

  setupInitialState() {
    // Show first project by default
    this.showProject('detidetem');
    this.isInitialized = true;
  }

  switchProject(projectId) {
    this.currentProject = projectId;
    this.showProject(projectId);
    this.updateActiveButton(projectId);
  }

  showProject(projectId) {
    // Hide all projects
    const projects = document.querySelectorAll('.mobile-project');
    projects.forEach(project => {
      project.style.display = 'none';
    });

    // Show selected project
    const selectedProject = document.querySelector(`[data-project="${projectId}"]`);
    if (selectedProject) {
      selectedProject.style.display = 'block';
    }
  }

  updateActiveButton(projectId) {
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.mobile-nav-btn');
    buttons.forEach(button => {
      button.classList.remove('active');
    });

    // Add active class to selected button
    const activeButton = document.querySelector(`[data-project="${projectId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  cleanup() {
    this.isInitialized = false;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioMobile();
});
