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

// Clear all data
function clearAllData() {
    localStorage.clear();
    savedTrips = [];
    events = [];
    currentTrip = {
        id: null,
        name: 'My Trip',
        template: null,
        startDate: null,
        endDate: null,
        events: []
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
    loadEvents,
    saveEvents,
    saveTrips,
    loadSavedTrips,
    saveLanguage,
    loadLanguage,
    clearAllData
};