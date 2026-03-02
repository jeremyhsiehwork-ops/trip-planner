// Trips Module - Trip management

// Show trip list view (default view in Schedules page)
function showTripListView() {
    // Use Navigation to go back to trip list
    if (typeof Navigation !== 'undefined') {
        Navigation.backToTripList();
    } else {
        document.getElementById('trip-list-view').classList.remove('hidden');
        document.getElementById('trip-planner-view').classList.add('hidden');
    }
}

// Show trip planner view (when a trip is selected)
function showTripPlannerView() {
    document.getElementById('trip-list-view').classList.add('hidden');
    document.getElementById('trip-planner-view').classList.remove('hidden');
    
    // Switch to trip editor navigation
    if (typeof Navigation !== 'undefined') {
        Navigation.enterTripEditor();
    }
    
    // Refresh map after showing planner
    setTimeout(() => {
        Map.refreshMap();
    }, 100);
}

// Update trips visibility based on saved trips
function updateTripsVisibility() {
    const savedTripsSection = document.getElementById('saved-trips-section');
    const noTripsState = document.getElementById('no-trips-state');
    
    // Filter custom trips (with valid IDs)
    const savedTrips = Storage.savedTrips;
    const customTrips = savedTrips.filter(trip => trip.id && trip.id.startsWith('trip_'));
    
    if (customTrips.length === 0) {
        savedTripsSection.classList.add('hidden');
        noTripsState.classList.remove('hidden');
    } else {
        savedTripsSection.classList.remove('hidden');
        noTripsState.classList.add('hidden');
    }
}

// Render saved trips on home page
function renderSavedTrips() {
    const savedTripsSection = document.getElementById('saved-trips-section');
    const savedTripsList = document.getElementById('saved-trips-list');
    const t = translations[Storage.currentLang];
    
    // Filter out template trips (only show custom trips with valid IDs)
    const savedTrips = Storage.savedTrips;
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
            const locale = Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US';
            dateStr = `${startDate.toLocaleDateString(locale, options)} - ${endDate.toLocaleDateString(locale, options)}`;
        }
        
        const eventCount = trip.events ? trip.events.length : 0;
        const eventText = eventCount === 1 ? `1 ${t.eventsCount}` : `${eventCount} ${t.eventsCount}`;
        
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
    const savedTrips = Storage.savedTrips;
    const trip = savedTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Set current trip
    let currentTrip = Storage.currentTrip;
    currentTrip = { ...trip };
    Storage.currentTrip = currentTrip;
    Storage.events = trip.events ? [...trip.events] : [];
    
    // Save as current trip
    localStorage.setItem('currentTripId', tripId);
    
    // Show trip planner
    showTripPlanner();
    
    // Clear existing markers
    Map.clearMarkers();
    
    // Update trip title
    updateTripTitle();
    
    // Render events
    Events.renderEvents();
    
    // Add markers for events
    const events = Storage.events;
    events.forEach(event => {
        if (event.latLng) {
            Map.addMarker(event.latLng, event.name, event.category);
        }
    });
    
    // Center map on first event or default location
    if (events.length > 0 && events[0].latLng) {
        Map.setMapView(events[0].latLng, 12);
    } else {
        Map.setMapView([22.3193, 114.1694], 12);
    }
    
    // Show empty state if no events
    if (events.length === 0) {
        Events.showEmptyState();
    }
    
    // Always switch to schedule page (first nav item)
    if (typeof Navigation !== 'undefined') {
        Navigation.switchTripEditorPage('schedule-editor');
        // Reset trip editor nav to first item (Schedule)
        const tripEditorNav = document.getElementById('trip-editor-nav');
        if (tripEditorNav) {
            const navItems = tripEditorNav.querySelectorAll('.nav-item');
            navItems.forEach(nav => nav.classList.remove('active'));
            navItems[0]?.classList.add('active'); // First item (Schedule)
        }
    }
}

// Delete a trip
function deleteTrip(tripId) {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    // Remove from saved trips
    let savedTrips = Storage.savedTrips;
    savedTrips = savedTrips.filter(t => t.id !== tripId);
    Storage.savedTrips = savedTrips;
    
    // Save to localStorage
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    
    // If this was the current trip, clear it
    let currentTrip = Storage.currentTrip;
    if (currentTrip.id === tripId) {
        currentTrip = {
            id: null,
            name: 'My Trip',
            template: null,
            startDate: null,
            endDate: null,
            events: []
        };
        Storage.currentTrip = currentTrip;
        Storage.events = [];
        localStorage.removeItem('currentTripId');
    }
    
    // Re-render saved trips
    renderSavedTrips();
}

// Update trip title with name and date range
function updateTripTitle() {
    const tripTitle = document.getElementById('trip-title');
    const currentTrip = Storage.currentTrip;
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
    let currentTrip = Storage.currentTrip;
    currentTrip = {
        id: tripId,
        name: tripName,
        template: templateId,
        startDate: startDate,
        endDate: endDate,
        events: mappedEvents
    };
    Storage.currentTrip = currentTrip;
    
    // Set events for display BEFORE saving (saveTrips uses the events array)
    Storage.events = [...mappedEvents];
    
    // Save to saved trips
    let savedTrips = Storage.savedTrips;
    savedTrips.push(currentTrip);
    Storage.savedTrips = savedTrips;
    
    // Save to localStorage directly to ensure events are saved
    localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
    localStorage.setItem('currentTripId', tripId);
    
    // Switch to schedules page and show trip planner
    switchPage('schedules');
    showTripPlanner();
    
    // Clear existing markers
    Map.clearMarkers();
    
    // Update trip title
    updateTripTitle();
    
    // Render events
    Events.renderEvents();
    
    // Add markers
    const events = Storage.events;
    events.forEach(event => {
        if (event.latLng) {
            Map.addMarker(event.latLng, event.name, event.category);
        }
    });
    
    // Center map on first event or Toyama
    if (events.length > 0 && events[0].latLng) {
        Map.setMapView(events[0].latLng, 10);
    } else {
        Map.setMapView([36.6997, 137.2152], 10);
    }
    
    // Update date dropdown
    Events.populateEventDateDropdown();
    updateDateDropdown();
    
    // Update trips visibility
    updateTripsVisibility();
    renderSavedTrips();
    
    // Always switch to schedule page (first nav item)
    if (typeof Navigation !== 'undefined') {
        Navigation.switchTripEditorPage('schedule-editor');
        // Reset trip editor nav to first item (Schedule)
        const tripEditorNav = document.getElementById('trip-editor-nav');
        if (tripEditorNav) {
            const navItems = tripEditorNav.querySelectorAll('.nav-item');
            navItems.forEach(nav => nav.classList.remove('active'));
            navItems[0]?.classList.add('active'); // First item (Schedule)
        }
    }
    
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
    
    let currentTrip = Storage.currentTrip;
    currentTrip = {
        id: tripId,
        name: name,
        template: 'custom',
        startDate: startDate,
        endDate: endDate,
        events: []
    };
    Storage.currentTrip = currentTrip;
    
    // Save to saved trips
    let savedTrips = Storage.savedTrips;
    savedTrips.push(currentTrip);
    Storage.savedTrips = savedTrips;
    Storage.saveTrips();
    
    // Show trip planner
    showTripPlanner();
    
    // Clear existing events and markers
    Storage.events = [];
    Map.clearMarkers();
    
    // Update trip title with name and date range
    updateTripTitle();
    
    // Render empty state
    Events.renderEvents();
    Events.showEmptyState();
    
    // Center map on default location
    Map.setMapView([22.3193, 114.1694], 12);
    
    // Always switch to schedule page (first nav item)
    if (typeof Navigation !== 'undefined') {
        Navigation.switchTripEditorPage('schedule-editor');
        // Reset trip editor nav to first item (Schedule)
        const tripEditorNav = document.getElementById('trip-editor-nav');
        if (tripEditorNav) {
            const navItems = tripEditorNav.querySelectorAll('.nav-item');
            navItems.forEach(nav => nav.classList.remove('active'));
            navItems[0]?.classList.add('active'); // First item (Schedule)
        }
    }
}

// Show trip planner
function showTripPlanner() {
    showTripPlannerView();
}

// Select template (legacy)
function selectTemplate(template) {
    const t = translations[Storage.currentLang];
    
    if (template === 'japan-toyama') {
        let currentTrip = Storage.currentTrip;
        currentTrip = {
            name: t.japanToyama,
            template: 'japan-toyama',
            events: getJapanToyamaItinerary()
        };
        Storage.currentTrip = currentTrip;
        showTripPlanner();
        loadTemplateEvents();
        Map.setMapView([36.6997, 137.2152], 12);
    } else if (template === 'custom') {
        let currentTrip = Storage.currentTrip;
        currentTrip = {
            name: t.customTrip,
            template: 'custom',
            events: []
        };
        Storage.currentTrip = currentTrip;
        showTripPlanner();
        Storage.events = [];
        Map.clearMarkers();
        Map.setMapView([22.3193, 114.1694], 12);
        Events.renderEvents();
        Events.showEmptyState();
    }
}

// Load template events
function loadTemplateEvents() {
    Map.clearMarkers();
    
    const currentTrip = Storage.currentTrip;
    Storage.events = [...currentTrip.events];
    Events.renderEvents();
    
    const events = Storage.events;
    events.forEach(event => {
        if (event.latLng) {
            Map.addMarker(event.latLng, event.name, event.category);
        }
    });
    
    document.getElementById('trip-title').textContent = currentTrip.name;
    updateDateDropdown();
}

// Export functions
window.Trips = {
    showTripListView,
    showTripPlannerView,
    updateTripsVisibility,
    renderSavedTrips,
    continueTrip,
    deleteTrip,
    updateTripTitle,
    openTemplatePreview,
    createTripFromTemplate,
    openNewTripModal,
    createCustomTrip,
    showTripPlanner,
    selectTemplate,
    loadTemplateEvents
};