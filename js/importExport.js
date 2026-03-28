// Import/Export Module - Trip data import and export functionality

// Export current trip to JSON file
function exportTrip() {
    const currentTrip = Storage.currentTrip;
    const trips = Storage.trips;
    
    if (!currentTrip || !currentTrip.id) {
        alert('No trip selected for export');
        return;
    }
    
    // Get all data for current trip
    const tripData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        trip: currentTrip,
        events: Storage.events.filter(e => {
            // Filter events that belong to current trip (by date range)
            const tripStart = new Date(currentTrip.startDate);
            const tripEnd = new Date(currentTrip.endDate);
            const eventDate = new Date(e.time);
            return eventDate >= tripStart && eventDate <= tripEnd;
        }),
        expenses: Storage.expenses,
        checklist: Storage.checklist,
        settings: {
            persons: Storage.settings?.persons || 2,
            personNames: Storage.settings?.personNames || ['Person 1', 'Person 2'],
            defaultCurrency: Storage.settings?.defaultCurrency || 'JPY',
            exchangeRates: Storage.settings?.exchangeRates || { JPY: 0.053 }
        }
    };
    
    // Create downloadable file
    const dataStr = JSON.stringify(tripData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTrip.name.replace(/[^a-z0-9]/gi, '_')}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import from JSON file
async function importFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!validateImportData(data)) {
                    reject(new Error('Invalid import data format'));
                    return;
                }
                
                resolve(data);
            } catch (error) {
                reject(new Error('Failed to parse JSON file: ' + error.message));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

// Validate imported data structure
function validateImportData(data) {
    // Check for valid JSON import format
    if (data.trip && Array.isArray(data.events)) {
        return true;
    }
    
    // Check for trip with events inside trip object
    if (data.trip && data.trip.events && Array.isArray(data.trip.events)) {
        return true;
    }
    
    // Check for raw trip format
    if (data.name && data.startDate && data.endDate) {
        return true;
    }
    
    return false;
}

// Parse itinerary text (table format)
function parseItineraryText(text) {
    const lines = text.trim().split('\n');
    const events = [];
    const hotels = [];
    
    // Skip header line
    const dataLines = lines.slice(1);
    
    let currentDate = '';
    let currentHotel = '';
    
    // Check if header includes longitude/latitude columns
    const headerLine = lines[0].toLowerCase();
    const hasCoordinates = headerLine.includes('經度') || headerLine.includes('longitude') || headerLine.includes('緯度') || headerLine.includes('latitude');
    
    dataLines.forEach((line, index) => {
        // Split by tab or multiple spaces (2 or more)
        const columns = line.split(/[\t]{1,}| {2,}/).map(col => col.trim());
        
        // Determine expected column count based on whether coordinates are present
        const minColumns = hasCoordinates ? 8 : 6;
        if (columns.length < minColumns) return;
        
        let date, day, time, location, transport, target, hotel, lng, lat;
        
        if (hasCoordinates) {
            // New format with coordinates: Date, Day, Time, Location, Transport, Target, Hotel, Lng, Lat
            [date, day, time, location, transport, target, hotel, lng, lat] = columns;
        } else {
            // Old format without coordinates
            [date, day, time, location, transport, target, hotel] = columns;
        }
        
        // Skip empty lines
        if (!date && !time && !location) return;
        
        // Update current date if provided
        if (date) {
            currentDate = date;
        }
        
        // Update current hotel if provided
        if (hotel && hotel.trim()) {
            currentHotel = hotel.trim();
        }
        
        // Skip if no time or location
        if (!time || !location) return;
        
        // Parse date (assume 2025 for now, user can adjust)
        const [month, dayNum] = date.split('/');
        const year = 2025;
        const monthPadded = month.padStart(2, '0');
        const dayPadded = dayNum.padStart(2, '0');
        const eventDate = `${year}-${monthPadded}-${dayPadded}`;
        
        // Calculate correct day of week from the actual date
        const dateObj = new Date(year, parseInt(month) - 1, parseInt(dayNum));
        const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
        const calculatedDay = dayNames[dateObj.getDay()];
        
        // Parse time
        const timeFormatted = time.trim();
        
        // Extract location name and details
        const locationParts = location.split(/[:：]/);
        const locationName = locationParts[0].trim();
        const locationDetails = locationParts.slice(1).join(':').trim();
        
        // Determine category based on target and time
        const category = determineCategory(target, timeFormatted, location);
        
        // Extract target tags
        const targetTags = extractTargetTags(target);
        
        // Parse coordinates if available
        let latLng = null;
        if (hasCoordinates && lng && lat) {
            const parsedLng = parseFloat(lng);
            const parsedLat = parseFloat(lat);
            if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
                latLng = [parsedLat, parsedLng]; // Note: latLng array is [lat, lng]
            }
        }
        
        // Create event object - only store 'location' object, no duplicate 'latLng' array
        const event = {
            name: locationName,
            venue: locationName,
            location: latLng ? { lat: latLng[0], lng: latLng[1] } : null,
            time: `${eventDate}T${timeFormatted}:00`,
            description: `${transport || ''} ${locationDetails || ''}`.trim(),
            category: category,
            target: targetTags,
            targetLink: '',
            preparation: '',
            _importDay: calculatedDay // Store calculated day for reference
            // Note: Only 'location' object is stored, no duplicate 'latLng' array
        };
        
        events.push(event);
        
        // Add hotel event if exists - only store 'location' object, no duplicate 'latLng' array
        if (hotel && hotel.trim() && hotel !== currentHotel) {
            currentHotel = hotel.trim();
            const hotelEvent = {
                name: currentHotel,
                venue: currentHotel,
                location: latLng ? { lat: latLng[0], lng: latLng[1] } : null,
                time: `${eventDate}T15:00:00`,
                description: 'Accommodation',
                category: 'hotel',
                target: '',
                targetLink: '',
                preparation: ''
                // Note: Only 'location' object is stored, no duplicate 'latLng' array
            };
            hotels.push(hotelEvent);
        }
    });
    
    // Merge hotels into events (avoid duplicates)
    const allEvents = [...events];
    hotels.forEach(hotel => {
        const exists = allEvents.some(e => 
            e.category === 'hotel' && 
            e.time.startsWith(hotel.time.split('T')[0])
        );
        if (!exists) {
            allEvents.push(hotel);
        }
    });
    
    return allEvents;
}

// Determine event category based on target and time
function determineCategory(target, time, location) {
    const targetLower = (target || '').toLowerCase();
    const locationLower = (location || '').toLowerCase();
    
    // Check for hotel
    if (targetLower.includes('住宿') || locationLower.includes('酒店') || locationLower.includes('hotel')) {
        return 'hotel';
    }
    
    // Check for food related
    if (targetLower.includes('必食') || targetLower.includes('🍽️') || 
        targetLower.includes('早餐') || targetLower.includes('午餐') || targetLower.includes('晚餐')) {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 11) return 'breakfast';
        if (hour < 15) return 'lunch';
        return 'dinner';
    }
    
    // Check for shopping (new category)
    if (targetLower.includes('必買') || targetLower.includes('🛒') || targetLower.includes('購物') ||
        locationLower.includes('mall') || locationLower.includes('商店') || locationLower.includes('百貨') ||
        locationLower.includes('aeon') || locationLower.includes('shopping')) {
        return 'shopping';
    }
    
    // Check for event/活動 (new category)
    if (targetLower.includes('活動') || targetLower.includes('event') || targetLower.includes('祭') || 
        targetLower.includes('festival') || targetLower.includes('表演') || targetLower.includes('live') ||
        targetLower.includes('k') || targetLower.includes('karaoke')) {
        return 'event';
    }
    
    // Check for view/attraction
    if (targetLower.includes('必睇') || targetLower.includes('🌸') || targetLower.includes('vibe') ||
        targetLower.includes('景點') || targetLower.includes('公園') || targetLower.includes('美術館')) {
        return 'view';
    }
    
    // Check for activity
    if (targetLower.includes('必玩') || targetLower.includes('🎶') || targetLower.includes('體驗')) {
        return 'play';
    }
    
    // Check for transportation
    if (locationLower.includes('機場') || locationLower.includes('駅') || locationLower.includes('巴士')) {
        return 'transportation';
    }
    
    // Default to view
    return 'view';
}

// Extract target tags from text
function extractTargetTags(target) {
    if (!target) return '';
    
    // Extract emoji and key phrases
    const tags = [];
    
    if (target.includes('🍽️') || target.includes('必食')) tags.push('必食');
    if (target.includes('🛒') || target.includes('必買')) tags.push('必買');
    if (target.includes('🎶') || target.includes('音樂')) tags.push('音樂 & Vibe');
    if (target.includes('🌸') || target.includes('Vibe')) tags.push('Vibe');
    if (target.includes('🦑') || target.includes('體驗')) tags.push('體驗');
    if (target.includes('🍤')) tags.push('必食');
    if (target.includes('🍜')) tags.push('必食');
    if (target.includes('🍣')) tags.push('必食');
    if (target.includes('🥩')) tags.push('必食');
    if (target.includes('🍶')) tags.push('必食');
    
    // Add any additional text that's not emoji
    const textOnly = target.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    if (textOnly && textOnly.length > 0 && textOnly !== '必食' && textOnly !== '必買') {
        // Keep meaningful text
        const meaningfulText = textOnly.split(/[/,,]/)[0].trim();
        if (meaningfulText && !tags.includes(meaningfulText)) {
            tags.push(meaningfulText);
        }
    }
    
    return tags.join(', ');
}

// Show import modal
function showImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setupImportModalListeners();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Setup import modal listeners
function setupImportModalListeners() {
    const closeBtn = document.getElementById('close-import-modal');
    const overlay = document.querySelector('#import-modal .modal-overlay');
    const cancelBtn = document.getElementById('import-cancel');
    const fileTab = document.getElementById('import-tab-file');
    const textTab = document.getElementById('import-tab-text');
    const fileContent = document.getElementById('import-file-content');
    const textContent = document.getElementById('import-text-content');
    
    if (closeBtn) {
        closeBtn.onclick = closeImportModal;
    }
    
    if (overlay) {
        overlay.onclick = closeImportModal;
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = closeImportModal;
    }
    
    // Tab switching
    if (fileTab && textTab && fileContent && textContent) {
        fileTab.onclick = () => {
            fileTab.classList.add('active');
            textTab.classList.remove('active');
            fileContent.classList.remove('hidden');
            textContent.classList.add('hidden');
        };
        
        textTab.onclick = () => {
            textTab.classList.add('active');
            fileTab.classList.remove('active');
            textContent.classList.remove('hidden');
            fileContent.classList.add('hidden');
        };
    }
    
    // File input - trigger click when "Select File" button is clicked
    const fileInput = document.getElementById('import-file-input');
    const importFileBtn = document.getElementById('import-file-btn');
    
    if (importFileBtn && fileInput) {
        importFileBtn.onclick = () => {
            // Trigger the hidden file input click
            fileInput.click();
        };
        
        fileInput.onchange = handleFileSelect;
    }
    
    // Import text button
    const importTextBtn = document.getElementById('import-text-btn');
    if (importTextBtn) {
        importTextBtn.onclick = handleTextImport;
    }
}

// Handle file selection
async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
        const data = await importFromJSON(file);
        showImportPreview(data, 'file');
    } catch (error) {
        alert('Import error: ' + error.message);
    }
}

// Handle file import button click
function handleFileImport() {
    const fileInput = document.getElementById('import-file-input');
    if (fileInput && fileInput.files[0]) {
        handleFileSelect({ target: { files: fileInput.files } });
    } else {
        alert('Please select a file first');
    }
}

// Handle text import
function handleTextImport() {
    const textInput = document.getElementById('import-text-input');
    if (!textInput) return;
    
    const text = textInput.value.trim();
    if (!text) {
        alert('Please paste itinerary text');
        return;
    }
    
    // Get optional trip name and trip period from input fields
    const tripNameInput = document.getElementById('import-trip-name');
    const importStartDate = document.getElementById('import-start-date');
    const importEndDate = document.getElementById('import-end-date');
    
    const customTripName = tripNameInput?.value?.trim() || '';
    const customStartDate = importStartDate?.value || '';
    const customEndDate = importEndDate?.value || '';
    
    try {
        const events = parseItineraryText(text);
        if (events.length === 0) {
            alert('No events found in the text. Please check the format.');
            return;
        }
        
        // Determine date range from events
        const firstEventDate = events[0]?.time?.split('T')[0] || new Date().toISOString().split('T')[0];
        const lastEventDate = events[events.length - 1]?.time?.split('T')[0] || new Date().toISOString().split('T')[0];
        
        const previewData = {
            trip: {
                name: customTripName || 'Imported Trip',
                startDate: customStartDate || firstEventDate,
                endDate: customEndDate || lastEventDate
            },
            events: events,
            hasCustomName: !!customTripName,
            hasCustomDates: !!(customStartDate && customEndDate)
        };
        
        showImportPreview(previewData, 'text');
    } catch (error) {
        alert('Parse error: ' + error.message);
    }
}

// Show import preview
function showImportPreview(data, source) {
    const modal = document.getElementById('import-modal');
    const previewModal = document.getElementById('import-preview-modal');
    
    if (!previewModal) return;
    
    // Get events - support both data.events and data.trip.events formats
    const events = data.events && data.events.length > 0 ? data.events : (data.trip?.events || []);
    
    // Populate preview
    const tripName = document.getElementById('preview-trip-name');
    const tripDates = document.getElementById('preview-trip-dates');
    const eventCount = document.getElementById('preview-event-count');
    const eventsList = document.getElementById('preview-events-list');
    
    if (tripName) {
        tripName.textContent = data.trip?.name || 'Imported Trip';
    }
    
    if (tripDates) {
        const startDate = data.trip?.startDate || events[0]?.time?.split('T')[0] || 'N/A';
        const endDate = data.trip?.endDate || events[events.length - 1]?.time?.split('T')[0] || 'N/A';
        tripDates.textContent = `${startDate} to ${endDate}`;
    }
    
    if (eventCount) {
        eventCount.textContent = `${events?.length || 0} events`;
    }
    
    if (eventsList) {
        // Category display names for preview
        const categoryNames = {
            'hotel': 'Hotel',
            'breakfast': 'Breakfast',
            'lunch': 'Lunch',
            'dinner': 'Dinner',
            'view': 'View',
            'play': 'Activity',
            'transportation': 'Transport',
            'event': 'Event',
            'shopping': 'Shopping'
        };
        
        eventsList.innerHTML = events.slice(0, 10).map(event => {
            const category = event.category || 'view';
            const categoryDisplay = categoryNames[category] || category;
            return `
            <div class="preview-event-item">
                <span class="preview-event-date">${event.time?.split('T')[0] || 'N/A'}</span>
                <span class="preview-event-time">${event.time?.split('T')[1]?.substring(0, 5) || 'N/A'}</span>
                <span class="preview-event-name">${event.name || 'Untitled'}</span>
                <span class="preview-event-category">${categoryDisplay}</span>
            </div>
        `;
        }).join('');
        
        if (events.length > 10) {
            eventsList.innerHTML += `<div class="preview-more-hint">... and ${events.length - 10} more events</div>`;
        }
    }
    
    // Store data for confirmation - normalize events to data.events
    window.pendingImportData = { 
        data: {
            ...data,
            events: events
        }, 
        source 
    };
    
    // Show preview modal
    modal?.classList.add('hidden');
    previewModal.classList.remove('hidden');
    
    // Setup preview buttons
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    const cancelPreviewBtn = document.getElementById('cancel-preview-btn');
    
    if (confirmImportBtn) {
        confirmImportBtn.onclick = confirmImport;
    }
    
    if (cancelPreviewBtn) {
        cancelPreviewBtn.onclick = () => {
            previewModal.classList.add('hidden');
            modal?.classList.remove('hidden');
        };
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Confirm and execute import
async function confirmImport() {
    const { data, source } = window.pendingImportData || {};
    if (!data) return;
    
    try {
        // Create new trip - use 'trip_' prefix so it shows in the trip list
        const tripId = 'trip_' + Date.now();
        const newTrip = {
            id: tripId,
            name: data.trip.name || 'Imported Trip',
            template: null,
            startDate: data.trip.startDate,
            endDate: data.trip.endDate,
            events: []
        };
        
        // Process events - ensure proper format
        // Only store 'location' object, no duplicate 'latLng' array
        const processedEvents = (data.events || []).map(event => {
            // Support both old format (with latLng array) and new format (with location object)
            let location = event.location;
            
            // If event has latLng array but no location object, convert it
            if (!location && event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
                location = { lat: event.latLng[0], lng: event.latLng[1] };
            }
            
            // If event has location object but it's missing lat/lng, use defaults
            if (!location || (location && (location.lat === undefined || location.lng === undefined))) {
                location = { lat: 36.6997, lng: 137.2152 }; // Default to Toyama
            }
            
            // Return event with only 'location' object, no 'latLng' array
            // Preserve googleMapLink field from imported data
            return {
                name: event.name,
                venue: event.venue || event.name,
                location: location,
                time: event.time,
                description: event.description || '',
                category: event.category || 'view',
                target: event.target || '',
                targetLink: event.targetLink || '',
                preparation: event.preparation || '',
                googleMapLink: event.googleMapLink || ''
                // Note: Only 'location' object is stored, no duplicate 'latLng' array
            };
        });
        
        // Set events for the new trip
        newTrip.events = processedEvents;
        
        // Add to saved trips using Storage.savedTrips
        let savedTrips = Storage.savedTrips || [];
        savedTrips.push(newTrip);
        Storage.savedTrips = savedTrips;
        
        // Save to localStorage
        localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
        
        // Set as current trip
        Storage.currentTrip = newTrip;
        Storage.events = [...processedEvents];
        localStorage.setItem('currentTripId', tripId);
        
        // Save events
        Storage.saveEvents();
        
        // Close modals
        document.getElementById('import-preview-modal')?.classList.add('hidden');
        document.getElementById('import-modal')?.classList.add('hidden');
        
        // Refresh UI - update trip list and show the new trip
        if (window.Trips) {
            window.Trips.renderSavedTrips();
            window.Trips.updateTripsVisibility();
        }
        
        // Switch to trip list view to show the imported trip
        if (window.Trips) {
            window.Trips.showTripListView();
        }
        
        // Refresh map markers - use location object, convert to array format for Leaflet
        // Use setTimeout to ensure modules are ready and map is visible
        setTimeout(() => {
            // First ensure we're on the schedules page and map is visible
            if (window.Trips) {
                window.Trips.showTripPlannerView();
            }
            
            setTimeout(() => {
                if (window.MapModule) {
                    window.MapModule.clearMarkers();
                    let markersAdded = 0;
                    processedEvents.forEach((event, idx) => {
                        // Debug logging for location
                        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
                            const locArray = [event.location.lat, event.location.lng];
                            console.log('Adding marker for:', event.name, 'at', locArray, 'category:', event.category);
                            const result = window.MapModule.addMarker(locArray, event.name, event.category, event, idx);
                            if (result) {
                                markersAdded++;
                            }
                        } else {
                            console.warn('Skipping marker for', event.name, '- invalid location:', event.location);
                        }
                    });
                    console.log('Markers added:', markersAdded, 'out of', processedEvents.length, 'events');
                    // Center map on first event or default location
                    if (processedEvents.length > 0 && processedEvents[0].location) {
                        const firstEvent = processedEvents[0];
                        window.MapModule.setMapView([firstEvent.location.lat, firstEvent.location.lng], 10);
                    }
                }
                
                // Update date dropdown
                if (window.UI) {
                    window.UI.populateDateDropdown();
                }
                
                // Render events
                if (window.Events) {
                    window.Events.renderEvents();
                }
                
                // Generate filter date buttons after import
                if (window.UI) {
                    window.UI.generateFilterDateButtons();
                }
            }, 300);
        }, 200);
        
        alert('Import successful! ' + processedEvents.length + ' events imported.');
        
    } catch (error) {
        alert('Import failed: ' + error.message);
    }
}

// Close import modal
function closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Initialize import/export in settings
function setupImportExport() {
    // Add event listener for export button
    const exportBtn = document.getElementById('export-trip-btn');
    if (exportBtn) {
        exportBtn.onclick = exportTrip;
    }
    
    // Add event listener for import button
    const importBtn = document.getElementById('import-trip-btn');
    if (importBtn) {
        importBtn.onclick = showImportModal;
    }
}

// Export module functions
window.ImportExport = {
    exportTrip,
    importFromJSON,
    parseItineraryText,
    showImportModal,
    setupImportExport
};