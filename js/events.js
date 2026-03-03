// Events Module - Event CRUD operations with Multi-Step Wizard

let currentEditIndex = null;
let currentStep = 1;
let wizardData = {
    category: '',
    name: '',
    location: '',
    description: '',
    date: '',
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
        latlng = { lat: 22.3193, lng: 114.1694 };
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
    MapModule.addMarker([latlng.lat, latlng.lng], name, category);
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
    if (event.latLng && MapModule.map) {
        MapModule.map.setView(event.latLng, 15);
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

// Edit an existing event - opens wizard with pre-filled data
function editEvent(index) {
    const events = Storage.events;
    const event = events[index];
    
    currentEditIndex = index;
    
    // Pre-populate wizard data
    wizardData = {
        category: event.category,
        name: event.name,
        location: event.location,
        description: event.description || '',
        latlng: event.latLng ? { lat: event.latLng[0], lng: event.latLng[1] } : null
    };
    
    // Parse the event time
    const eventDate = new Date(event.time);
    const dateStr = eventDate.toISOString().split('T')[0];
    let hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    wizardData.date = dateStr;
    wizardData.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    wizardData.ampm = ampm;
    
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
    document.getElementById('event-location').value = wizardData.location || '';
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
    
    // Location input
    const locationInput = document.getElementById('event-location');
    locationInput.addEventListener('input', (e) => {
        wizardData.location = e.target.value;
    });
    
    // Name input
    const nameInput = document.getElementById('event-name');
    nameInput.addEventListener('input', (e) => {
        wizardData.name = e.target.value;
    });
    
    // Description input
    const descInput = document.getElementById('event-description');
    descInput.addEventListener('input', (e) => {
        wizardData.description = e.target.value;
    });
    
    // Use map location button
    document.getElementById('use-map-location').onclick = () => {
        // Toggle mini map visibility
        const miniMapContainer = document.getElementById('mini-map-container');
        miniMapContainer.classList.toggle('expanded');
    };
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

// Generate date buttons for date scroller
function generateDateButtons() {
    const dateScroller = document.getElementById('date-scroller');
    dateScroller.innerHTML = '';
    
    const currentTrip = Storage.currentTrip;
    let startDate, endDate;
    
    if (currentTrip.startDate && currentTrip.endDate) {
        startDate = new Date(currentTrip.startDate);
        endDate = new Date(currentTrip.endDate);
    } else {
        // Default: next 30 days
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
    }
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
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
        
        // Select today by default or previously selected date
        const today = new Date().toISOString().split('T')[0];
        if (wizardData.date) {
            if (dateBtn.dataset.date === wizardData.date) {
                dateBtn.classList.add('selected');
            }
        } else if (dateBtn.dataset.date === today) {
            dateBtn.classList.add('selected');
            wizardData.date = today;
        }
        
        dateBtn.addEventListener('click', () => {
            document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
            dateBtn.classList.add('selected');
            wizardData.date = dateBtn.dataset.date;
        });
        
        dateScroller.appendChild(dateBtn);
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
    
    const defaultLatLng = wizardData.latlng || { lat: 22.3193, lng: 114.1694 };
    
    miniMap = L.map('mini-map', {
        center: [defaultLatLng.lat, defaultLatLng.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(miniMap);
    
    // Add marker
    let marker = L.marker([defaultLatLng.lat, defaultLatLng.lng]).addTo(miniMap);
    
    // Click on map to set location
    miniMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        wizardData.latlng = { lat, lng };
        
        // Update marker position
        marker.setLatLng([lat, lng]);
        
        // Update location input
        document.getElementById('event-location').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        wizardData.location = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
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
    
    // Update location
    document.getElementById('review-location').textContent = wizardData.location || 'No location set';
    
    // Update date
    if (wizardData.date) {
        const date = new Date(wizardData.date);
        const dateStr = date.toLocaleDateString(Storage.currentLang === 'zh-TW' ? 'zh-TW' : 'en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('review-date').textContent = dateStr;
    } else {
        document.getElementById('review-date').textContent = 'No date selected';
    }
    
    // Update time
    const hour = document.getElementById('event-hour').textContent;
    const minute = document.getElementById('event-minute').textContent;
    const ampm = document.getElementById('event-ampm').textContent;
    document.getElementById('review-time').textContent = `${hour}:${minute} ${ampm}`;
    
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
            wizardData.location = document.getElementById('event-location').value;
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
        // Update existing event
        const events = Storage.events;
        events[currentEditIndex] = {
            name: wizardData.name,
            location: wizardData.location,
            time: fullTime,
            description: wizardData.description,
            category: wizardData.category,
            latLng: wizardData.latlng ? [wizardData.latlng.lat, wizardData.latlng.lng] : [22.3193, 114.1694]
        };
        Storage.events = events;
        Storage.saveEvents();
        renderEvents();
        
        // Update marker
        MapModule.removeMarker(wizardData.name);
        MapModule.addMarker(wizardData.latlng || [22.3193, 114.1694], wizardData.name, wizardData.category);
    } else {
        // Add new event
        addEvent(wizardData.name, wizardData.location, fullTime, wizardData.description, wizardData.category, wizardData.latlng);
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
        location: '',
        description: '',
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