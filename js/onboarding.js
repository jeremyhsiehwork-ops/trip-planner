// Onboarding Module - First-time user tutorials

// Onboarding state
let onboardingState = {
    active: false,
    currentFlow: null, // 'landing' or 'tripEditor'
    currentStep: 0,
    steps: []
};

// Landing page onboarding steps
const landingSteps = [
    {
        target: '#trip-list-view .page-header',
        title: { en: 'Welcome to Trip Planner! 👋', 'zh-TW': '歡迎使用旅程規劃器！👋' },
        content: { 
            en: 'Your adventure starts here. Let us show you around!', 
            'zh-TW': '您的冒險從這裡開始。讓我們為您介紹！' 
        },
        position: 'bottom'
    },
    {
        target: '#landing-nav .nav-item-center',
        title: { en: 'Create Your Trip ✈️', 'zh-TW': '建立您的旅程 ✈️' },
        content: { 
            en: 'Tap here to create a new trip. Choose a custom trip or start from a template!', 
            'zh-TW': '點擊這裡建立新旅程。選擇自訂旅程或從範本開始！' 
        },
        position: 'top'
    },
    {
        target: '#landing-nav .nav-item:last-child',
        title: { en: 'Settings ⚙️', 'zh-TW': '設定 ⚙️' },
        content: { 
            en: 'Customize language, expense settings, and manage your data here.', 
            'zh-TW': '在這裡自訂語言、費用設定和管理您的資料。' 
        },
        position: 'top'
    }
];

// Trip editor onboarding steps
const tripEditorSteps = [
    {
        target: '#shared-planner-header',
        title: { en: 'Your Trip Header 📋', 'zh-TW': '您的旅程標題 📋' },
        content: { 
            en: 'This shows your trip name. Tap the arrow to go back to your trip list.', 
            'zh-TW': '這裡顯示您的旅程名稱。點擊箭頭返回旅程列表。' 
        },
        position: 'bottom'
    },
    {
        target: '#add-event-btn',
        title: { en: 'Quick Add Event ➕', 'zh-TW': '快速新增活動 ➕' },
        content: { 
            en: 'Tap here to quickly add events to your trip schedule.', 
            'zh-TW': '點擊這裡快速新增活動到您的行程。' 
        },
        position: 'bottom'
    },
    {
        target: '#trip-editor-nav .nav-item[data-page="map-editor"]',
        title: { en: 'Interactive Map 🗺️', 'zh-TW': '互動地圖 🗺️' },
        content: { 
            en: 'View all your trip locations here. Tap on the map to add events at that location!', 
            'zh-TW': '在這裡查看所有旅程地點。點擊地圖在該位置新增活動！' 
        },
        position: 'top'
    },
    {
        target: '.events-section',
        title: { en: 'Your Schedule 📅', 'zh-TW': '您的行程 📅' },
        content: { 
            en: 'Your itinerary appears here. Tap any event to view details, edit, or delete it.', 
            'zh-TW': '您的行程顯示在這裡。點擊任何活動查看詳情、編輯或刪除。' 
        },
        position: 'left'
    },
    {
        target: '#trip-editor-nav .nav-item[data-page="track"]',
        title: { en: 'Expense Tracker 💰', 'zh-TW': '費用追蹤 💰' },
        content: { 
            en: 'Track your trip expenses, split costs between travelers, and manage your budget.', 
            'zh-TW': '追蹤旅程費用、在旅行者之間分攤費用和管理預算。' 
        },
        position: 'top'
    },
    {
        target: '#trip-editor-nav .nav-item[data-page="checklist"]',
        title: { en: 'Packing Checklist ✅', 'zh-TW': '打包清單 ✅' },
        content: { 
            en: 'Never forget anything! Use the checklist to prepare for your trip.', 
            'zh-TW': '再也不會忘記東西！使用清單準備您的旅程。' 
        },
        position: 'top'
    }
];

// Initialize onboarding
function initOnboarding() {
    // Create onboarding overlay if it doesn't exist
    if (!document.getElementById('onboarding-overlay')) {
        createOnboardingOverlay();
    }
    
    // Check if landing onboarding should be shown
    if (!Storage.onboardingLandingCompleted) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
            startOnboarding('landing');
        }, 500);
    }
}

// Create onboarding overlay HTML
function createOnboardingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboarding-overlay hidden';
    overlay.innerHTML = `
        <div class="onboarding-spotlight"></div>
        <div class="onboarding-tooltip">
            <div class="onboarding-header">
                <h4 class="onboarding-title"></h4>
                <button class="onboarding-skip" id="onboarding-skip">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <p class="onboarding-content"></p>
            <div class="onboarding-footer">
                <div class="onboarding-dots"></div>
                <div class="onboarding-buttons">
                    <button class="onboarding-btn onboarding-btn-skip" id="onboarding-btn-skip">Skip</button>
                    <button class="onboarding-btn onboarding-btn-next" id="onboarding-btn-next">Next</button>
                    <button class="onboarding-btn onboarding-btn-done hidden" id="onboarding-btn-done">Got it!</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Add event listeners
    document.getElementById('onboarding-skip').addEventListener('click', skipOnboarding);
    document.getElementById('onboarding-btn-skip').addEventListener('click', skipOnboarding);
    document.getElementById('onboarding-btn-next').addEventListener('click', nextOnboardingStep);
    document.getElementById('onboarding-btn-done').addEventListener('click', completeOnboarding);
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Start onboarding flow
function startOnboarding(flow) {
    if (onboardingState.active) return;
    
    onboardingState.active = true;
    onboardingState.currentFlow = flow;
    onboardingState.currentStep = 0;
    onboardingState.steps = flow === 'landing' ? landingSteps : tripEditorSteps;
    
    const overlay = document.getElementById('onboarding-overlay');
    overlay.classList.remove('hidden');
    
    showOnboardingStep();
}

// Show current onboarding step
function showOnboardingStep() {
    const step = onboardingState.steps[onboardingState.currentStep];
    if (!step) {
        console.warn('Onboarding step not found:', onboardingState.currentStep);
        completeOnboarding();
        return;
    }
    
    const targetEl = document.querySelector(step.target);
    const overlay = document.getElementById('onboarding-overlay');
    const spotlight = overlay.querySelector('.onboarding-spotlight');
    const tooltip = overlay.querySelector('.onboarding-tooltip');
    const titleEl = tooltip.querySelector('.onboarding-title');
    const contentEl = tooltip.querySelector('.onboarding-content');
    const dotsEl = tooltip.querySelector('.onboarding-dots');
    const nextBtn = document.getElementById('onboarding-btn-next');
    const doneBtn = document.getElementById('onboarding-btn-done');
    const skipBtn = document.getElementById('onboarding-btn-skip');
    
    // Get current language
    const lang = Storage.currentLang || 'en';
    
    // Set content
    titleEl.textContent = step.title[lang] || step.title.en;
    contentEl.textContent = step.content[lang] || step.content.en;
    
    // Create dots
    dotsEl.innerHTML = '';
    onboardingState.steps.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `onboarding-dot ${index === onboardingState.currentStep ? 'active' : ''}`;
        dotsEl.appendChild(dot);
    });
    
    // Show/hide buttons based on step
    const isLastStep = onboardingState.currentStep === onboardingState.steps.length - 1;
    
    // Use classList to properly toggle hidden class
    if (isLastStep) {
        nextBtn.classList.add('hidden');
        doneBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        doneBtn.classList.add('hidden');
    }
    skipBtn.textContent = isLastStep ? '' : (lang === 'zh-TW' ? '跳過' : 'Skip');
    
    // Position spotlight and tooltip
    if (targetEl) {
        // Scroll target into view
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            const rect = targetEl.getBoundingClientRect();
            
            // Position spotlight
            spotlight.style.left = `${rect.left - 8}px`;
            spotlight.style.top = `${rect.top - 8}px`;
            spotlight.style.width = `${rect.width + 16}px`;
            spotlight.style.height = `${rect.height + 16}px`;
            
            // Position tooltip
            positionTooltip(tooltip, rect, step.position);
            
            // Add highlight class to target
            targetEl.classList.add('onboarding-highlight');
        }, 300);
    } else {
        console.warn('Target element not found:', step.target);
        // Skip this step if target not found
        nextOnboardingStep();
    }
}

// Position tooltip relative to target
function positionTooltip(tooltip, targetRect, position) {
    const padding = 16;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left, top;
    
    switch (position) {
        case 'top':
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            top = targetRect.top - tooltipRect.height - padding;
            tooltip.className = 'onboarding-tooltip position-top';
            break;
        case 'bottom':
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            top = targetRect.bottom + padding;
            tooltip.className = 'onboarding-tooltip position-bottom';
            break;
        case 'left':
            left = targetRect.left - tooltipRect.width - padding;
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            tooltip.className = 'onboarding-tooltip position-left';
            break;
        case 'right':
            left = targetRect.right + padding;
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            tooltip.className = 'onboarding-tooltip position-right';
            break;
        default:
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            top = targetRect.bottom + padding;
            tooltip.className = 'onboarding-tooltip position-bottom';
    }
    
    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 16) left = 16;
    if (left + tooltipRect.width > viewportWidth - 16) left = viewportWidth - tooltipRect.width - 16;
    if (top < 16) top = targetRect.bottom + padding;
    if (top + tooltipRect.height > viewportHeight - 16) top = targetRect.top - tooltipRect.height - padding;
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

// Go to next onboarding step
function nextOnboardingStep() {
    // Remove highlight from current target
    const currentStep = onboardingState.steps[onboardingState.currentStep];
    const currentTarget = document.querySelector(currentStep.target);
    if (currentTarget) {
        currentTarget.classList.remove('onboarding-highlight');
    }
    
    // Move to next step
    onboardingState.currentStep++;
    
    if (onboardingState.currentStep >= onboardingState.steps.length) {
        completeOnboarding();
    } else {
        showOnboardingStep();
    }
}

// Skip onboarding
function skipOnboarding() {
    completeOnboarding();
}

// Complete onboarding
function completeOnboarding() {
    // Remove highlight from current target
    if (onboardingState.steps[onboardingState.currentStep]) {
        const currentTarget = document.querySelector(onboardingState.steps[onboardingState.currentStep].target);
        if (currentTarget) {
            currentTarget.classList.remove('onboarding-highlight');
        }
    }
    
    // Mark as completed in memory AND localStorage (user dismissed it)
    if (onboardingState.currentFlow === 'landing') {
        Storage.onboardingLandingCompleted = true;
        localStorage.setItem('onboardingLandingCompleted', 'true');
    } else if (onboardingState.currentFlow === 'tripEditor') {
        Storage.onboardingTripEditorCompleted = true;
        localStorage.setItem('onboardingTripEditorCompleted', 'true');
    }
    
    // Hide overlay
    const overlay = document.getElementById('onboarding-overlay');
    overlay.classList.add('hidden');
    
    // Reset state
    onboardingState.active = false;
    onboardingState.currentFlow = null;
    onboardingState.currentStep = 0;
    onboardingState.steps = [];
}

// Toggle onboarding flag (for Settings "Show Tutorial" button)
function toggleOnboarding(flow) {
    const lang = Storage.currentLang || 'en';
    
    if (flow === 'landing') {
        const isCompleted = Storage.onboardingLandingCompleted;
        Storage.onboardingLandingCompleted = !isCompleted;
        
        if (isCompleted) {
            // Currently completed, enable it
            localStorage.removeItem('onboardingLandingCompleted');
            alert(lang === 'zh-TW' ? '已啟用首頁教學，下次進入時將會顯示。' : 'Landing tutorial enabled. It will show on next visit.');
        } else {
            // Currently enabled, disable it
            localStorage.setItem('onboardingLandingCompleted', 'true');
            alert(lang === 'zh-TW' ? '已關閉首頁教學。' : 'Landing tutorial disabled.');
        }
    } else if (flow === 'tripEditor') {
        const isCompleted = Storage.onboardingTripEditorCompleted;
        Storage.onboardingTripEditorCompleted = !isCompleted;
        
        if (isCompleted) {
            // Currently completed, enable it
            localStorage.removeItem('onboardingTripEditorCompleted');
            alert(lang === 'zh-TW' ? '已啟用行程編輯器教學，下次建立或開啟行程時將會顯示。' : 'Trip editor tutorial enabled. It will show when you create or open a trip.');
        } else {
            // Currently enabled, disable it
            localStorage.setItem('onboardingTripEditorCompleted', 'true');
            alert(lang === 'zh-TW' ? '已關閉行程編輯器教學。' : 'Trip editor tutorial disabled.');
        }
    }
}

// Reset onboarding (for internal use - actually starts the tutorial)
function resetOnboarding(flow) {
    if (flow === 'landing') {
        Storage.onboardingLandingCompleted = false;
        localStorage.removeItem('onboardingLandingCompleted');
        startOnboarding('landing');
    } else if (flow === 'tripEditor') {
        Storage.onboardingTripEditorCompleted = false;
        localStorage.removeItem('onboardingTripEditorCompleted');
        // Only start if we're in trip editor mode
        if (Storage.currentTrip.id) {
            startOnboarding('tripEditor');
        }
    }
}

// Check and start trip editor onboarding
function checkTripEditorOnboarding() {
    // Only show if we're in trip editor mode and haven't completed
    if (Storage.currentTrip.id && !Storage.onboardingTripEditorCompleted) {
        setTimeout(() => {
            startOnboarding('tripEditor');
        }, 500);
    }
}

// Load onboarding status from localStorage
function loadOnboardingStatus() {
    Storage.onboardingLandingCompleted = localStorage.getItem('onboardingLandingCompleted') === 'true';
    Storage.onboardingTripEditorCompleted = localStorage.getItem('onboardingTripEditorCompleted') === 'true';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadOnboardingStatus();
        initOnboarding();
    }, 200);
});

// Start landing onboarding (convenience function)
function startLandingOnboarding() {
    resetOnboarding('landing');
}

// Start trip editor onboarding (convenience function)
function startTripEditorOnboarding() {
    resetOnboarding('tripEditor');
}

// Export functions
window.Onboarding = {
    init: initOnboarding,
    start: startOnboarding,
    skip: skipOnboarding,
    complete: completeOnboarding,
    reset: resetOnboarding,
    toggle: toggleOnboarding,
    checkTripEditorOnboarding: checkTripEditorOnboarding,
    loadStatus: loadOnboardingStatus,
    startLandingOnboarding: startLandingOnboarding,
    startTripEditorOnboarding: startTripEditorOnboarding
};
