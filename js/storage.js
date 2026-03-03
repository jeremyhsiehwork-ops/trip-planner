// Storage Module - LocalStorage operations

// Global state
let events = [];
let savedTrips = [];
let currentTrip = {
    id: null,
    name: 'My Trip',
    template: null,
    startDate: null,
    endDate: null,
    events: []
};
let currentLang = 'en';

// Onboarding completion flags
let onboardingLandingCompleted = false;
let onboardingTripEditorCompleted = false;

// Global expense settings
let expenseSettings = {
    persons: ['Person 1', 'Person 2'],
    defaultCurrency: 'JPY',
    exchangeRates: { ...currencyOptions }
};

// Current trip expenses
let expenses = [];

// Load saved events from localStorage
function loadEvents() {
    const savedEvents = localStorage.getItem('tripEvents');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
        // Ensure all events have latLng property
        events = events.map(event => {
            if (!event.latLng) {
                // Provide default Hong Kong coordinates
                event.latLng = [22.3193, 114.1694];
            }
            return event;
        });
        renderEvents();
    } else {
        showEmptyState();
    }
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('tripEvents', JSON.stringify(events));
    
    // Also save to current trip
    if (currentTrip.id) {
        currentTrip.events = [...events];
        saveTrips();
    }
}

// Save trips to localStorage
function saveTrips() {
    // Save current trip events
    currentTrip.events = [...events];
    
    // Update saved trips
    const existingIndex = savedTrips.findIndex(t => t.id === currentTrip.id);
    if (existingIndex !== -1) {
        savedTrips[existingIndex] = { ...currentTrip };
    } else {
        savedTrips.push({ ...currentTrip });
    }
    
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    localStorage.setItem('currentTripId', currentTrip.id);
}

// Load saved trips from localStorage
function loadSavedTrips() {
    const saved = localStorage.getItem('savedTrips');
    if (saved) {
        savedTrips = JSON.parse(saved);
    }
    
    const currentTripId = localStorage.getItem('currentTripId');
    if (currentTripId) {
        const trip = savedTrips.find(t => t.id === currentTripId);
        if (trip) {
            currentTrip = { ...trip };
            events = [...trip.events];
        }
    }
    
    // Display saved trips on home page
    renderSavedTrips();
}

// Save language preference
function saveLanguage(lang) {
    localStorage.setItem('language', lang);
}

// Load language preference
function loadLanguage() {
    return localStorage.getItem('language');
}

// Load expense settings from localStorage
function loadExpenseSettings() {
    const saved = localStorage.getItem('expenseSettings');
    if (saved) {
        const parsed = JSON.parse(saved);
        expenseSettings = { ...expenseSettings, ...parsed };
    }
    return expenseSettings;
}

// Save expense settings to localStorage
function saveExpenseSettings() {
    localStorage.setItem('expenseSettings', JSON.stringify(expenseSettings));
}

// Load expenses for current trip
function loadExpenses() {
    if (currentTrip.id) {
        const saved = localStorage.getItem(`expenses_${currentTrip.id}`);
        if (saved) {
            expenses = JSON.parse(saved);
        } else {
            expenses = [];
        }
    } else {
        expenses = [];
    }
    return expenses;
}

// Save expenses for current trip
function saveExpenses() {
    if (currentTrip.id) {
        localStorage.setItem(`expenses_${currentTrip.id}`, JSON.stringify(expenses));
    }
}

// Add a new expense
function addExpense(expense) {
    expense.id = 'exp_' + Date.now();
    expense.createdAt = new Date().toISOString();
    expenses.push(expense);
    saveExpenses();
    return expense;
}

// Update an existing expense
function updateExpense(id, updates) {
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses[index] = { ...expenses[index], ...updates };
        saveExpenses();
        return expenses[index];
    }
    return null;
}

// Delete an expense
function deleteExpense(id) {
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses.splice(index, 1);
        saveExpenses();
        return true;
    }
    return false;
}

// Get expense by ID
function getExpenseById(id) {
    return expenses.find(e => e.id === id);
}

// Clear all data
function clearAllData() {
    localStorage.clear();
    savedTrips = [];
    events = [];
    expenses = [];
    currentTrip = {
        id: null,
        name: 'My Trip',
        template: null,
        startDate: null,
        endDate: null,
        events: []
    };
    expenseSettings = {
        persons: ['Person 1', 'Person 2'],
        defaultCurrency: 'JPY',
        exchangeRates: { ...currencyOptions }
    };
}

// Export functions and state
window.Storage = {
    get events() { return events; },
    set events(val) { events = val; },
    get savedTrips() { return savedTrips; },
    set savedTrips(val) { savedTrips = val; },
    get currentTrip() { return currentTrip; },
    set currentTrip(val) { currentTrip = val; },
    get currentLang() { return currentLang; },
    set currentLang(val) { currentLang = val; },
    get expenseSettings() { return expenseSettings; },
    set expenseSettings(val) { expenseSettings = val; },
    get expenses() { return expenses; },
    set expenses(val) { expenses = val; },
    get onboardingLandingCompleted() { return onboardingLandingCompleted; },
    set onboardingLandingCompleted(val) { onboardingLandingCompleted = val; },
    get onboardingTripEditorCompleted() { return onboardingTripEditorCompleted; },
    set onboardingTripEditorCompleted(val) { onboardingTripEditorCompleted = val; },
    loadEvents,
    saveEvents,
    saveTrips,
    loadSavedTrips,
    saveLanguage,
    loadLanguage,
    clearAllData,
    loadExpenseSettings,
    saveExpenseSettings,
    loadExpenses,
    saveExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById
};
