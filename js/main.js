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
    MapModule.initMap();

    // Add event button
    document.getElementById('add-event-btn').addEventListener('click', () => {
        Events.openAddEventForm(MapModule.map.getCenter());
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
            const eventForm = document.getElementById('event-form');
            if (eventForm) {
                eventForm.reset();
            }
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
    
    // Initialize expense settings
    initExpenseSettings();
    
    // Tutorial buttons
    setupTutorialButtons();
    
    // Map toggle button
    setupMapToggle();
});

// Initialize expense settings functionality
function initExpenseSettings() {
    // Load expense settings
    Storage.loadExpenseSettings();
    
    // Person count stepper
    const personsDecrease = document.getElementById('persons-decrease');
    const personsIncrease = document.getElementById('persons-increase');
    const personsCountDisplay = document.getElementById('persons-count-display');
    
    if (personsDecrease) {
        personsDecrease.addEventListener('click', () => {
            const settings = Storage.expenseSettings;
            if (settings.persons.length > 1) {
                settings.persons.pop();
                Storage.saveExpenseSettings();
                renderPersonNames();
                updatePersonsCount();
            }
        });
    }
    
    if (personsIncrease) {
        personsIncrease.addEventListener('click', () => {
            const settings = Storage.expenseSettings;
            settings.persons.push(`Person ${settings.persons.length + 1}`);
            Storage.saveExpenseSettings();
            renderPersonNames();
            updatePersonsCount();
        });
    }
    
    // Default currency select
    const defaultCurrencySelect = document.getElementById('default-currency-select');
    if (defaultCurrencySelect) {
        defaultCurrencySelect.addEventListener('change', (e) => {
            Storage.expenseSettings.defaultCurrency = e.target.value;
            Storage.saveExpenseSettings();
        });
    }
    
    // Initial render
    renderPersonNames();
    updatePersonsCount();
    renderExchangeRates();
    updateDefaultCurrencySelect();
}

// Render person name inputs
function renderPersonNames() {
    const container = document.getElementById('person-names-list');
    if (!container) return;
    
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    container.innerHTML = persons.map((person, index) => `
        <div class="person-name-item">
            <input type="text" 
                   class="person-name-input" 
                   value="${person}" 
                   data-person-index="${index}"
                   placeholder="Enter name">
        </div>
    `).join('');
    
    // Add event listeners for name changes
    container.querySelectorAll('.person-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.personIndex);
            Storage.expenseSettings.persons[index] = e.target.value;
            Storage.saveExpenseSettings();
        });
    });
}

// Update persons count display
function updatePersonsCount() {
    const display = document.getElementById('persons-count-display');
    if (display) {
        display.textContent = Storage.expenseSettings.persons.length;
    }
}

// Render exchange rates
function renderExchangeRates() {
    const container = document.getElementById('exchange-rates-list');
    if (!container) return;
    
    const rates = Storage.expenseSettings.exchangeRates || currencyOptions;
    
    // Only show major currencies
    const displayCurrencies = ['JPY', 'TWD', 'USD', 'EUR', 'KRW', 'SGD', 'THB', 'CNY'];
    
    container.innerHTML = displayCurrencies.map(currency => `
        <div class="exchange-rate-item">
            <span class="rate-currency">${currency}</span>
            <span class="rate-arrow">→</span>
            <input type="number" 
                   class="rate-value-input" 
                   value="${rates[currency]?.rate || currencyOptions[currency]?.rate || 1}" 
                   data-currency="${currency}"
                   step="0.0001"
                   min="0">
            <span>HKD</span>
        </div>
    `).join('');
    
    // Add event listeners for rate changes
    container.querySelectorAll('.rate-value-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const currency = e.target.dataset.currency;
            const rate = parseFloat(e.target.value) || 0;
            
            if (!Storage.expenseSettings.exchangeRates) {
                Storage.expenseSettings.exchangeRates = { ...currencyOptions };
            }
            
            if (Storage.expenseSettings.exchangeRates[currency]) {
                Storage.expenseSettings.exchangeRates[currency].rate = rate;
            } else {
                Storage.expenseSettings.exchangeRates[currency] = { 
                    ...currencyOptions[currency], 
                    rate 
                };
            }
            
            Storage.saveExpenseSettings();
        });
    });
}

// Update default currency select
function updateDefaultCurrencySelect() {
    const select = document.getElementById('default-currency-select');
    if (select && Storage.expenseSettings.defaultCurrency) {
        select.value = Storage.expenseSettings.defaultCurrency;
    }
}

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
                    MapModule.refreshMap();
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

// Setup tutorial buttons in settings
function setupTutorialButtons() {
    const landingTutorialBtn = document.getElementById('show-landing-tutorial');
    const tripEditorTutorialBtn = document.getElementById('show-trip-editor-tutorial');
    
    if (landingTutorialBtn) {
        landingTutorialBtn.addEventListener('click', () => {
            if (typeof Onboarding !== 'undefined') {
                Onboarding.toggle('landing');
            }
        });
    }
    
    if (tripEditorTutorialBtn) {
        tripEditorTutorialBtn.addEventListener('click', () => {
            if (typeof Onboarding !== 'undefined') {
                Onboarding.toggle('tripEditor');
            }
        });
    }
}

// Export functions
window.Main = {
    setupCustomTripDates
};
