// UI Module - User interface functions

// Set language
function setLanguage(lang) {
    Storage.currentLang = lang;
    const t = translations[lang];
    
    // Save language preference
    Storage.saveLanguage(lang);
    
    // ============================================
    // Update Navigation Labels
    // ============================================
    // Landing nav (3 buttons)
    const landingNavLabels = {
        'nav-trip-list': t.navTripList,
        'nav-add-trip': t.navAddTrip,
        'nav-settings': t.navSettings
    };
    Object.entries(landingNavLabels).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
    
    // Trip editor nav (6 buttons)
    const tripEditorNavLabels = {
        'nav-schedule': t.navSchedule,
        'nav-map': t.navMap,
        'nav-add-event': t.navAddEvent,
        'nav-track': t.navTrack,
        'nav-checklist': t.navChecklist,
        'nav-settings2': t.navSettings
    };
    Object.entries(tripEditorNavLabels).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });
    
    // ============================================
    // Update Page Headers
    // ============================================
    // Schedules page
    const schedulesHeader = document.querySelector('#schedules-page .page-header h1');
    if (schedulesHeader) schedulesHeader.textContent = t.schedulesTitle;
    const schedulesSubtitle = document.querySelector('#schedules-page .page-header p');
    if (schedulesSubtitle) schedulesSubtitle.textContent = t.schedulesSubtitle;
    
    // Checklist page
    const checklistHeader = document.querySelector('#checklist-page .page-header h1');
    if (checklistHeader) checklistHeader.textContent = t.checklistTitle;
    const checklistSubtitle = document.querySelector('#checklist-page .page-header p');
    if (checklistSubtitle) checklistSubtitle.textContent = t.checklistSubtitle;
    
    // Add Trip page
    const addTripHeader = document.querySelector('#add-trip-page .page-header h1');
    if (addTripHeader) addTripHeader.textContent = t.addTripTitle;
    const addTripSubtitle = document.querySelector('#add-trip-page .page-header p');
    if (addTripSubtitle) addTripSubtitle.textContent = t.addTripSubtitle;
    
    // Track page
    const trackHeader = document.querySelector('#track-page .page-header h1');
    if (trackHeader) trackHeader.textContent = t.trackTitle;
    const trackSubtitle = document.querySelector('#track-page .page-header p');
    if (trackSubtitle) trackSubtitle.textContent = t.trackSubtitle;
    
    // Settings page
    const settingsHeader = document.querySelector('#settings-page .page-header h1');
    if (settingsHeader) settingsHeader.textContent = t.settingsTitle;
    const settingsSubtitle = document.querySelector('#settings-page .page-header p');
    if (settingsSubtitle) settingsSubtitle.textContent = t.settingsSubtitle;
    
    // ============================================
    // Update Home/Empty State
    // ============================================
    const noTripsText = document.querySelector('#no-trips-state p:not(.empty-hint)');
    if (noTripsText) noTripsText.textContent = t.noTripsYet;
    const noTripsHint = document.querySelector('#no-trips-state .empty-hint');
    if (noTripsHint) noTripsHint.textContent = t.noTripsHint;
    
    // ============================================
    // Update Trip Options Section
    // ============================================
    const tripOptionsHeader = document.querySelector('.trip-options h3');
    if (tripOptionsHeader) tripOptionsHeader.textContent = t.tripOptions;
    const tripOptionsSubtitle = document.querySelector('.trip-options .section-subtitle');
    if (tripOptionsSubtitle) tripOptionsSubtitle.textContent = t.tripOptionsSubtitle;
    
    // Template card
    const templateTitle = document.querySelector('[data-template="japan-toyama"] h4');
    if (templateTitle) templateTitle.textContent = t.japanToyama;
    const templateSubtitle = document.querySelector('[data-template="japan-toyama"] .template-subtitle');
    if (templateSubtitle) templateSubtitle.textContent = t.exploreToyama;
    const templateSelectBtn = document.querySelector('[data-template="japan-toyama"] .select-template');
    if (templateSelectBtn) templateSelectBtn.textContent = t.select;
    
    // Create custom trip button
    const createCustomTripBtn = document.querySelector('#create-custom-trip-main span');
    if (createCustomTripBtn) createCustomTripBtn.textContent = t.createCustomTrip;
    
    // ============================================
    // Update Trip Planner
    // ============================================
    const eventsHeaderTitle = document.querySelector('.events-header h3');
    if (eventsHeaderTitle) eventsHeaderTitle.textContent = t.schedule;
    
    // ============================================
    // Update Filters
    // ============================================
    const dateFilterLabel = document.querySelector('label[for="date-filter-select"]');
    if (dateFilterLabel) dateFilterLabel.textContent = t.date;
    const categoryFilterLabel = document.querySelector('label[for="category-filter-select"]');
    if (categoryFilterLabel) categoryFilterLabel.textContent = t.category;
    
    // Update filter date options
    const dateFilterSelect = document.getElementById('date-filter-select');
    if (dateFilterSelect) {
        const firstOption = dateFilterSelect.querySelector('option:first-child');
        if (firstOption) firstOption.textContent = t.allDates;
    }
    
    // Update filter category options
    const filterCategorySelect = document.getElementById('category-filter-select');
    if (filterCategorySelect) {
        filterCategorySelect.innerHTML = `
            <option value="">${t.allCategories}</option>
            <option value="hotel">${t.hotel}</option>
            <option value="breakfast">${t.breakfast}</option>
            <option value="lunch">${t.lunch}</option>
            <option value="dinner">${t.dinner}</option>
            <option value="view">${t.view}</option>
            <option value="play">${t.play}</option>
            <option value="transportation">${t.transportation}</option>
        `;
    }
    
    // ============================================
    // Update Event Modal
    // ============================================
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = t.addEvent;
    
    // Form labels
    const eventNameLabel = document.querySelector('label[for="event-name"]');
    if (eventNameLabel) eventNameLabel.innerHTML = `<span class="required">*</span> ${t.eventName}`;
    
    const eventLocationLabel = document.querySelector('label[for="event-location"]');
    if (eventLocationLabel) eventLocationLabel.innerHTML = `<span class="required">*</span> ${t.location}`;
    
    const datetimeLabel = document.querySelector('.datetime-group > label');
    if (datetimeLabel) datetimeLabel.innerHTML = `<span class="required">*</span> ${t.dateAndTime}`;
    
    const eventCategoryLabel = document.querySelector('label[for="event-category"]');
    if (eventCategoryLabel) eventCategoryLabel.innerHTML = `<span class="required">*</span> ${t.category}`;
    
    const eventDescLabel = document.querySelector('label[for="event-description"]');
    if (eventDescLabel) eventDescLabel.textContent = t.description;
    
    // Date/Time select defaults
    const dateSelect = document.getElementById('event-date-select');
    if (dateSelect) {
        const firstOption = dateSelect.querySelector('option:first-child');
        if (firstOption) firstOption.textContent = t.selectDate;
    }
    
    const timeSelect = document.getElementById('event-time-select');
    if (timeSelect) {
        const firstOption = timeSelect.querySelector('option:first-child');
        if (firstOption) firstOption.textContent = t.selectTime;
    }
    
    // Placeholders
    const eventNameInput = document.getElementById('event-name');
    if (eventNameInput) eventNameInput.placeholder = t.enterEventName;
    
    const eventLocationInput = document.getElementById('event-location');
    if (eventLocationInput) eventLocationInput.placeholder = t.enterLocation;
    
    const eventDescInput = document.getElementById('event-description');
    if (eventDescInput) eventDescInput.placeholder = t.addNotes;
    
    // Category options
    const categoryOptions = {
        '': t.selectCategory,
        'hotel': `🏨 ${t.hotel}`,
        'breakfast': `🍳 ${t.breakfast}`,
        'lunch': `🍱 ${t.lunch}`,
        'dinner': `🍛 ${t.dinner}`,
        'view': `🏞️ ${t.view}`,
        'play': `🎡 ${t.play}`,
        'transportation': `🚌 ${t.transportation}`
    };
    
    Object.entries(categoryOptions).forEach(([value, text]) => {
        const option = document.querySelector(`#event-category option[value="${value}"]`);
        if (option) option.textContent = text;
    });
    
    // Buttons
    const cancelAddBtn = document.getElementById('cancel-add');
    if (cancelAddBtn) cancelAddBtn.textContent = t.cancel;
    
    const confirmAddBtn = document.getElementById('confirm-add');
    if (confirmAddBtn) confirmAddBtn.textContent = t.addEventBtn;
    
    // ============================================
    // Update New Trip Modal
    // ============================================
    const newTripModalTitle = document.getElementById('new-trip-modal-title');
    if (newTripModalTitle) newTripModalTitle.textContent = t.customTrip;
    
    const tripNameLabel = document.querySelector('label[for="trip-name-input"]');
    if (tripNameLabel) tripNameLabel.innerHTML = `<span class="required">*</span> ${t.tripName}`;
    
    const tripDateRangeLabel = document.querySelector('#new-trip-form .form-group:nth-child(2) > label');
    if (tripDateRangeLabel) tripDateRangeLabel.innerHTML = `<span class="required">*</span> ${t.dateRange}`;
    
    const tripStartDateLabel = document.querySelector('label[for="trip-start-date-input"]');
    if (tripStartDateLabel) tripStartDateLabel.textContent = t.startDate;
    
    const tripEndDateLabel = document.querySelector('label[for="trip-end-date-input"]');
    if (tripEndDateLabel) tripEndDateLabel.textContent = t.endDate;
    
    const tripDateSeparator = document.querySelector('#new-trip-form .date-separator');
    if (tripDateSeparator) tripDateSeparator.textContent = t.to;
    
    const cancelNewTripBtn = document.getElementById('cancel-new-trip');
    if (cancelNewTripBtn) cancelNewTripBtn.textContent = t.cancel;
    
    const confirmNewTripBtn = document.getElementById('confirm-new-trip');
    if (confirmNewTripBtn) confirmNewTripBtn.textContent = t.createTripBtn;
    
    // ============================================
    // Update Template Preview Modal
    // ============================================
    const templatePreviewTitle = document.getElementById('template-preview-title');
    if (templatePreviewTitle) templatePreviewTitle.textContent = t.templatePreview;
    
    const itineraryPreviewTitle = document.querySelector('.template-events-preview h5');
    if (itineraryPreviewTitle) itineraryPreviewTitle.textContent = t.itineraryPreview;
    
    const saveTemplateTitle = document.querySelector('.save-template-form h5');
    if (saveTemplateTitle) saveTemplateTitle.textContent = t.saveThisTrip;
    
    const templateTripNameLabel = document.querySelector('label[for="template-trip-name"]');
    if (templateTripNameLabel) templateTripNameLabel.innerHTML = `<span class="required">*</span> ${t.tripName}`;
    
    const templateDateRangeLabel = document.querySelector('#save-template-form .form-group:nth-child(2) > label');
    if (templateDateRangeLabel) templateDateRangeLabel.innerHTML = `<span class="required">*</span> ${t.dateRange}`;
    
    const templateStartDateLabel = document.querySelector('label[for="template-start-date"]');
    if (templateStartDateLabel) templateStartDateLabel.textContent = t.startDate;
    
    const templateEndDateLabel = document.querySelector('label[for="template-end-date"]');
    if (templateEndDateLabel) templateEndDateLabel.textContent = t.endDate;
    
    const templateDateSeparator = document.querySelector('#save-template-form .date-separator');
    if (templateDateSeparator) templateDateSeparator.textContent = t.to;
    
    const cancelTemplateBtn = document.getElementById('cancel-template');
    if (cancelTemplateBtn) cancelTemplateBtn.textContent = t.cancel;
    
    const saveTemplateBtn = document.getElementById('save-template');
    if (saveTemplateBtn) saveTemplateBtn.textContent = t.saveTrip;
    
    const templateTripNameInput = document.getElementById('template-trip-name');
    if (templateTripNameInput) templateTripNameInput.placeholder = t.enterTripName;
    
    // ============================================
    // Update Event Detail Modal
    // ============================================
    const detailLocationLabel = document.querySelector('#detail-location').previousElementSibling;
    if (detailLocationLabel) detailLocationLabel.textContent = t.detailLocation;
    
    const detailTimeLabel = document.querySelector('#detail-time').previousElementSibling;
    if (detailTimeLabel) detailTimeLabel.textContent = t.detailTime;
    
    const detailDescLabel = document.querySelector('#detail-description').previousElementSibling;
    if (detailDescLabel) detailDescLabel.textContent = t.detailDescription;
    
    const deleteDetailBtn = document.getElementById('delete-detail-event');
    if (deleteDetailBtn) deleteDetailBtn.textContent = t.deleteEvent;
    
    const editDetailBtn = document.getElementById('edit-detail-event');
    if (editDetailBtn) editDetailBtn.textContent = t.editEvent;
    
    // ============================================
    // Update Settings Page
    // ============================================
    const langSectionTitle = document.querySelector('.settings-section:first-child .settings-section-title');
    if (langSectionTitle) langSectionTitle.textContent = t.language + ' 言語';
    
    const dataSectionTitle = document.querySelector('.settings-section:last-child .settings-section-title');
    if (dataSectionTitle) dataSectionTitle.textContent = t.data + ' データ';
    
    const clearDataBtn = document.querySelector('#clear-all-data span');
    if (clearDataBtn) clearDataBtn.textContent = t.clearAllData;
    
    // ============================================
    // Update Placeholder Pages
    // ============================================
    const comingSoonTitle = document.querySelector('.placeholder-content h2');
    if (comingSoonTitle) comingSoonTitle.textContent = t.comingSoon;
    
    const checklistDesc = document.querySelector('#checklist-page .placeholder-content p');
    if (checklistDesc) checklistDesc.textContent = t.prepareTrip;
    
    const trackDesc = document.querySelector('#track-page .placeholder-content p');
    if (trackDesc) trackDesc.textContent = t.trackExpenses;
    
    // ============================================
    // Update Map Search
    // ============================================
    const mapSearchInput = document.getElementById('map-search-input');
    if (mapSearchInput) mapSearchInput.placeholder = t.searchLocation;
    
    // ============================================
    // Re-render Events and Empty State
    // ============================================
    Events.showEmptyState();
    Events.renderEvents();
    
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
        Trips.openTemplatePreview('japan-toyama');
    });
    
    // Also allow clicking the whole template card
    document.querySelector('[data-template="japan-toyama"]')?.addEventListener('click', () => {
        Trips.openTemplatePreview('japan-toyama');
    });
    
    // Handle custom trip creation - show modal (main button)
    document.getElementById('create-custom-trip-main')?.addEventListener('click', (e) => {
        e.stopPropagation();
        Trips.openNewTripModal();
    });
    
    // Load saved trips
    Storage.loadSavedTrips();
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
            Storage.clearAllData();
            Trips.updateTripsVisibility();
            Trips.renderSavedTrips();
            alert('All data has been cleared.');
        }
    });
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
    const events = Storage.events;
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.time).toISOString().split('T')[0];
        return selectedDate === '' || eventDate === selectedDate;
    });
    renderFilteredEvents(filteredEvents);
}

// Filter by category
function filterEventsByCategory() {
    const selectedCategory = document.getElementById('category-filter-select').value;
    const events = Storage.events;
    const filteredEvents = events.filter(event => {
        return selectedCategory === '' || event.category === selectedCategory;
    });
    renderFilteredEvents(filteredEvents);
}

// Render filtered events
function renderFilteredEvents(filteredEvents) {
    const eventsList = document.getElementById('events-list');
    
    if (filteredEvents.length === 0) {
        Events.showEmptyState();
        return;
    }
    
    const t = translations[Storage.currentLang];
    eventsList.innerHTML = '';

    filteredEvents.forEach((event) => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item category-${event.category}`;
        
        const formattedTime = Events.formatEventTime(event.time);
        const categoryText = t[event.category];
        
        eventEl.innerHTML = `
            <strong>${event.name}</strong>
            <p>📍 ${event.location}</p>
            <p>🕐 ${formattedTime}</p>
            <span class="category-label">${categoryText}</span>
        `;
        
        eventEl.addEventListener('click', () => {
            const events = Storage.events;
            const index = events.findIndex(e => e === event);
            Events.viewEvent(index);
        });
        
        eventsList.appendChild(eventEl);
    });
    
    Events.updateEventCount();
}

// Populate date dropdown
function populateDateDropdown() {
    const dateSelect = document.getElementById('date-filter-select');
    const events = Storage.events;
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

// Setup filter toggle functionality
function setupFilterToggle() {
    const filterToggle = document.getElementById('filter-toggle');
    const filtersPanel = document.getElementById('filters-panel');
    
    filterToggle.addEventListener('click', () => {
        filtersPanel.classList.toggle('collapsed');
        filterToggle.classList.toggle('expanded');
    });
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

// Show home page (trip list view in schedules page)
function showHomePage() {
    Trips.showTripListView();
}

// Export functions
window.UI = {
    setLanguage,
    setupHomePage,
    setupSettingsPage,
    setupDateFilter,
    setupCategoryFilter,
    filterEventsByDate,
    filterEventsByCategory,
    renderFilteredEvents,
    populateDateDropdown,
    updateDateDropdown,
    setupFilterToggle,
    setupDateTimeDropdowns,
    setupScrollBehavior,
    showHomePage
};