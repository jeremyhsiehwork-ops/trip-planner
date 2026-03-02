// Events Module - Event CRUD operations

let currentEditIndex = null;

// Format event time for display
function formatEventTime(time) {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show empty state
function showEmptyState() {
    const eventsList = document.getElementById('events-list');
    const t = translations[Storage.currentLang];
    eventsList.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">📍</span>
            <p>${t.noEvents}</p>
            <p class="empty-hint">${t.noEventsHint}</p>
        </div>
    `;
    updateEventCount();
}

// Update event count
function updateEventCount() {
    const eventCountEl = document.getElementById('event-count');
    const t = translations[Storage.currentLang];
    const events = Storage.events;
    const count = events.length;
    eventCountEl.textContent = `${count} ${t.eventsCount}`;
}

// Render events to the schedule list
function renderEvents() {
    const eventsList = document.getElementById('events-list');
    const events = Storage.events;
    
    if (events.length === 0) {
        showEmptyState();
        return;
    }
    
    eventsList.innerHTML = '';
    const t = translations[Storage.currentLang];

    events.forEach((event, index) => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item category-${event.category}`;
        
        const formattedTime = formatEventTime(event.time);
        const categoryText = t[event.category];
        
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
    // Ensure latLng is properly defined
    if (!latlng) {
        latlng = [22.3193, 114.1694];
    }
    
    const events = Storage.events;
    events.push({
        name,
        location,
        time,
        description,
        category,
        latLng: [latlng.lat, latlng.lng]
    });
    Storage.events = events;
    Storage.saveEvents();
    renderEvents();
    Map.addMarker([latlng.lat, latlng.lng], name, category);
    updateDateDropdown();
}

// View event in read-only mode
function viewEvent(index) {
    currentEditIndex = index;
    const events = Storage.events;
    const event = events[index];
    const modal = document.getElementById('event-detail-modal');
    const t = translations[Storage.currentLang];
    
    // Focus map on the event location
    if (event.latLng && Map.map) {
        Map.map.setView(event.latLng, 15);
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
    const events = Storage.events;
    const event = events[index];
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('event-form');
    const t = translations[Storage.currentLang];
    
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
        option.textContent = eventDate.toLocaleDateString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', { 
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
            Storage.events = events;
            Storage.saveEvents();
            renderEvents();
            
            // Update marker
            Map.removeMarker(event.name);
            Map.addMarker(event.latLng, name, category, events[index]);
            
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
    const events = Storage.events;
    const event = events[index];
    
    // Remove marker
    Map.removeMarker(event.name);

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
        Map.clearMarkers();
        
        // Clear events
        Storage.events = [];
        Storage.saveEvents();
        renderEvents();
        updateDateDropdown();
    }
}

// Open event creation form
function openAddEventForm(latlng) {
    const modal = document.getElementById('event-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('event-form');
    const t = translations[Storage.currentLang];
    
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

// Populate date dropdown based on trip dates
function populateEventDateDropdown() {
    const dateSelect = document.getElementById('event-date-select');
    dateSelect.innerHTML = '<option value="">Select Date</option>';
    
    const currentTrip = Storage.currentTrip;
    
    if (currentTrip.startDate && currentTrip.endDate) {
        const start = new Date(currentTrip.startDate);
        const end = new Date(currentTrip.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const option = document.createElement('option');
            const dateStr = d.toISOString().split('T')[0];
            option.value = dateStr;
            option.textContent = d.toLocaleDateString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', { 
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
            option.textContent = d.toLocaleDateString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            dateSelect.appendChild(option);
        }
    }
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