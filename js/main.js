// Main Module - Application initialization

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize bottom navigation first
    initBottomNav();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Setup scroll behavior for auto-hide header
    UI.setupScrollBehavior();
    
    // Load saved language preference
    const savedLang = Storage.loadLanguage();
    if (savedLang && savedLang !== Storage.currentLang) {
        UI.setLanguage(savedLang);
        // Update settings page active state
        const langOptions = document.querySelectorAll('.settings-option[data-lang]');
        langOptions.forEach(opt => {
            opt.classList.remove('active');
            opt.querySelector('.check-icon').classList.add('hidden');
            if (opt.dataset.lang === savedLang) {
                opt.classList.add('active');
                opt.querySelector('.check-icon').classList.remove('hidden');
            }
        });
    }

    // Initialize map
    Map.initMap();

    // Add event button
    document.getElementById('add-event-btn').addEventListener('click', () => {
        Events.openAddEventForm(Map.map.getCenter());
    });

    // Back button in planner - goes back to trip list
    document.getElementById('back-to-trips')?.addEventListener('click', () => {
        Navigation.backToTripList();
    });

    // Settings page
    UI.setupSettingsPage();

    // Home page
    UI.setupHomePage();

    // Date filter
    UI.setupDateFilter();

    // Category filter
    UI.setupCategoryFilter();
    
    // Filter toggle
    UI.setupFilterToggle();

    // Modal close handlers
    document.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            document.getElementById('event-form').reset();
        });
    });

    UI.populateDateDropdown();
    
    // Map search
    Search.setupMapSearch();
    
    // Custom trip date selection
    setupCustomTripDates();
    
    // DateTime dropdowns
    UI.setupDateTimeDropdowns();
    
    // Load saved trips and update UI
    Storage.loadSavedTrips();
    Trips.updateTripsVisibility();
    
    // Initialize checklist
    Checklist.init();
    
    // Map toggle button
    setupMapToggle();
});

// Setup map toggle functionality
function setupMapToggle() {
    const mapToggleBtn = document.getElementById('map-toggle-btn');
    const mapSection = document.querySelector('.map-section');
    
    if (mapToggleBtn && mapSection) {
        mapToggleBtn.addEventListener('click', () => {
            mapSection.classList.toggle('collapsed');
            
            // Update title attribute with translated text
            const isCollapsed = mapSection.classList.contains('collapsed');
            const t = translations[Storage.currentLang];
            mapToggleBtn.title = isCollapsed ? t.expandMap : t.collapseMap;
            
            // Update collapsed map text
            updateCollapsedMapText();
            
            // Refresh map when expanded
            if (!isCollapsed) {
                setTimeout(() => {
                    Map.refreshMap();
                }, 300);
            }
        });
    }
}

// Update collapsed map text based on language
function updateCollapsedMapText() {
    const mapSection = document.querySelector('.map-section');
    if (mapSection && mapSection.classList.contains('collapsed')) {
        const t = translations[Storage.currentLang];
        mapSection.style.setProperty('--map-text', `"${t.map}"`);
    }
}

// Setup custom trip date selection
function setupCustomTripDates() {
    // This function is no longer needed as the modal handles date selection
    // Keeping for backwards compatibility
}

// Export functions
window.Main = {
    setupCustomTripDates
};