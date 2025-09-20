class Stepper {
  constructor(options = {}) {
    this.options = {
      initialStep: options.initialStep || 1,
      onStepChange: options.onStepChange || (() => {}),
      onFinalStepCompleted: options.onFinalStepCompleted || (() => {}),
      backButtonText: options.backButtonText || 'Zpět',
      nextButtonText: options.nextButtonText || 'Pokračovat',
      completeButtonText: options.completeButtonText || 'Dokončit',
      disableStepIndicators: options.disableStepIndicators || false,
      ...options
    };

    this.container = null;
    this.currentStep = this.options.initialStep;
    this.direction = 0;
    this.steps = [];
    this.totalSteps = 0;
    this.isCompleted = false;

    this.init();
  }

  init() {
    this.container = document.querySelector('.stepper-container');
    if (!this.container) return;

    this.steps = Array.from(this.container.querySelectorAll('.step-content'));
    this.totalSteps = this.steps.length;
    this.isCompleted = this.currentStep > this.totalSteps;

    this.render();
    this.bindEvents();
  }

  render() {
    this.renderStepIndicators();
    this.renderStepContent();
    this.renderFooter();
  }

  renderStepIndicators() {
    const indicatorRow = this.container.querySelector('.step-indicator-row');
    if (!indicatorRow) return;

    indicatorRow.innerHTML = '';

    this.steps.forEach((_, index) => {
      const stepNumber = index + 1;
      const isNotLastStep = index < this.totalSteps - 1;

      // Create step indicator
      const indicator = this.createStepIndicator(stepNumber);
      indicatorRow.appendChild(indicator);

      // Create connector if not last step
      if (isNotLastStep) {
        const connector = this.createStepConnector(stepNumber);
        indicatorRow.appendChild(connector);
      }
    });
  }

  createStepIndicator(stepNumber) {
    const indicator = document.createElement('div');
    indicator.className = 'step-indicator';
    indicator.addEventListener('click', () => this.handleStepClick(stepNumber));

    const inner = document.createElement('div');
    inner.className = 'step-indicator-inner';

    const status = this.getStepStatus(stepNumber);
    inner.classList.add(status);

    if (status === 'complete') {
      inner.innerHTML = '<svg class="check-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
    } else if (status === 'active') {
      inner.innerHTML = '<div class="active-dot"></div>';
    } else {
      inner.innerHTML = `<span class="step-number">${stepNumber}</span>`;
    }

    indicator.appendChild(inner);
    return indicator;
  }

  createStepConnector(stepNumber) {
    const connector = document.createElement('div');
    connector.className = 'step-connector';

    const inner = document.createElement('div');
    inner.className = 'step-connector-inner';
    inner.classList.add(this.currentStep > stepNumber ? 'complete' : 'incomplete');

    connector.appendChild(inner);
    return connector;
  }

  getStepStatus(stepNumber) {
    if (this.currentStep === stepNumber) return 'active';
    if (this.currentStep < stepNumber) return 'inactive';
    return 'complete';
  }

  renderStepContent() {
    const contentContainer = this.container.querySelector('.step-content-default');
    if (!contentContainer) return;

    // Hide all steps
    this.steps.forEach(step => {
      step.style.display = 'none';
    });

    // Show current step
    if (this.currentStep <= this.totalSteps) {
      const currentStepElement = this.steps[this.currentStep - 1];
      if (currentStepElement) {
        currentStepElement.style.display = 'block';
      }
    }
  }

  renderFooter() {
    // Footer removed - buttons are now inline with content
    // Update button states in content
    this.updateInlineButtons();
  }

  updateInlineButtons() {
    const nextButtons = this.container.querySelectorAll('.step-next-button');
    nextButtons.forEach((button, index) => {
      const stepNumber = index + 1;
      const isLastStep = stepNumber === this.totalSteps;
      
      if (stepNumber === this.currentStep) {
        button.style.display = 'flex';
        button.textContent = isLastStep ? this.options.completeButtonText : this.options.nextButtonText;
        button.dataset.action = isLastStep ? 'complete' : 'next';
      } else {
        button.style.display = 'none';
      }
    });
  }

  bindEvents() {
    // Footer button events
    this.container.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'back') {
        this.handleBack();
      } else if (e.target.dataset.action === 'next') {
        this.handleNext();
      } else if (e.target.dataset.action === 'complete') {
        this.handleComplete();
      }
    });
  }

  handleStepClick(stepNumber) {
    if (this.options.disableStepIndicators || stepNumber === this.currentStep) return;

    this.direction = stepNumber > this.currentStep ? 1 : -1;
    this.updateStep(stepNumber);
  }

  handleBack() {
    if (this.currentStep > 1) {
      this.direction = -1;
      this.updateStep(this.currentStep - 1);
    }
  }

  handleNext() {
    if (this.currentStep < this.totalSteps) {
      this.direction = 1;
      this.updateStep(this.currentStep + 1);
    }
  }

  handleComplete() {
    this.direction = 1;
    this.updateStep(this.totalSteps + 1);
  }

  updateStep(newStep) {
    this.currentStep = newStep;
    this.isCompleted = this.currentStep > this.totalSteps;

    this.render();
    this.options.onStepChange(this.currentStep);

    if (this.isCompleted) {
      this.options.onFinalStepCompleted();
    }
  }
}

// Initialize stepper when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const stepperContainer = document.querySelector('.stepper-container');
  if (stepperContainer) {
    new Stepper({
      initialStep: 1,
      backButtonText: 'Zpět',
      nextButtonText: 'Pokračovat',
      completeButtonText: 'Dokončit',
      onStepChange: (step) => {
        console.log('Step changed to:', step);
      },
      onFinalStepCompleted: () => {
        console.log('Stepper completed!');
      }
    });
  }
});

// Export for use in other scripts
window.Stepper = Stepper;
