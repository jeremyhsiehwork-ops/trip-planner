// Events Module - Event CRUD operations with Multi-Step Wizard

let currentEditIndex = null;
let eventsReadyCallbacks = [];
let eventsInitialized = false;
let currentStep = 1;
let wizardData = {
    category: '',
    name: '',
    venue: '',
    location: '',
    description: '',
    target: '',
    targetLink: '',
    preparation: '',
    dates: [], // Multi-select dates array
    date: '',  // Single date (legacy/primary)
    time: '09:00',
    ampm: 'AM',
    latlng: null
};
let miniMap = null;
let reviewMap = null;

// Format event time for display
function formatEventTime(time) {
    if (!time) return '';
    const date = new Date(time);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];
    return `${dayName}, ${date.toLocaleString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`;
}

// Show empty state
function showEmptyState() {
    const eventsList = document.getElementById('events-list');
    const t = translations[Storage.currentLang];
    eventsList.innerHTML = `
        <div class="empty-state">
            <i data-lucide="map-pin" class="empty-icon"></i>
            <p>${t.noEvents}</p>
            <p class="empty-hint">${t.noEventsHint}</p>
        </div>
    `;
    updateEventCount();
}

// Update event count (both desktop header and mobile badge)
function updateEventCount() {
    const eventCountEl = document.getElementById('event-count');
    const mobileEventCountEl = document.getElementById('mobile-event-count');
    const t = translations[Storage.currentLang];
    const events = Storage.events;
    const count = events.length;
    
    // Update desktop header
    if (eventCountEl) {
        eventCountEl.textContent = `${count} ${t.eventsCount}`;
    }
    
    // Update mobile badge
    if (mobileEventCountEl) {
        mobileEventCountEl.textContent = count;
    }
}

// Notify callbacks when events are ready
function notifyEventsReady() {
    eventsInitialized = true;
    eventsReadyCallbacks.forEach(cb => cb());
    eventsReadyCallbacks = [];
}

// Register callback for when events are ready
function onEventsReady(callback) {
    if (eventsInitialized) {
        callback();
    } else {
        eventsReadyCallbacks.push(callback);
    }
}

// Format dates display for multi-day events
function formatEventDates(dates) {
    if (!dates || dates.length === 0) return '';
    
    if (dates.length === 1) {
        // Single date - show full format
        const date = new Date(dates[0]);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        return `${dayName}, ${date.toLocaleString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            month: 'short',
            day: 'numeric'
        })}`;
    }
    
    // Multiple dates - group by month for compact display
    const monthEvents = {};
    dates.forEach(dateStr => {
        const date = new Date(dateStr);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        if (!monthEvents[month]) monthEvents[month] = [];
        monthEvents[month].push(day);
    });
    
    // Build display string
    const parts = Object.entries(monthEvents).map(([month, days]) => {
        return `${month} ${days.join(',')}`;
    });
    return parts.join(' | ');
}

// Render events to the schedule list (both desktop and mobile bottom sheet)
function renderEvents() {
    const eventsList = document.getElementById('events-list');
    const mobileEventsList = document.getElementById('mobile-events-list');
    const events = Storage.events;
    
    if (events.length === 0) {
        showEmptyState();
        // Also update mobile list
        if (mobileEventsList) {
            const t = translations[Storage.currentLang];
            mobileEventsList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="map-pin" class="empty-icon"></i>
                    <p>${t.noEvents}</p>
                    <p class="empty-hint">${t.noEventsHint}</p>
                </div>
            `;
        }
        // Sync mobile panel with empty state
        if (typeof UI !== 'undefined' && UI.syncMobileEventsList) {
            UI.syncMobileEventsList();
        }
        return;
    }
    
    eventsList.innerHTML = '';
    if (mobileEventsList) mobileEventsList.innerHTML = '';
    const t = translations[Storage.currentLang];

    // Notify that events are ready
    notifyEventsReady();

    events.forEach((event, index) => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item category-${event.category}`;
        
        const formattedTime = formatEventTime(event.time);
        // Fallback for undefined category translations (shopping, event)
        const category = event.category || 'view';
        const categoryText = t[category] || category;
        
        // Display venue if available, otherwise show coordinates
        let displayLocation = 'Unknown';
        if (event.venue && typeof event.venue === 'string') {
            displayLocation = event.venue;
        } else if (event.location && typeof event.location === 'object' && event.location.lat !== undefined) {
            displayLocation = `${event.location.lat.toFixed(4)}, ${event.location.lng.toFixed(4)}`;
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            displayLocation = `${event.latLng[0].toFixed(4)}, ${event.latLng[1].toFixed(4)}`;
        }
        
        // Format dates display - show all selected dates in compact format
        let datesDisplay = '';
        let timeOnly = '';
        
        // Check if event has dates array (new format) or use single date from time (legacy)
        if (event.dates && event.dates.length > 0) {
            datesDisplay = formatEventDates(event.dates);
        } else {
            // Fallback: extract date from event.time
            const dateMatch = event.time.match(/^(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                const date = new Date(dateMatch[1]);
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = dayNames[date.getDay()];
                const month = date.toLocaleString('en-US', { month: 'short' });
                const day = date.getDate();
                datesDisplay = `${dayName}, ${month} ${day}`;
            }
        }
        
        // Extract only time (HH:MM AM/PM) from formattedTime or event.time
        const timeMatch = formattedTime.match(/(\d{1,2}:\d{2}\s*[AP]M)/);
        if (timeMatch) {
            timeOnly = timeMatch[1];
        } else {
            // Fallback: extract time from event.time directly
            const timeDirectMatch = event.time.match(/T(\d{2}):(\d{2})/);
            if (timeDirectMatch) {
                const [, hourStr, minStr] = timeDirectMatch;
                let hour = parseInt(hourStr);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                timeOnly = `${hour}:${minStr} ${ampm}`;
            }
        }
        
        eventEl.innerHTML = `
            <strong>${event.name}</strong>
            <p>📍 ${displayLocation}</p>
            <p>📅 ${datesDisplay}</p>
            <p>🕐 ${timeOnly}</p>
            <span class="category-label">${categoryText}</span>
        `;
        
        // Add click to view event
        eventEl.addEventListener('click', () => {
            viewEvent(index);
        });
        
        eventsList.appendChild(eventEl);
        
        // Also add to mobile events list
        if (mobileEventsList) {
            const mobileEventEl = eventEl.cloneNode(true);
            mobileEventEl.addEventListener('click', () => {
                viewEvent(index);
            });
            mobileEventsList.appendChild(mobileEventEl);
        }
    });

    updateEventCount();
    
    // Sync mobile panel with desktop list
    if (typeof UI !== 'undefined' && UI.syncMobileEventsList) {
        UI.syncMobileEventsList();
    }
}

// Add a new event
function addEvent(name, venue, time, description, category, latlng, target = '', targetLink = '', preparation = '') {
    // Ensure latLng is properly defined
    if (!latlng) {
        latlng = { lat: 22.3193, lng: 114.1694 };
    }
    
    const events = Storage.events;
    const newEvent = {
        name,
        venue,
        location: { lat: latlng.lat, lng: latlng.lng },
        time,
        description,
        category,
        target,
        targetLink,
        preparation
        // Note: Only 'location' object is stored, no duplicate 'latLng' array
    };
    events.push(newEvent);
    Storage.events = events;
    Storage.saveEvents();
    renderEvents();
    // Pass the event index (events.length - 1) to the marker
    // Convert location object to array format for Leaflet map
    MapModule.addMarker([latlng.lat, latlng.lng], name, category, newEvent, events.length - 1);
    updateDateDropdown();
}

// View event in read-only mode
function viewEvent(index) {
    currentEditIndex = index;
    const events = Storage.events;
    const event = events[index];
    const modal = document.getElementById('event-detail-modal');
    const t = translations[Storage.currentLang];
    
    // Focus map on the event location - prioritize 'location' object, fallback to 'latLng' array for backward compatibility
    let latLng = null;
    if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
        latLng = [event.location.lat, event.location.lng];
    } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
        latLng = event.latLng;
    }
    if (latLng && MapModule.map) {
        MapModule.map.setView(latLng, 15);
    }
    
    // Set category badge
    const categoryBadge = document.getElementById('detail-category-badge');
    const category = event.category || 'view';
    const categoryInfo = eventCategories[category] || { color: '#667eea', icon: '📍' };
    categoryBadge.textContent = t[category] || category;
    categoryBadge.style.background = categoryInfo.color;
    
    // Populate detail fields
    document.getElementById('detail-event-name').textContent = event.name;
    
    // Venue field
    const venueEl = document.getElementById('detail-venue');
    const venueItem = venueEl.closest('.detail-item');
    if (event.venue) {
        venueEl.textContent = event.venue;
        venueItem.classList.remove('hidden');
    } else {
        venueItem.classList.add('hidden');
    }
    
    // DateTime field
    document.getElementById('detail-time').textContent = formatEventTime(event.time);
    
    // Target field with link
    const targetEl = document.getElementById('detail-target');
    const targetItem = document.getElementById('detail-target-item');
    const targetLinkEl = document.getElementById('detail-target-link');
    const targetLinkTextEl = document.getElementById('detail-target-link-text');
    if (event.target) {
        targetEl.textContent = event.target;
        targetItem.classList.remove('hidden');
        if (event.targetLink) {
            targetLinkEl.href = event.targetLink;
            targetLinkEl.classList.remove('hidden');
            targetLinkTextEl.textContent = t.viewReference || 'View Reference';
        } else {
            targetLinkEl.classList.add('hidden');
        }
    } else {
        targetItem.classList.add('hidden');
    }
    
    // Description field
    const descriptionEl = document.getElementById('detail-description');
    const descriptionItem = descriptionEl.closest('.detail-item');
    if (event.description) {
        descriptionEl.textContent = event.description;
        descriptionItem.classList.remove('hidden');
    } else {
        descriptionItem.classList.add('hidden');
    }
    
    // Preparation field
    const preparationEl = document.getElementById('detail-preparation');
    const preparationItem = document.getElementById('detail-preparation-item');
    if (event.preparation) {
        preparationEl.textContent = event.preparation;
        preparationItem.classList.remove('hidden');
    } else {
        preparationItem.classList.add('hidden');
    }
    
    // Setup Google Maps link - use event.googleMapLink if available (from import), otherwise build from venue/coords
    const googleMapsLink = document.getElementById('detail-google-maps-link');
    const googleMapsText = document.getElementById('detail-google-maps-text');
    
    // Check if event has googleMapLink field (from import)
    if (event.googleMapLink && event.googleMapLink.trim()) {
        googleMapsLink.href = event.googleMapLink;
    } else {
        // Build Google Maps link - search by venue name first, fallback to coordinates
        let coordsForMap = null;
        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
            coordsForMap = event.location;
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            coordsForMap = { lat: event.latLng[0], lng: event.latLng[1] };
        }
        
        if (event.venue && event.venue.trim()) {
            // Search by venue name for more accurate results
            googleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`;
        } else if (coordsForMap && coordsForMap.lat !== undefined && coordsForMap.lng !== undefined) {
            // Fallback to coordinates
            googleMapsLink.href = `https://www.google.com/maps?q=${coordsForMap.lat},${coordsForMap.lng}`;
        } else {
            googleMapsLink.href = '#';
        }
    }
    googleMapsLink.classList.remove('hidden');
    
    // Set Google Maps link text with translation
    if (googleMapsText) {
        googleMapsText.textContent = t.openInGoogleMaps || 'Open in Google Maps';
    }
    
    // Hide the coordinates location field (not user-friendly)
    const locationItem = document.getElementById('detail-location').closest('.detail-item');
    locationItem.classList.add('hidden');
    
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
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Edit an existing event - opens wizard with pre-filled data
function editEvent(index) {
    const events = Storage.events;
    const event = events[index];
    
    currentEditIndex = index;
    
    // Get location coordinates for the map with safe parsing
    let latLng = null;
    if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
        latLng = event.location;
    } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
        latLng = { lat: event.latLng[0], lng: event.latLng[1] };
    }
    
    // Parse the event time
    const eventDate = new Date(event.time);
    const dateStr = eventDate.toISOString().split('T')[0];
    let hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    // Pre-populate wizard data with all fields
    // Support both new format (dates array) and legacy format (single date)
    const eventDates = event.dates || (dateStr ? [dateStr] : []);
    
    wizardData = {
        category: event.category,
        name: event.name,
        venue: event.venue || '',
        location: latLng ? `Lat: ${latLng.lat.toFixed(4)}, Lng: ${latLng.lng.toFixed(4)}` : '',
        description: event.description || '',
        target: event.target || '',
        targetLink: event.targetLink || '',
        preparation: event.preparation || '',
        dates: eventDates, // Multi-select dates
        date: eventDates[0] || dateStr, // Primary date (first selected)
        time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        ampm: ampm,
        latlng: latLng
    };
    
    // Open wizard
    openAddEventForm(wizardData.latlng, true);
}

// Delete an event
function deleteEvent(index) {
    const events = Storage.events;
    const event = events[index];
    
    // Remove marker
    MapModule.removeMarker(event.name);

    // Remove event
    events.splice(index, 1);
    Storage.events = events;
    Storage.saveEvents();
    renderEvents();
    updateDateDropdown();
}

// Clear all events
function clearAllEvents() {
    const t = translations[Storage.currentLang];
    if (confirm(t.confirmClear)) {
        // Remove all markers
        MapModule.clearMarkers();
        
        // Clear events
        Storage.events = [];
        Storage.saveEvents();
        renderEvents();
        updateDateDropdown();
    }
}

// ============================================
// MULTI-STEP WIZARD FUNCTIONS
// ============================================

// Open event creation form (wizard)
function openAddEventForm(latlng, isEdit = false) {
    const modal = document.getElementById('event-modal');
    const t = translations[Storage.currentLang];
    
    // Set initial latlng if provided
    if (latlng && !isEdit && latlng.lat !== undefined && latlng.lng !== undefined) {
        wizardData.latlng = latlng;
        wizardData.location = `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;
    }
    
    // Reset to step 1
    currentStep = 1;
    
    // Update modal title
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = isEdit ? t.editEvent : t.addEvent;
    
    // Initialize wizard
    updateWizardUI();
    setupWizardEventListeners();
    generateDateButtons();
    
    // If editing, pre-select category
    if (isEdit && wizardData.category) {
        selectCategory(wizardData.category);
        prefillFormFields();
    }
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Initialize mini map after modal is visible
    setTimeout(() => {
        initMiniMap();
    }, 100);
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Prefill form fields for editing
function prefillFormFields() {
    document.getElementById('event-name').value = wizardData.name || '';
    document.getElementById('event-venue').value = wizardData.venue || '';
    document.getElementById('event-location').value = wizardData.location || '';
    document.getElementById('event-target').value = wizardData.target || '';
    document.getElementById('event-target-link').value = wizardData.targetLink || '';
    document.getElementById('event-preparation').value = wizardData.preparation || '';
    document.getElementById('event-description').value = wizardData.description || '';
    
    // Set time display
    const [hour, minute] = wizardData.time.split(':');
    document.getElementById('event-hour').textContent = hour;
    document.getElementById('event-minute').textContent = minute;
    document.getElementById('event-ampm').textContent = wizardData.ampm;
}

// Update wizard UI based on current step
function updateWizardUI() {
    // Update progress bar
    const progressFill = document.getElementById('wizard-progress-fill');
    progressFill.style.width = `${(currentStep / 4) * 100}%`;
    
    // Update step indicators
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update step content visibility
    document.querySelectorAll('.wizard-step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`.wizard-step-content[data-step="${currentStep}"]`).classList.add('active');
    
    // Update buttons
    const backBtn = document.getElementById('wizard-back');
    const nextBtn = document.getElementById('wizard-next');
    const submitBtn = document.getElementById('wizard-submit');
    const cancelBtn = document.getElementById('wizard-cancel');
    
    if (currentStep === 1) {
        backBtn.classList.add('hidden');
        cancelBtn.classList.remove('hidden');
    } else {
        backBtn.classList.remove('hidden');
        cancelBtn.classList.add('hidden');
    }
    
    if (currentStep === 4) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        updateReviewCard();
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

// Setup wizard event listeners
function setupWizardEventListeners() {
    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            selectCategory(category);
        });
    });
    
    // Navigation buttons
    document.getElementById('wizard-back').onclick = goToPreviousStep;
    document.getElementById('wizard-next').onclick = goToNextStep;
    document.getElementById('wizard-cancel').onclick = closeWizard;
    document.getElementById('wizard-submit').onclick = submitEvent;
    
    // Close modal buttons
    document.getElementById('close-modal').onclick = closeWizard;
    document.querySelector('#event-modal .modal-overlay').onclick = closeWizard;
    
    // Time picker
    setupTimePickerListeners();
    
    // Date scroller buttons
    document.getElementById('date-scroll-left').onclick = () => scrollDates(-1);
    document.getElementById('date-scroll-right').onclick = () => scrollDates(1);
    
    // Quick time buttons
    document.querySelectorAll('.quick-time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const time = btn.dataset.time;
            const [hour, minute] = time.split(':');
            document.getElementById('event-hour').textContent = hour;
            document.getElementById('event-minute').textContent = minute;
            document.getElementById('event-ampm').textContent = 'AM';
            
            // Update selection UI
            document.querySelectorAll('.quick-time-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // Venue input
    const venueInput = document.getElementById('event-venue');
    venueInput.addEventListener('input', (e) => {
        wizardData.venue = e.target.value;
    });
    
    // Venue search functionality
    setupVenueSearch();
    
    // Location input (coordinates display)
    const locationInput = document.getElementById('event-location');
    locationInput.addEventListener('input', (e) => {
        wizardData.location = e.target.value;
    });
    
    // Name input
    const nameInput = document.getElementById('event-name');
    nameInput.addEventListener('input', (e) => {
        wizardData.name = e.target.value;
    });
    
    // Target input
    const targetInput = document.getElementById('event-target');
    targetInput.addEventListener('input', (e) => {
        wizardData.target = e.target.value;
    });
    
    // Target link input
    const targetLinkInput = document.getElementById('event-target-link');
    targetLinkInput.addEventListener('input', (e) => {
        wizardData.targetLink = e.target.value;
    });
    
    // Preparation input
    const preparationInput = document.getElementById('event-preparation');
    preparationInput.addEventListener('input', (e) => {
        wizardData.preparation = e.target.value;
    });
    
    // Description input
    const descInput = document.getElementById('event-description');
    descInput.addEventListener('input', (e) => {
        wizardData.description = e.target.value;
    });
}

// Select a category
function selectCategory(category) {
    wizardData.category = category;
    
    // Update UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
    });
    const categoryCard = document.querySelector(`.category-card[data-category="${category}"]`);
    if (categoryCard) {
        categoryCard.classList.add('selected');
    }
}

// Setup time picker listeners
function setupTimePickerListeners() {
    // Hour controls
    document.querySelector('[data-target="event-hour-up"]').onclick = () => {
        let hour = parseInt(document.getElementById('event-hour').textContent);
        hour = hour >= 12 ? 1 : hour + 1;
        document.getElementById('event-hour').textContent = hour.toString().padStart(2, '0');
        clearQuickTimeSelection();
    };
    
    document.querySelector('[data-target="event-hour-down"]').onclick = () => {
        let hour = parseInt(document.getElementById('event-hour').textContent);
        hour = hour <= 1 ? 12 : hour - 1;
        document.getElementById('event-hour').textContent = hour.toString().padStart(2, '0');
        clearQuickTimeSelection();
    };
    
    // Minute controls
    document.querySelector('[data-target="event-minute-up"]').onclick = () => {
        let minute = parseInt(document.getElementById('event-minute').textContent);
        minute = minute >= 45 ? 0 : minute + 15;
        document.getElementById('event-minute').textContent = minute.toString().padStart(2, '0');
        clearQuickTimeSelection();
    };
    
    document.querySelector('[data-target="event-minute-down"]').onclick = () => {
        let minute = parseInt(document.getElementById('event-minute').textContent);
        minute = minute <= 0 ? 45 : minute - 15;
        document.getElementById('event-minute').textContent = minute.toString().padStart(2, '0');
        clearQuickTimeSelection();
    };
    
    // AM/PM toggle
    document.getElementById('event-ampm').onclick = () => {
        const ampmBtn = document.getElementById('event-ampm');
        ampmBtn.textContent = ampmBtn.textContent === 'AM' ? 'PM' : 'AM';
    };
}

// Clear quick time selection
function clearQuickTimeSelection() {
    document.querySelectorAll('.quick-time-btn').forEach(b => b.classList.remove('selected'));
}

// Generate date buttons for date scroller (supports multi-select)
function generateDateButtons() {
    const dateScroller = document.getElementById('date-scroller');
    dateScroller.innerHTML = '';
    
    const currentTrip = Storage.currentTrip;
    let startDate, endDate;
    
    if (currentTrip && currentTrip.startDate && currentTrip.endDate) {
        startDate = new Date(currentTrip.startDate);
        endDate = new Date(currentTrip.endDate);
    } else {
        // Default: next 30 days
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
    }
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    let selectedDateBtn = null;
    
    // Initialize dates array if empty (for new events, select today by default)
    if (!wizardData.dates || wizardData.dates.length === 0) {
        if (wizardData.date) {
            wizardData.dates = [wizardData.date];
        } else {
            const today = new Date().toISOString().split('T')[0];
            wizardData.dates = [today];
        }
    }
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateBtn = document.createElement('button');
        dateBtn.className = 'date-btn';
        dateBtn.dataset.date = d.toISOString().split('T')[0];
        
        const dayName = dayNames[d.getDay()];
        const dateNum = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        
        dateBtn.innerHTML = `
            <span class="date-day">${dayName}</span>
            <span class="date-date">${month} ${dateNum}</span>
        `;
        
        const dateStr = dateBtn.dataset.date;
        
        // Select dates that are in wizardData.dates array
        if (wizardData.dates.includes(dateStr)) {
            dateBtn.classList.add('selected');
            if (!selectedDateBtn) selectedDateBtn = dateBtn;
        }
        
        // Toggle selection on click (multi-select)
        dateBtn.addEventListener('click', () => {
            if (wizardData.dates.includes(dateStr)) {
                // Deselect if already selected (but keep at least one date)
                if (wizardData.dates.length > 1) {
                    wizardData.dates = wizardData.dates.filter(d => d !== dateStr);
                    dateBtn.classList.remove('selected');
                }
            } else {
                // Select new date
                wizardData.dates.push(dateStr);
                dateBtn.classList.add('selected');
            }
            // Update primary date to first selected date
            wizardData.date = wizardData.dates[0];
        });
        
        dateScroller.appendChild(dateBtn);
    }
    
    // Scroll to first selected date after generating buttons
    if (selectedDateBtn) {
        setTimeout(() => {
            selectedDateBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 100);
    }
}

// Scroll dates left or right
function scrollDates(direction) {
    const dateScroller = document.getElementById('date-scroller');
    const scrollAmount = 150;
    dateScroller.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// Initialize mini map
function initMiniMap() {
    const miniMapContainer = document.getElementById('mini-map');
    if (!miniMapContainer || miniMap) return;
    
    // Default to center on existing trip events
    const defaultCenter = getTripEventsCenter() || { lat: 22.3193, lng: 114.1694 };
    const defaultLatLng = wizardData.latlng || defaultCenter;
    
    miniMap = L.map('mini-map', {
        center: [defaultLatLng.lat, defaultLatLng.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(miniMap);
    
    // Add marker if latlng is set
    let marker = null;
    if (wizardData.latlng) {
        marker = L.marker([wizardData.latlng.lat, wizardData.latlng.lng]).addTo(miniMap);
    }
    
    // Add markers for existing events
    addExistingEventsToMiniMap();
    
    // Click on map to set location
    miniMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        wizardData.latlng = { lat, lng };
        
        // Remove existing marker
        miniMap.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                miniMap.removeLayer(layer);
            }
        });
        
        // Add new marker
        marker = L.marker([lat, lng]).addTo(miniMap);
        
        // Update location input
        document.getElementById('event-location').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        wizardData.location = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    });
    
    // Setup refresh button
    setupMiniMapRefresh();
}

// Get center of existing trip events
function getTripEventsCenter() {
    const events = Storage.events || [];
    if (events.length === 0) return null;
    
    let totalLat = 0;
    let totalLng = 0;
    let count = 0;
    
    events.forEach(event => {
        let latLng = null;
        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
            latLng = event.location;
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            latLng = { lat: event.latLng[0], lng: event.latLng[1] };
        }
        
        if (latLng) {
            totalLat += latLng.lat;
            totalLng += latLng.lng;
            count++;
        }
    });
    
    if (count === 0) return null;
    
    return {
        lat: totalLat / count,
        lng: totalLng / count
    };
}

// Add existing events markers to mini map
function addExistingEventsToMiniMap() {
    const events = Storage.events || [];
    const bounds = [];
    
    events.forEach(event => {
        let latLng = null;
        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
            latLng = event.location;
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            latLng = { lat: event.latLng[0], lng: event.latLng[1] };
        }
        
        if (latLng) {
            L.circleMarker([latLng.lat, latLng.lng], {
                radius: 6,
                fillColor: '#A67C52',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(miniMap);
            bounds.push([latLng.lat, latLng.lng]);
        }
    });
    
    // Fit bounds if we have multiple events
    if (bounds.length > 1) {
        miniMap.fitBounds(bounds, { padding: [20, 20] });
    }
}

// Setup mini map refresh button
function setupMiniMapRefresh() {
    const refreshBtn = document.getElementById('mini-map-refresh');
    if (!refreshBtn || !miniMap) return;
    
    refreshBtn.addEventListener('click', () => {
        // Refresh map tiles by resetting the view
        const center = miniMap.getCenter();
        const zoom = miniMap.getZoom();
        
        // Animate button rotation
        refreshBtn.style.transform = 'rotate(360deg)';
        refreshBtn.style.transition = 'transform 0.5s ease';
        
        // Reset map view to refresh tiles
        miniMap.invalidateSize();
        
        // Reset button rotation after animation
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
        }, 500);
    });
}

// Update review card
function updateReviewCard() {
    const t = translations[Storage.currentLang];
    const categoryInfo = eventCategories[wizardData.category];
    
    // Update category badge
    const categoryBadge = document.getElementById('review-category-badge');
    categoryBadge.innerHTML = `
        <span class="review-category-icon">${categoryInfo.icon}</span>
        <span class="review-category-name">${t[wizardData.category]}</span>
    `;
    categoryBadge.style.background = categoryInfo.color;
    
    // Update event name
    document.getElementById('review-event-name').textContent = wizardData.name || 'Untitled Event';
    
    // Update venue (show venue instead of location)
    const reviewLocationEl = document.getElementById('review-location');
    reviewLocationEl.textContent = wizardData.venue || 'No venue set';
    
    // Update date - show all selected dates
    const reviewDateEl = document.getElementById('review-date');
    if (wizardData.dates && wizardData.dates.length > 0) {
        if (wizardData.dates.length === 1) {
            // Single date - show full format
            const date = new Date(wizardData.dates[0]);
            const dateStr = date.toLocaleDateString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            reviewDateEl.textContent = dateStr;
        } else {
            // Multiple dates - show compact format
            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dateStrs = wizardData.dates.map(d => {
                const date = new Date(d);
                const dayName = dayNames[date.getDay()];
                const month = date.toLocaleString('en-US', { month: 'short' });
                const day = date.getDate();
                return `${dayName}, ${month} ${day}`;
            });
            reviewDateEl.innerHTML = dateStrs.join('<br>');
        }
    } else if (wizardData.date) {
        const date = new Date(wizardData.date);
        const dateStr = date.toLocaleDateString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        reviewDateEl.textContent = dateStr;
    } else {
        reviewDateEl.textContent = 'No date selected';
    }
    
    // Update time
    const hour = document.getElementById('event-hour').textContent;
    const minute = document.getElementById('event-minute').textContent;
    const ampm = document.getElementById('event-ampm').textContent;
    document.getElementById('review-time').textContent = `${hour}:${minute} ${ampm}`;
    
    // Update target (show target in review)
    const reviewTargetContainer = document.getElementById('review-target-container');
    if (wizardData.target) {
        reviewTargetContainer.classList.remove('hidden');
        document.getElementById('review-target').textContent = wizardData.target;
    } else {
        reviewTargetContainer.classList.add('hidden');
    }
    
    // Update notes
    const notesContainer = document.getElementById('review-notes-container');
    if (wizardData.description) {
        notesContainer.classList.remove('hidden');
        document.getElementById('review-notes').textContent = wizardData.description;
    } else {
        notesContainer.classList.add('hidden');
    }
    
    // Initialize review mini map
    setTimeout(() => {
        initReviewMap();
    }, 100);
}

// Initialize review mini map
function initReviewMap() {
    const reviewMapContainer = document.getElementById('review-mini-map');
    if (!reviewMapContainer) return;
    
    // Clear existing map
    reviewMapContainer.innerHTML = '';
    
    const defaultLatLng = wizardData.latlng || { lat: 22.3193, lng: 114.1694 };
    
    if (reviewMap) {
        reviewMap.remove();
    }
    
    reviewMap = L.map('review-mini-map', {
        center: [defaultLatLng.lat, defaultLatLng.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(reviewMap);
    
    L.marker([defaultLatLng.lat, defaultLatLng.lng]).addTo(reviewMap);
}

// Go to next step
function goToNextStep() {
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }
    
    // Save data from current step
    saveStepData(currentStep);
    
    // Move to next step
    currentStep++;
    updateWizardUI();
    
    // Initialize mini map for step 2
    if (currentStep === 2) {
        setTimeout(() => {
            initMiniMap();
        }, 100);
    }
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Go to previous step
function goToPreviousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateWizardUI();
    }
}

// Validate step data
function validateStep(step) {
    const t = translations[Storage.currentLang];
    
    switch (step) {
        case 1:
            if (!wizardData.category) {
                alert('Please select a category');
                return false;
            }
            return true;
            
        case 2:
            if (!wizardData.name || !wizardData.name.trim()) {
                alert('Please enter an event name');
                return false;
            }
            if (!wizardData.location || !wizardData.location.trim()) {
                alert('Please enter a location');
                return false;
            }
            return true;
            
        case 3:
            if (!wizardData.date) {
                alert('Please select a date');
                return false;
            }
            return true;
            
        default:
            return true;
    }
}

// Save step data
function saveStepData(step) {
    switch (step) {
        case 2:
            wizardData.name = document.getElementById('event-name').value;
            wizardData.venue = document.getElementById('event-venue').value;
            wizardData.location = document.getElementById('event-location').value;
            wizardData.target = document.getElementById('event-target').value;
            wizardData.targetLink = document.getElementById('event-target-link').value;
            wizardData.preparation = document.getElementById('event-preparation').value;
            wizardData.description = document.getElementById('event-description').value;
            break;
            
        case 3:
            const hour = document.getElementById('event-hour').textContent;
            const minute = document.getElementById('event-minute').textContent;
            wizardData.time = `${hour}:${minute}`;
            wizardData.ampm = document.getElementById('event-ampm').textContent;
            break;
    }
}

// Submit event
function submitEvent() {
    // Save final step data
    saveStepData(3);
    
    // Format time for storage
    const hour = parseInt(document.getElementById('event-hour').textContent);
    const minute = parseInt(document.getElementById('event-minute').textContent);
    const ampm = document.getElementById('event-ampm').textContent;
    
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) {
        hour24 = hour + 12;
    } else if (ampm === 'AM' && hour === 12) {
        hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const fullTime = `${wizardData.date}T${timeString}`;
    
    // Add or update event
    if (currentEditIndex !== null) {
        // Update existing event - store dates array and location object
        const events = Storage.events;
        events[currentEditIndex] = {
            name: wizardData.name,
            venue: wizardData.venue,
            location: wizardData.latlng ? { lat: wizardData.latlng.lat, lng: wizardData.latlng.lng } : null,
            time: fullTime,
            dates: wizardData.dates.length > 0 ? wizardData.dates : [wizardData.date], // Store multi-select dates
            description: wizardData.description,
            category: wizardData.category,
            target: wizardData.target,
            targetLink: wizardData.targetLink,
            preparation: wizardData.preparation
        };
        Storage.events = events;
        Storage.saveEvents();
        renderEvents();
        
        // Update marker
        MapModule.removeMarker(wizardData.name);
        if (wizardData.latlng) {
            MapModule.addMarker([wizardData.latlng.lat, wizardData.latlng.lng], wizardData.name, wizardData.category);
        }
    } else {
        // Add new event with dates array
        const events = Storage.events;
        const newEvent = {
            name: wizardData.name,
            venue: wizardData.venue,
            location: wizardData.latlng ? { lat: wizardData.latlng.lat, lng: wizardData.latlng.lng } : null,
            time: fullTime,
            dates: wizardData.dates.length > 0 ? wizardData.dates : [wizardData.date], // Store multi-select dates
            description: wizardData.description,
            category: wizardData.category,
            target: wizardData.target,
            targetLink: wizardData.targetLink,
            preparation: wizardData.preparation
        };
        events.push(newEvent);
        Storage.events = events;
        Storage.saveEvents();
        renderEvents();
        MapModule.addMarker([wizardData.latlng.lat, wizardData.latlng.lng], wizardData.name, wizardData.category, newEvent, events.length - 1);
    }
    
    // Close wizard
    closeWizard();
    
    // Reset edit index
    currentEditIndex = null;
}

// Close wizard
function closeWizard() {
    const modal = document.getElementById('event-modal');
    modal.classList.add('hidden');
    
    // Reset wizard data
    wizardData = {
        category: '',
        name: '',
        venue: '',
        location: '',
        description: '',
        target: '',
        targetLink: '',
        preparation: '',
        dates: [],  // Multi-select dates array
        date: '',
        time: '09:00',
        ampm: 'AM',
        latlng: null
    };
    
    // Reset UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Clean up maps
    if (miniMap) {
        miniMap.remove();
        miniMap = null;
    }
    if (reviewMap) {
        reviewMap.remove();
        reviewMap = null;
    }
    
    // Reset form fields
    document.getElementById('event-name').value = '';
    document.getElementById('event-location').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('event-hour').textContent = '09';
    document.getElementById('event-minute').textContent = '00';
    document.getElementById('event-ampm').textContent = 'AM';
}

// Populate date dropdown (legacy function, kept for compatibility)
function populateEventDateDropdown() {
    // This is now handled by generateDateButtons() in the wizard
}

// Setup venue search functionality
function setupVenueSearch() {
    const searchInput = document.getElementById('event-venue-search');
    const searchBtn = document.getElementById('search-venue-btn');
    const resultsContainer = document.getElementById('venue-search-results');
    
    if (!searchInput || !searchBtn || !resultsContainer) return;
    
    let debounceTimer;
    
    // Search on button click
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            searchVenue(query);
        }
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                searchVenue(query);
            }
        }
    });
    
    // Search on input with debounce
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query.length >= 3) {
                searchVenue(query);
            } else {
                resultsContainer.classList.add('hidden');
            }
        }, 300);
    });
    
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
}

// Search venue using Photon API
async function searchVenue(query) {
    const resultsContainer = document.getElementById('venue-search-results');
    
    try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const venues = data.features.map(feature => ({
                name: feature.properties.name || feature.properties.city || 'Unknown',
                address: formatPhotonAddress(feature.properties),
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0]
            }));
            displayVenueSearchResults(venues);
        } else {
            resultsContainer.innerHTML = '<div class="venue-search-result-item"><span class="venue-search-result-name">No results found</span></div>';
            resultsContainer.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Venue search error:', error);
        resultsContainer.innerHTML = '<div class="venue-search-result-item"><span class="venue-search-result-name">Search error. Please try again.</span></div>';
        resultsContainer.classList.remove('hidden');
    }
}

// Format Photon address for venue search
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

// Display venue search results
function displayVenueSearchResults(venues) {
    const resultsContainer = document.getElementById('venue-search-results');
    
    resultsContainer.innerHTML = venues.map((venue, index) => `
        <div class="venue-search-result-item" data-index="${index}">
            <div class="venue-search-result-name">${venue.name}</div>
            <div class="venue-search-result-address">${venue.address}</div>
        </div>
    `).join('');
    
    resultsContainer.classList.remove('hidden');
    
    // Add click handlers to results
    resultsContainer.querySelectorAll('.venue-search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            const venue = venues[index];
            if (venue) {
                // Set venue name
                document.getElementById('event-venue').value = venue.name;
                wizardData.venue = venue.name;
                
                // Set location coordinates
                wizardData.latlng = { lat: venue.lat, lng: venue.lng };
                document.getElementById('event-location').value = `Lat: ${venue.lat.toFixed(4)}, Lng: ${venue.lng.toFixed(4)}`;
                
                // Update mini map if initialized
                if (miniMap) {
                    miniMap.setView([venue.lat, venue.lng], 15);
                    // Clear existing markers and add new one
                    miniMap.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            miniMap.removeLayer(layer);
                        }
                    });
                    L.marker([venue.lat, venue.lng]).addTo(miniMap);
                }
                
                // Hide results
                resultsContainer.classList.add('hidden');
            }
        });
    });
}

// Export functions
window.Events = {
    formatEventTime,
    showEmptyState,
    updateEventCount,
    renderEvents,
    addEvent,
    viewEvent,
    editEvent,
    deleteEvent,
    clearAllEvents,
    openAddEventForm,
    populateEventDateDropdown
};

window.EventsModule = {
    onReady: onEventsReady,
    initEvents: true
};
