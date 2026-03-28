// Initialize map and variables
let map;
let markers = [];
let events = [];
let popup;
let currentTrip = {
    id: null,
    name: 'My Trip',
    template: null,
    startDate: null,
    endDate: null,
    events: []
};
let savedTrips = []; // Array to store all saved trips
let currentLang = 'en';
let currentEditIndex = null;
let searchResults = [];
let eventCategories = {
    hotel: { color: '#28a745', icon: '🏨' },
    breakfast: { color: '#ffc107', icon: '🍳' },
    lunch: { color: '#17a2b8', icon: '🍱' },
    dinner: { color: '#dc3545', icon: '🍛' },
    view: { color: '#6f42c1', icon: '🏞️' },
    play: { color: '#fd7e14', icon: '🎡' },
    transportation: { color: '#00bcd4', icon: '🚌' },
    event: { color: '#e91e63', icon: '🎉' },
    shopping: { color: '#9c27b0', icon: '🛍️' }
};

// Language translations
const translations = {
    en: {
        navbarTitle: "My Trip Planner",
        welcome: "Welcome to Your Trip Planner",
        chooseTrip: "Start by creating a new trip or choosing from our templates",
        tripOptions: "Choose Your Trip",
        japanToyama: "4-Day Japan Toyama Trip",
        exploreToyama: "Explore the beautiful Toyama prefecture",
        customTrip: "Custom Trip",
        createItinerary: "Create your own itinerary",
        tripSchedule: "My Trip",
        addEvent: "Add Event",
        eventName: "Event Name",
        location: "Location",
        time: "Time",
        category: "Category",
        description: "Description",
        selectCategory: "Select Category",
        hotel: "Hotel",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        view: "View/Attraction",
        play: "Activity/Play",
        event: "Event/活動",
        shopping: "Shopping",
        cancel: "Cancel",
        addEventBtn: "Add Event",
        backToHome: "Back to Home",
        editEvent: "Edit",
        deleteEvent: "Delete",
        viewEvent: "View",
        editMode: "Edit Mode",
        noEvents: "No events yet",
        noEventsHint: "Click on the map or tap \"Add Event\" to create one",
        eventsCount: "events",
        english: "English",
        chinese: "繁體中文",
        refreshMap: "Refresh Map",
        clearAllEvents: "Clear All Events",
        confirmClear: "Are you sure you want to clear all events?",
        enterEventName: "Enter event name",
        enterLocation: "Enter location",
        addNotes: "Add notes about this event"
    },
    'zh-TW': {
        navbarTitle: "我的行程規劃器",
        welcome: "歡迎使用您的行程規劃工具",
        chooseTrip: "開始創建新行程或從我們的模板中選擇",
        tripOptions: "選擇您的行程",
        japanToyama: "4 天日本富山之旅",
        exploreToyama: "探索美麗的富山縣",
        customTrip: "自訂行程",
        createItinerary: "創建您自己的行程",
        tripSchedule: "我的行程",
        addEvent: "新增活動",
        eventName: "活動名稱",
        location: "地點",
        time: "時間",
        category: "類別",
        description: "描述",
        selectCategory: "選擇類別",
        hotel: "飯店",
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        view: "景點",
        play: "活動",
        event: "活動/Event",
        shopping: "購物",
        cancel: "取消",
        addEventBtn: "新增活動",
        backToHome: "返回首頁",
        editEvent: "編輯",
        deleteEvent: "刪除",
        viewEvent: "查看",
        editMode: "編輯模式",
        noEvents: "尚無活動",
        noEventsHint: "點擊地圖或輕觸「新增活動」來建立",
        eventsCount: "個活動",
        english: "English",
        chinese: "繁體中文",
        refreshMap: "重新整理地圖",
        clearAllEvents: "清除所有活動",
        confirmClear: "確定要清除所有活動嗎？",
        enterEventName: "輸入活動名稱",
        enterLocation: "輸入地點",
        addNotes: "為此活動添加備註"
    }
};

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
}

// Show empty state
function showEmptyState() {
    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">📍</span>
            <p>${translations[currentLang].noEvents}</p>
            <p class="empty-hint">${translations[currentLang].noEventsHint}</p>
        </div>
    `;
    updateEventCount();
}

// Update event count
function updateEventCount() {
    const eventCountEl = document.getElementById('event-count');
    const count = events.length;
    eventCountEl.textContent = `${count} ${translations[currentLang].eventsCount}`;
}

// Render events to the schedule list
function renderEvents() {
    const eventsList = document.getElementById('events-list');
    
    if (events.length === 0) {
        showEmptyState();
        return;
    }
    
    eventsList.innerHTML = '';

    events.forEach((event, index) => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item category-${event.category}`;
        
        const formattedTime = formatEventTime(event.time);
        const categoryText = translations[currentLang][event.category];
        
        eventEl.innerHTML = `
            <strong>${event.name}</strong>
            <p>📍 ${event.location}</p>
            <p>🕐 ${formattedTime}</p>
            <span class="category-label">${categoryText}</span>
        `;
        
        // Add click to view event
        eventEl.addEventListener('click', () => {
            viewEvent(index);
        });
        
        eventsList.appendChild(eventEl);
    });

    updateEventCount();
}

// Add a new event
function addEvent(name, location, time, description, category, latlng) {
    // Ensure latlng is properly defined
    if (!latlng) {
        latlng = { lat: 22.3193, lng: 114.1694 };
    }
    
    // Only store 'location' object, no duplicate 'latLng' array
    events.push({
        name,
        venue: location, // Use venue field for display name
        location: { lat: latlng.lat, lng: latlng.lng },
        time,
        description,
        category
        // Note: Only 'location' object is stored, no duplicate 'latLng' array
    });
    saveEvents();
    renderEvents();
    addMarker([latlng.lat, latlng.lng], name, category);
    updateDateDropdown();
}

// View event in read-only mode
function viewEvent(index) {
    currentEditIndex = index;
    const event = events[index];
    const modal = document.getElementById('event-detail-modal');
    const t = translations[currentLang];
    
    // Focus map on the event location
    if (event.latLng && map) {
        map.setView(event.latLng, 15);
    }
    
    // Set category badge
    const categoryBadge = document.getElementById('detail-category-badge');
    categoryBadge.textContent = t[event.category];
    categoryBadge.style.background = eventCategories[event.category].color;
    
    // Populate detail fields
    document.getElementById('detail-event-name').textContent = event.name;
    document.getElementById('detail-location').textContent = event.location;
    document.getElementById('detail-time').textContent = formatEventTime(event.time);
    document.getElementById('detail-description').textContent = event.description || '-';
    
    // Setup buttons
    const editBtn = document.getElementById('edit-detail-event');
    const deleteBtn = document.getElementById('delete-detail-event');
    
    editBtn.onclick = () => {
        modal.classList.add('hidden');
        editEvent(index);
    };
    
    deleteBtn.onclick = () => {
        if (confirm(t.confirmClear || 'Delete this event?')) {
            modal.classList.add('hidden');
            deleteEvent(index);
        }
    };
    
    // Show modal
    modal.classList.remove('hidden');
}

// Edit an existing event
function editEvent(index) {
    const event = events[index];
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('event-form');
    const t = translations[currentLang];
    
    modalTitle.textContent = t.editEvent;
    
    // Populate form with existing data
    document.getElementById('event-name').value = event.name;
    document.getElementById('event-location').value = event.location;
    document.getElementById('event-category').value = event.category;
    document.getElementById('event-description').value = event.description || '';
    
    // Parse the event time and set the dropdowns
    const eventDate = new Date(event.time);
    const dateStr = eventDate.toISOString().split('T')[0];
    const timeStr = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Set date dropdown
    const dateSelect = document.getElementById('event-date-select');
    const timeSelect = document.getElementById('event-time-select');
    
    // Check if the date option exists, if not add it
    let dateOptionExists = false;
    for (let i = 0; i < dateSelect.options.length; i++) {
        if (dateSelect.options[i].value === dateStr) {
            dateOptionExists = true;
            break;
        }
    }
    if (!dateOptionExists) {
        const option = document.createElement('option');
        option.value = dateStr;
        option.textContent = eventDate.toLocaleDateString(currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        dateSelect.appendChild(option);
    }
    dateSelect.value = dateStr;
    timeSelect.value = timeStr;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Setup confirm button
    const confirmBtn = document.getElementById('confirm-add');
    confirmBtn.textContent = t.editEvent;
    confirmBtn.onclick = () => {
        const name = document.getElementById('event-name').value;
        const location = document.getElementById('event-location').value;
        const selectedDate = document.getElementById('event-date-select').value;
        const selectedTime = document.getElementById('event-time-select').value;
        const description = document.getElementById('event-description').value;
        const category = document.getElementById('event-category').value;
        
        // Combine date and time
        const time = `${selectedDate}T${selectedTime}`;

        if (name && location && time && category) {
            events[index] = {
                name,
                location,
                time,
                description,
                category,
                latLng: event.latLng || [22.3193, 114.1694]
            };
            saveEvents();
            renderEvents();
            
            // Update marker
            const marker = markers.find(m => m.options.title === event.name);
            if (marker) {
                marker.setPopupContent(createPopupContent(events[index]));
                marker.options.title = name;
            }
            
            modal.classList.add('hidden');
            form.reset();
            updateDateDropdown();
        } else {
            alert('Please fill in all required fields');
        }
    };
}

// Delete an event
function deleteEvent(index) {
    const event = events[index];
    
    // Remove marker
    const markerIndex = markers.findIndex(m => m.options.title === event.name);
    if (markerIndex !== -1) {
        map.removeLayer(markers[markerIndex]);
        markers.splice(markerIndex, 1);
    }

    // Remove event
    events.splice(index, 1);
    saveEvents();
    renderEvents();
    updateDateDropdown();
}

// Clear all events
function clearAllEvents() {
    const t = translations[currentLang];
    if (confirm(t.confirmClear)) {
        // Remove all markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        // Clear events
        events = [];
        saveEvents();
        renderEvents();
        updateDateDropdown();
    }
}

// Create Google Maps-style pin icon
function createPinIcon(category) {
    const color = eventCategories[category]?.color || '#667eea';
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="marker-pin" style="color: ${color};">
                <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
                    <circle cx="15" cy="15" r="7" fill="white"/>
                </svg>
            </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
    });
}

// Add marker to map with Google Maps-style pin
function addMarker(location, title, category, eventData = null) {
    if (!location) {
        location = [22.3193, 114.1694];
    }
    
    if (!eventData) {
        eventData = events.find(event => event.name === title);
    }
    
    const marker = L.marker(location, { 
        title: title,
        icon: createPinIcon(category)
    }).addTo(map);
    
    const popupContent = createPopupContent(eventData || { name: title, location, category });
    marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 250,
        autoClose: false,
        closeOnClick: false
    });
    
    marker.on('mouseover', function() {
        this.openPopup();
    });
    
    marker.on('click', function() {
        this.openPopup();
    });
    
    markers.push(marker);
    return marker;
}

// Create popup content with event details
function createPopupContent(event) {
    const t = translations[currentLang];
    const categoryText = t[event.category] || event.category;
    return `
        <div class="popup-content">
            <h4 class="popup-title">${event.name}</h4>
            <p class="popup-location">📍 ${event.location}</p>
            <p class="popup-time">🕐 ${formatEventTime(event.time)}</p>
            <span class="popup-category" style="background-color: ${eventCategories[event.category].color};">${categoryText}</span>
            <button class="popup-view-btn" data-event-index="${events.findIndex(e => e.name === event.name)}">${t.viewEvent}</button>
        </div>
    `;
}

// Format event time for display
function formatEventTime(time) {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleString(currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize the map
function initMap() {
    const hongKong = [22.3193, 114.1694];

    map = L.map('map').setView(hongKong, 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e) => {
        openAddEventForm(e.latlng);
    });

    loadEvents();

    events.forEach(event => {
        if (event.latLng) {
            addMarker(event.latLng, event.name, event.category);
        }
    });

    // Popup view button listener
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('popup-view-btn')) {
            const eventIndex = parseInt(e.target.dataset.eventIndex);
            if (!isNaN(eventIndex) && events[eventIndex]) {
                viewEvent(eventIndex);
            }
        }
    });
}

// Open event creation form
function openAddEventForm(latlng) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('event-form');
    const t = translations[currentLang];
    
    modalTitle.textContent = t.addEvent;
    
    // Reset form
    form.reset();
    document.getElementById('event-location').value = `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;
    
    // Populate date dropdown
    populateEventDateDropdown();
    
    // Setup confirm button
    const confirmBtn = document.getElementById('confirm-add');
    confirmBtn.textContent = t.addEventBtn;
    confirmBtn.onclick = () => {
        const name = document.getElementById('event-name').value;
        const location = document.getElementById('event-location').value;
        const selectedDate = document.getElementById('event-date-select').value;
        const selectedTime = document.getElementById('event-time-select').value;
        const description = document.getElementById('event-description').value;
        const category = document.getElementById('event-category').value;
        
        // Combine date and time
        const time = `${selectedDate}T${selectedTime}`;

        if (name && location && selectedDate && selectedTime && category) {
            addEvent(name, location, time, description, category, latlng);
            modal.classList.add('hidden');
            form.reset();
            updateDateDropdown();
        } else {
            alert('Please fill in all required fields');
        }
    };
    
    modal.classList.remove('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize bottom navigation first
    initBottomNav();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Setup scroll behavior for auto-hide header
    setupScrollBehavior();
    
    // Load saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== currentLang) {
        setLanguage(savedLang);
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
    initMap();

    // Add event button
    document.getElementById('add-event-btn').addEventListener('click', () => {
        openAddEventForm(map.getCenter());
    });

    // Back button in planner
    document.getElementById('back-to-trips')?.addEventListener('click', () => {
        showTripListView();
    });

    // Settings page
    setupSettingsPage();

    // Home page
    setupHomePage();

    // Date filter
    setupDateFilter();

    // Category filter
    setupCategoryFilter();
    
    // Filter toggle
    setupFilterToggle();

    // Modal close handlers
    document.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
            document.getElementById('event-form').reset();
        });
    });

    populateDateDropdown();
    
    // Map search
    setupMapSearch();
    
    // Custom trip date selection
    setupCustomTripDates();
    
    // DateTime dropdowns
    setupDateTimeDropdowns();
    
    // Load saved trips and update UI
    loadSavedTrips();
    updateTripsVisibility();
});

// Show trip list view (default view in Schedules page)
function showTripListView() {
    document.getElementById('trip-list-view').classList.remove('hidden');
    document.getElementById('trip-planner-view').classList.add('hidden');
}

// Show trip planner view (when a trip is selected)
function showTripPlannerView() {
    document.getElementById('trip-list-view').classList.add('hidden');
    document.getElementById('trip-planner-view').classList.remove('hidden');
    
    // Refresh map after showing planner
    setTimeout(() => {
        if (map) {
            map.invalidateSize();
        }
    }, 100);
}

// Update trips visibility based on saved trips
function updateTripsVisibility() {
    const savedTripsSection = document.getElementById('saved-trips-section');
    const noTripsState = document.getElementById('no-trips-state');
    
    // Filter custom trips (with valid IDs)
    const customTrips = savedTrips.filter(trip => trip.id && trip.id.startsWith('trip_'));
    
    if (customTrips.length === 0) {
        savedTripsSection.classList.add('hidden');
        noTripsState.classList.remove('hidden');
    } else {
        savedTripsSection.classList.remove('hidden');
        noTripsState.classList.add('hidden');
    }
}

// Setup menu functionality
function setupMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const navItems = document.querySelectorAll('.mobile-nav-item');
    const t = translations[currentLang];

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileNavMenu.classList.toggle('hidden');
    });

    closeMenu.addEventListener('click', () => {
        mobileNavMenu.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!mobileNavMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            mobileNavMenu.classList.add('hidden');
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            handleMenuAction(action);
            mobileNavMenu.classList.add('hidden');
        });
    });
}

// Handle menu actions
function handleMenuAction(action) {
    const t = translations[currentLang];
    switch(action) {
        case 'home':
            showHomePage();
            break;
        case 'refresh':
            if (map) {
                map.invalidateSize();
            }
            break;
        case 'clear':
            clearAllEvents();
            break;
    }
}

// Setup language toggle
function setupLanguageToggle() {
    const langBtn = document.getElementById('language-toggle-btn');
    const langDropdown = document.getElementById('language-dropdown');
    
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });
    
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.dataset.lang;
            setLanguage(lang);
            langDropdown.classList.add('hidden');
        });
    });
    
    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
    });
}

// Set language
function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // Save language preference
    localStorage.setItem('language', lang);
    
    // Update page titles
    const schedulesHeader = document.querySelector('#schedules-page .page-header h1');
    if (schedulesHeader) schedulesHeader.textContent = t.navbarTitle;
    
    const addTripHeader = document.querySelector('#add-trip-page .page-header h1');
    if (addTripHeader) addTripHeader.textContent = t.customTrip;
    
    // Update empty state
    const emptyHint = document.querySelector('.empty-hint');
    if (emptyHint) emptyHint.textContent = t.noEventsHint;
    
    // Update trip options
    const tripOptionsHeader = document.querySelector('.trip-options h3');
    if (tripOptionsHeader) tripOptionsHeader.textContent = t.tripOptions;
    
    // Update template card
    const templateTitle = document.querySelector('[data-template="japan-toyama"] h4');
    if (templateTitle) templateTitle.textContent = t.japanToyama;
    
    const templateSubtitle = document.querySelector('[data-template="japan-toyama"] p');
    if (templateSubtitle) templateSubtitle.textContent = t.exploreToyama;
    
    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = t.addEvent;
    
    // Update form labels
    const eventNameLabel = document.querySelector('label[for="event-name"]');
    if (eventNameLabel) eventNameLabel.innerHTML = `<span class="required">*</span> ${t.eventName}`;
    
    const eventLocationLabel = document.querySelector('label[for="event-location"]');
    if (eventLocationLabel) eventLocationLabel.innerHTML = `<span class="required">*</span> ${t.location}`;
    
    // Update datetime group label
    const datetimeLabel = document.querySelector('.datetime-group > label');
    if (datetimeLabel) datetimeLabel.innerHTML = `<span class="required">*</span> ${t.time}`;
    
    const eventCategoryLabel = document.querySelector('label[for="event-category"]');
    if (eventCategoryLabel) eventCategoryLabel.innerHTML = `<span class="required">*</span> ${t.category}`;
    
    const eventDescLabel = document.querySelector('label[for="event-description"]');
    if (eventDescLabel) eventDescLabel.textContent = t.description;
    
    // Update placeholders
    const eventNameInput = document.getElementById('event-name');
    if (eventNameInput) eventNameInput.placeholder = t.enterEventName;
    
    const eventLocationInput = document.getElementById('event-location');
    if (eventLocationInput) eventLocationInput.placeholder = t.enterLocation;
    
    const eventDescInput = document.getElementById('event-description');
    if (eventDescInput) eventDescInput.placeholder = t.addNotes;
    
    // Update category options
    const categoryOptions = {
        '': t.selectCategory,
        'hotel': `🏨 ${t.hotel}`,
        'breakfast': `🍳 ${t.breakfast}`,
        'lunch': `🍱 ${t.lunch}`,
        'dinner': `🍛 ${t.dinner}`,
        'view': `🏞️ ${t.view}`,
        'play': `🎡 ${t.play}`,
        'transportation': `🚌 ${t.transportation || 'Transportation'}`,
        'event': `🎉 ${t.event || 'Event'}`,
        'shopping': `🛍️ ${t.shopping || 'Shopping'}`
    };
    
    Object.entries(categoryOptions).forEach(([value, text]) => {
        const option = document.querySelector(`#event-category option[value="${value}"]`);
        if (option) option.textContent = text;
    });
    
    // Update filter category options
    const filterCategorySelect = document.getElementById('category-filter-select');
    if (filterCategorySelect) {
        filterCategorySelect.innerHTML = `
            <option value="">All Categories</option>
            <option value="hotel">${t.hotel}</option>
            <option value="breakfast">${t.breakfast}</option>
            <option value="lunch">${t.lunch}</option>
            <option value="dinner">${t.dinner}</option>
            <option value="view">${t.view}</option>
            <option value="play">${t.play}</option>
            <option value="transportation">${t.transportation || 'Transportation'}</option>
            <option value="event">${t.event || 'Event'}</option>
            <option value="shopping">${t.shopping || 'Shopping'}</option>
        `;
    }
    
    // Update new trip modal
    const newTripModalTitle = document.getElementById('new-trip-modal-title');
    if (newTripModalTitle) newTripModalTitle.textContent = t.customTrip;
    
    const tripNameLabel = document.querySelector('label[for="trip-name-input"]');
    if (tripNameLabel) tripNameLabel.innerHTML = `<span class="required">*</span> ${t.eventName}`;
    
    // Update button texts
    const confirmAddBtn = document.getElementById('confirm-add');
    if (confirmAddBtn) confirmAddBtn.textContent = t.addEventBtn;
    
    const cancelAddBtn = document.getElementById('cancel-new-trip');
    if (cancelAddBtn) cancelAddBtn.textContent = t.cancel;
    
    const confirmNewTripBtn = document.getElementById('confirm-new-trip');
    if (confirmNewTripBtn) confirmNewTripBtn.textContent = t.addEventBtn;
    
    // Update empty state
    showEmptyState();
    
    // Re-render events
    renderEvents();
    
    // Update markers popups
    markers.forEach(marker => {
        const event = events.find(e => e.name === marker.options.title);
        if (event) {
            marker.setPopupContent(createPopupContent(event));
        }
    });
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Setup home page
function setupHomePage() {
    // Japan Toyama template button - now opens preview modal
    document.querySelector('[data-template="japan-toyama"] .select-template')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openTemplatePreview('japan-toyama');
    });
    
    // Also allow clicking the whole template card
    document.querySelector('[data-template="japan-toyama"]')?.addEventListener('click', () => {
        openTemplatePreview('japan-toyama');
    });
    
    // Handle custom trip creation - show modal (main button)
    document.getElementById('create-custom-trip-main')?.addEventListener('click', (e) => {
        e.stopPropagation();
        openNewTripModal();
    });
    
    // Load saved trips
    loadSavedTrips();
}

// Open template preview modal
function openTemplatePreview(templateId) {
    const template = getTemplateData(templateId);
    if (!template) return;
    
    const modal = document.getElementById('template-preview-modal');
    const form = document.getElementById('save-template-form');
    
    // Set template info
    document.getElementById('template-display-name').textContent = template.name;
    document.getElementById('template-display-desc').textContent = template.description;
    document.getElementById('template-duration').textContent = `${template.days} days`;
    document.getElementById('template-events-count').textContent = `${template.events.length} events`;
    
    // Render template events preview
    const eventsList = document.getElementById('template-events-list');
    eventsList.innerHTML = template.events.map((event, index) => {
        const dayNum = Math.min(index + 1, template.days);
        return `
            <div class="template-event-item">
                <span class="template-event-day">Day ${dayNum}</span>
                <div class="template-event-info">
                    <strong>${event.name}</strong>
                    <span>${event.location}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Set default dates
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + template.days - 1);
    
    document.getElementById('template-start-date').value = today.toISOString().split('T')[0];
    document.getElementById('template-end-date').value = endDate.toISOString().split('T')[0];
    document.getElementById('template-trip-name').value = template.name;
    
    // Store current template
    window.currentTemplateId = templateId;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Handle form submission
    form.onsubmit = (e) => {
        e.preventDefault();
        
        const tripName = document.getElementById('template-trip-name').value.trim();
        const startDate = document.getElementById('template-start-date').value;
        const endDate = document.getElementById('template-end-date').value;
        
        if (tripName && startDate && endDate) {
            createTripFromTemplate(templateId, tripName, startDate, endDate);
            modal.classList.add('hidden');
        }
    };
    
    // Cancel button
    document.getElementById('cancel-template').onclick = () => {
        modal.classList.add('hidden');
    };
}

// Get template data
function getTemplateData(templateId) {
    const templates = {
        'japan-toyama': {
            name: '富山 4日間の旅',
            description: '4-Day Japan Toyama Trip',
            days: 4,
            events: [
                { name: 'Arrival in Toyama', location: 'Toyama Station', category: 'hotel', time: '10:00', latLng: [36.6997, 137.2152] },
                { name: 'Tateyama Kurobe Alpine Route', location: 'Tateyama Ropeway', category: 'view', time: '08:00', latLng: [36.5833, 137.5833] },
                { name: 'Shirakawa-go', location: 'Shirakawa-go', category: 'view', time: '09:00', latLng: [36.2667, 136.9167] },
                { name: 'Toyama Bay and Departure', location: 'Toyama Bay', category: 'dinner', time: '14:00', latLng: [36.8, 137.3833] }
            ]
        }
    };
    return templates[templateId] || null;
}

// Create trip from template with date mapping
function createTripFromTemplate(templateId, tripName, startDate, endDate) {
    const template = getTemplateData(templateId);
    if (!template) return;
    
    const tripId = 'trip_' + Date.now();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate trip duration
    const tripDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Map template events to selected dates
    const mappedEvents = template.events.map((event, index) => {
        // Calculate event day (0-indexed)
        let eventDay = index;
        
        // If event day exceeds trip duration, put on last day
        if (eventDay >= tripDays) {
            eventDay = tripDays - 1;
        }
        
        // Calculate event date
        const eventDate = new Date(start);
        eventDate.setDate(eventDate.getDate() + eventDay);
        
        // Combine date and time
        const [hours, minutes] = event.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        return {
            name: event.name,
            location: event.location,
            time: eventDate.toISOString(),
            description: event.description || '',
            category: event.category,
            latLng: event.latLng
        };
    });
    
    // Create the trip
    currentTrip = {
        id: tripId,
        name: tripName,
        template: templateId,
        startDate: startDate,
        endDate: endDate,
        events: mappedEvents
    };
    
    // Save to saved trips
    savedTrips.push(currentTrip);
    saveTrips();
    
    // Set events for display
    events = [...mappedEvents];
    
    // Switch to schedules page and show trip planner
    switchPage('schedules');
    showTripPlannerView();
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Update trip title
    updateTripTitle();
    
    // Render events
    renderEvents();
    
    // Add markers
    events.forEach(event => {
        if (event.latLng) {
            addMarker(event.latLng, event.name, event.category);
        }
    });
    
    // Center map on first event or Toyama
    if (events.length > 0 && events[0].latLng) {
        map.setView(events[0].latLng, 10);
    } else {
        map.setView([36.6997, 137.2152], 10);
    }
    
    // Update date dropdown
    populateEventDateDropdown();
    updateDateDropdown();
    
    // Update trips visibility
    updateTripsVisibility();
    renderSavedTrips();
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Open new trip modal
function openNewTripModal() {
    const modal = document.getElementById('new-trip-modal');
    const form = document.getElementById('new-trip-form');
    const startDateInput = document.getElementById('trip-start-date-input');
    const endDateInput = document.getElementById('trip-end-date-input');
    
    // Reset form
    form.reset();
    
    // Set default dates (today and +7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    startDateInput.value = today.toISOString().split('T')[0];
    endDateInput.value = nextWeek.toISOString().split('T')[0];
    endDateInput.min = startDateInput.value;
    
    // Update end date min when start date changes
    startDateInput.onchange = () => {
        endDateInput.min = startDateInput.value;
        if (new Date(endDateInput.value) < new Date(startDateInput.value)) {
            endDateInput.value = startDateInput.value;
        }
    };
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Handle form submission
    form.onsubmit = (e) => {
        e.preventDefault();
        
        const tripName = document.getElementById('trip-name-input').value.trim();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (tripName && startDate && endDate) {
            createCustomTrip(tripName, startDate, endDate);
            modal.classList.add('hidden');
        }
    };
    
    // Cancel button
    document.getElementById('cancel-new-trip').onclick = () => {
        modal.classList.add('hidden');
    };
}

// Create custom trip
function createCustomTrip(name, startDate, endDate) {
    const tripId = 'trip_' + Date.now();
    
    currentTrip = {
        id: tripId,
        name: name,
        template: 'custom',
        startDate: startDate,
        endDate: endDate,
        events: []
    };
    
    // Save to saved trips
    savedTrips.push(currentTrip);
    saveTrips();
    
    // Show trip planner
    showTripPlanner();
    
    // Clear existing events and markers
    events = [];
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Update trip title with name and date range
    updateTripTitle();
    
    // Render empty state
    renderEvents();
    showEmptyState();
    
    // Center map on default location
    map.setView([22.3193, 114.1694], 12);
}

// Update trip title with name and date range
function updateTripTitle() {
    const tripTitle = document.getElementById('trip-title');
    if (currentTrip.startDate && currentTrip.endDate) {
        const start = new Date(currentTrip.startDate);
        const end = new Date(currentTrip.endDate);
        const options = { month: 'short', day: 'numeric' };
        const dateRange = `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
        tripTitle.innerHTML = `${currentTrip.name} <small style="opacity: 0.8; font-weight: 400; display: block; font-size: 12px;">${dateRange}</small>`;
    } else {
        tripTitle.textContent = currentTrip.name;
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

// Render saved trips on home page
function renderSavedTrips() {
    const savedTripsSection = document.getElementById('saved-trips-section');
    const savedTripsList = document.getElementById('saved-trips-list');
    
    // Filter out template trips (only show custom trips with valid IDs)
    const customTrips = savedTrips.filter(trip => trip.id && trip.id.startsWith('trip_'));
    
    if (customTrips.length === 0) {
        savedTripsSection.classList.add('hidden');
        return;
    }
    
    savedTripsSection.classList.remove('hidden');
    
    savedTripsList.innerHTML = customTrips.map(trip => {
        const startDate = trip.startDate ? new Date(trip.startDate) : null;
        const endDate = trip.endDate ? new Date(trip.endDate) : null;
        
        let dateStr = '';
        if (startDate && endDate) {
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            dateStr = `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
        }
        
        const eventCount = trip.events ? trip.events.length : 0;
        const eventText = eventCount === 1 ? '1 event' : `${eventCount} events`;
        
        return `
            <div class="saved-trip-card" data-trip-id="${trip.id}">
                <div class="saved-trip-info">
                    <div class="saved-trip-name">${trip.name}</div>
                    ${dateStr ? `<div class="saved-trip-dates">📅 ${dateStr}</div>` : ''}
                    <div class="saved-trip-events">${eventText}</div>
                </div>
                <div class="saved-trip-actions">
                    <button class="trip-action-btn trip-continue-btn" data-action="continue" title="Continue Trip">▶</button>
                    <button class="trip-action-btn trip-delete-btn" data-action="delete" title="Delete Trip">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event handlers for trip actions
    savedTripsList.querySelectorAll('.saved-trip-card').forEach(card => {
        const tripId = card.dataset.tripId;
        
        // Click on card to continue
        card.querySelector('.trip-continue-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            continueTrip(tripId);
        });
        
        // Delete trip
        card.querySelector('.trip-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTrip(tripId);
        });
        
        // Click on card info to continue
        card.querySelector('.saved-trip-info').addEventListener('click', () => {
            continueTrip(tripId);
        });
    });
}

// Continue an existing trip
function continueTrip(tripId) {
    const trip = savedTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Set current trip
    currentTrip = { ...trip };
    events = trip.events ? [...trip.events] : [];
    
    // Save as current trip
    localStorage.setItem('currentTripId', tripId);
    
    // Show trip planner
    showTripPlanner();
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Update trip title
    updateTripTitle();
    
    // Render events
    renderEvents();
    
    // Add markers for events
    events.forEach(event => {
        if (event.latLng) {
            addMarker(event.latLng, event.name, event.category);
        }
    });
    
    // Center map on first event or default location
    if (events.length > 0 && events[0].latLng) {
        map.setView(events[0].latLng, 12);
    } else {
        map.setView([22.3193, 114.1694], 12);
    }
    
    // Show empty state if no events
    if (events.length === 0) {
        showEmptyState();
    }
}

// Delete a trip
function deleteTrip(tripId) {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    // Remove from saved trips
    savedTrips = savedTrips.filter(t => t.id !== tripId);
    
    // Save to localStorage
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    
    // If this was the current trip, clear it
    if (currentTrip.id === tripId) {
        currentTrip = {
            id: null,
            name: 'My Trip',
            template: null,
            startDate: null,
            endDate: null,
            events: []
        };
        events = [];
        localStorage.removeItem('currentTripId');
    }
    
    // Re-render saved trips
    renderSavedTrips();
}

// Save events and update trip
function saveEvents() {
    localStorage.setItem('tripEvents', JSON.stringify(events));
    
    // Also save to current trip
    if (currentTrip.id) {
        currentTrip.events = [...events];
        saveTrips();
    }
}

// Select template
function selectTemplate(template) {
    const t = translations[currentLang];
    
    if (template === 'japan-toyama') {
        currentTrip = {
            name: t.japanToyama,
            template: 'japan-toyama',
            events: getJapanToyamaItinerary()
        };
        showTripPlanner();
        loadTemplateEvents();
        map.setView([36.6997, 137.2152], 12);
    } else if (template === 'custom') {
        currentTrip = {
            name: t.customTrip,
            template: 'custom',
            events: []
        };
        showTripPlanner();
        events = [];
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        map.setView([22.3193, 114.1694], 12);
        renderEvents();
        showEmptyState();
    }
}

// Get Japan Toyama itinerary
function getJapanToyamaItinerary() {
    return [
        {
            name: 'Day 1: Arrival in Toyama',
            location: 'Toyama Station',
            time: '2024-04-01T10:00',
            description: 'Arrive at Toyama Station and check into hotel.',
            category: 'hotel',
            latLng: [36.6997, 137.2152]
        },
        {
            name: 'Day 2: Tateyama Kurobe Alpine Route',
            location: 'Tateyama Ropeway',
            time: '2024-04-02T08:00',
            description: 'Experience the famous Alpine Route with stunning mountain views.',
            category: 'view',
            latLng: [36.5833, 137.5833]
        },
        {
            name: 'Day 3: Shirakawa-go',
            location: 'Shirakawa-go',
            time: '2024-04-03T09:00',
            description: 'Visit the UNESCO World Heritage site.',
            category: 'view',
            latLng: [36.2667, 136.9167]
        },
        {
            name: 'Day 4: Toyama Bay and Departure',
            location: 'Toyama Bay',
            time: '2024-04-04T14:00',
            description: 'Enjoy fresh seafood at the bay before departing.',
            category: 'dinner',
            latLng: [36.8, 137.3833]
        }
    ];
}

// Load template events
function loadTemplateEvents() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    events = [...currentTrip.events];
    renderEvents();
    
    events.forEach(event => {
        if (event.latLng) {
            addMarker(event.latLng, event.name, event.category);
        }
    });
    
    document.getElementById('trip-title').textContent = currentTrip.name;
    updateDateDropdown();
}

// Show home page (trip list view in schedules page)
function showHomePage() {
    showTripListView();
}

// Show trip planner
function showTripPlanner() {
    showTripPlannerView();
}

// Setup date filter
function setupDateFilter() {
    document.getElementById('date-filter-select').addEventListener('change', filterEventsByDate);
}

// Setup category filter
function setupCategoryFilter() {
    document.getElementById('category-filter-select').addEventListener('change', filterEventsByCategory);
}

// Filter by date
function filterEventsByDate() {
    const selectedDate = document.getElementById('date-filter-select').value;
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.time).toISOString().split('T')[0];
        return selectedDate === '' || eventDate === selectedDate;
    });
    renderFilteredEvents(filteredEvents);
}

// Filter by category
function filterEventsByCategory() {
    const selectedCategory = document.getElementById('category-filter-select').value;
    const filteredEvents = events.filter(event => {
        return selectedCategory === '' || event.category === selectedCategory;
    });
    renderFilteredEvents(filteredEvents);
}

// Populate date dropdown
function populateDateDropdown() {
    const dateSelect = document.getElementById('date-filter-select');
    const dates = Array.from(new Set(events.map(event => {
        return new Date(event.time).toISOString().split('T')[0];
    }))).sort();

    dateSelect.innerHTML = '<option value="">All Dates</option>';
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateSelect.appendChild(option);
    });
}

// Update date dropdown
function updateDateDropdown() {
    populateDateDropdown();
}

// Render filtered events
function renderFilteredEvents(filteredEvents) {
    const eventsList = document.getElementById('events-list');
    
    if (filteredEvents.length === 0) {
        showEmptyState();
        return;
    }
    
    eventsList.innerHTML = '';

    filteredEvents.forEach((event, filteredIndex) => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item category-${event.category}`;
        
        const formattedTime = formatEventTime(event.time);
        const categoryText = translations[currentLang][event.category];
        
        // Find the actual index in the full events array
        const actualIndex = events.findIndex(e => 
            e.name === event.name && 
            e.time === event.time && 
            e.category === event.category
        );
        
        eventEl.innerHTML = `
            <strong>${event.name}</strong>
            <p>📍 ${event.location}</p>
            <p>🕐 ${formattedTime}</p>
            <span class="category-label">${categoryText}</span>
        `;
        
        eventEl.addEventListener('click', () => {
            if (actualIndex !== -1) {
                viewEvent(actualIndex);
            }
        });
        
        eventsList.appendChild(eventEl);
    });
    
    updateEventCount();
}

// Setup filter toggle functionality
function setupFilterToggle() {
    const filterToggle = document.getElementById('filter-toggle');
    const filtersPanel = document.getElementById('filters-panel');
    
    filterToggle.addEventListener('click', () => {
        filtersPanel.classList.toggle('collapsed');
        filterToggle.classList.toggle('expanded');
    });
}

// Setup map search functionality
function setupMapSearch() {
    const searchInput = document.getElementById('map-search-input');
    const searchBtn = document.getElementById('map-search-btn');
    const searchResultsEl = document.getElementById('search-results');
    
    let debounceTimer;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                searchLocation(query);
            } else {
                searchResultsEl.classList.add('hidden');
            }
        }, 300);
    });
    
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            searchLocation(query);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                searchLocation(query);
            }
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResultsEl.contains(e.target)) {
            searchResultsEl.classList.add('hidden');
        }
    });
}

// Search location using Photon API (better CORS support)
async function searchLocation(query) {
    const searchResultsEl = document.getElementById('search-results');
    
    try {
        // Use Photon API which has better CORS support
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            searchResults = data.features.map(feature => ({
                name: feature.properties.name || feature.properties.city || 'Unknown',
                address: formatPhotonAddress(feature.properties),
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0]
            }));
            displaySearchResults(searchResults);
        } else {
            searchResultsEl.innerHTML = '<div class="search-result-item"><span class="search-result-name">No results found</span></div>';
            searchResultsEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResultsEl.innerHTML = '<div class="search-result-item"><span class="search-result-name">Search error. Please try again.</span></div>';
        searchResultsEl.classList.remove('hidden');
    }
}

// Format Photon address properties
function formatPhotonAddress(props) {
    const parts = [];
    if (props.name) parts.push(props.name);
    if (props.street) parts.push(props.street);
    if (props.housenumber) parts.push(props.housenumber);
    if (props.city) parts.push(props.city);
    if (props.state) parts.push(props.state);
    if (props.country) parts.push(props.country);
    return parts.join(', ') || props.name || 'Unknown location';
}

// Display search results
function displaySearchResults(results) {
    const searchResultsEl = document.getElementById('search-results');
    
    searchResultsEl.innerHTML = results.map((result, index) => `
        <div class="search-result-item" data-index="${index}">
            <div class="search-result-name">${result.name}</div>
            <div class="search-result-address">${result.address}</div>
        </div>
    `).join('');
    
    searchResultsEl.classList.remove('hidden');
    
    // Add click handlers to results
    searchResultsEl.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            const result = searchResults[index];
            if (result) {
                map.setView([result.lat, result.lng], 15);
                searchResultsEl.classList.add('hidden');
                document.getElementById('map-search-input').value = result.name;
                
                // Open add event form at this location
                openAddEventForm({ lat: result.lat, lng: result.lng });
            }
        });
    });
}

// Setup custom trip date selection
function setupCustomTripDates() {
    // This function is no longer needed as the modal handles date selection
    // Keeping for backwards compatibility
}

// Setup date/time dropdowns with 15-minute intervals
function setupDateTimeDropdowns() {
    const dateSelect = document.getElementById('event-date-select');
    const timeSelect = document.getElementById('event-time-select');
    
    // Generate time options with 15-minute intervals
    function generateTimeOptions() {
        timeSelect.innerHTML = '<option value="">Select Time</option>';
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayHour = hour % 12 || 12;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
                const option = document.createElement('option');
                option.value = timeStr;
                option.textContent = displayTime;
                timeSelect.appendChild(option);
            }
        }
    }
    
    generateTimeOptions();
}

// Setup settings page
function setupSettingsPage() {
    // Language selection
    const langOptions = document.querySelectorAll('.settings-option[data-lang]');
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            setLanguage(lang);
            
            // Update active state
            langOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.querySelector('.check-icon').classList.add('hidden');
            });
            option.classList.add('active');
            option.querySelector('.check-icon').classList.remove('hidden');
        });
    });
    
    // Clear all data button
    document.getElementById('clear-all-data')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
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
            updateTripsVisibility();
            renderSavedTrips();
            alert('All data has been cleared.');
        }
    });
}

// Populate date dropdown based on trip dates
function populateEventDateDropdown() {
    const dateSelect = document.getElementById('event-date-select');
    dateSelect.innerHTML = '<option value="">Select Date</option>';
    
    if (currentTrip.startDate && currentTrip.endDate) {
        const start = new Date(currentTrip.startDate);
        const end = new Date(currentTrip.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const option = document.createElement('option');
            const dateStr = d.toISOString().split('T')[0];
            option.value = dateStr;
            option.textContent = d.toLocaleDateString(currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            dateSelect.appendChild(option);
        }
    } else {
        // Default: generate next 30 days
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() + i);
            const option = document.createElement('option');
            const dateStr = d.toISOString().split('T')[0];
            option.value = dateStr;
            option.textContent = d.toLocaleDateString(currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            dateSelect.appendChild(option);
        }
    }
}

// Setup scroll behavior for auto-hide header in trip planner
function setupScrollBehavior() {
    const plannerView = document.getElementById('trip-planner-view');
    const plannerHeader = plannerView?.querySelector('.planner-header');
    
    if (!plannerHeader) return;
    
    let lastScrollTop = 0;
    let scrollThreshold = 10; // Minimum scroll before hiding
    
    // Listen to window scroll
    window.addEventListener('scroll', () => {
        // Only apply when trip planner view is visible
        if (plannerView.classList.contains('hidden')) return;
        
        const currentScrollTop = window.scrollY;
        
        // Check if scrolling down and past threshold
        if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
            // Scrolling down - hide header
            plannerHeader.classList.add('hidden-header');
        } else {
            // Scrolling up - show header
            plannerHeader.classList.remove('hidden-header');
        }
        
        lastScrollTop = currentScrollTop;
    });
}
