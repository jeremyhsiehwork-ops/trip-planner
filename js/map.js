// Map Module - Map initialization and marker management

let map;
let markers = [];
let currentFilter = { date: '', category: '' };

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
function addMarker(location, title, category, eventData = null, eventIndex = null) {
    if (!location) {
        location = [22.3193, 114.1694];
    }
    
    // Check if map is initialized
    if (!map) {
        console.warn('Map not initialized, cannot add marker for:', title);
        return null;
    }
    
    const events = Storage.events;
    if (!eventData && eventIndex !== null) {
        eventData = events[eventIndex];
    }
    if (!eventData) {
        eventData = events.find(event => event.name === title);
    }
    
    const icon = createPinIcon(category);
    const marker = L.marker(location, { 
        title: title,
        icon: icon
    }).addTo(map);
    
    const popupContent = createPopupContent(eventData || { name: title, location, category }, eventIndex);
    marker.bindPopup(popupContent, {
        className: 'custom-popup',
        maxWidth: 250,
        autoClose: false,
        closeOnClick: false
    });
    
    // Store clicked state on marker
    marker.isClicked = false;
    
    marker.on('mouseover', function() {
        if (!this.isClicked) {
            this.openPopup();
        }
    });
    
    marker.on('mouseout', function() {
        if (!this.isClicked) {
            this.closePopup();
        }
    });
    
    marker.on('click', function(e) {
        e.originalEvent.stopPropagation();
        this.isClicked = true;
        this.openPopup();
    });
    
    markers.push(marker);
    return marker;
}

// Setup global map click handler to close all popups
function setupMapClickHandler() {
    map.on('click', function(e) {
        markers.forEach(marker => {
            marker.isClicked = false;
            marker.closePopup();
        });
    });
}

// Create popup content with event details
function createPopupContent(event, eventIndex = null) {
    const t = translations[Storage.currentLang];
    const categoryText = t[event.category] || event.category;
    const venueName = event.venue || event.name;
    // Use provided index or find by name (fallback)
    const index = eventIndex !== null ? eventIndex : Storage.events.findIndex(e => e.name === event.name && e.time === event.time);
    // Get category color with fallback
    const categoryColor = eventCategories[event.category]?.color || '#667eea';
    
    // Build Google Maps link - use event.googleMapLink if available, otherwise build from venue/coords
    let googleMapsLink = '#';
    const googleMapsText = t.openInGoogleMaps || 'Open in Google Maps';
    
    // Check if event has googleMapLink field (from import)
    if (event.googleMapLink && event.googleMapLink.trim()) {
        googleMapsLink = event.googleMapLink;
    } else {
        // Build Google Maps link - search by venue name first, fallback to coordinates
        let coordsForMap = null;
        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
            coordsForMap = event.location;
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            coordsForMap = { lat: event.latLng[0], lng: event.latLng[1] };
        }
        
        if (venueName && venueName.trim()) {
            // Search by venue name for more accurate results
            googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`;
        } else if (coordsForMap && coordsForMap.lat !== undefined && coordsForMap.lng !== undefined) {
            // Fallback to coordinates
            googleMapsLink = `https://www.google.com/maps?q=${coordsForMap.lat},${coordsForMap.lng}`;
        }
    }
    
    return `
        <div class="popup-content">
            <h4 class="popup-title">${event.name}</h4>
            <p class="popup-location">📍 ${venueName}</p>
            <p class="popup-time">🕐 ${formatEventTime(event.time)}</p>
            <span class="popup-category" style="background-color: ${categoryColor};">${categoryText}</span>
            <button class="popup-view-btn" data-event-index="${index}">${t.viewEvent}</button>
            <a href="${googleMapsLink}" target="_blank" class="google-maps-link" style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-accent); text-decoration: none; margin-top: 8px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                ${googleMapsText}
            </a>
        </div>
    `;
}

// Initialize the map
function initMap() {
    const hongKong = [22.3193, 114.1694];

    map = L.map('map').setView(hongKong, 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Setup global click handler for map
    setupMapClickHandler();
    
    map.on('click', (e) => {
        openAddEventForm(e.latlng);
    });

    // Popup view button listener
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('popup-view-btn')) {
            const eventIndex = parseInt(e.target.dataset.eventIndex);
            const events = Storage.events;
            if (!isNaN(eventIndex) && events[eventIndex]) {
                viewEvent(eventIndex);
            }
        }
    });
    
    // Load events and render markers after map is ready
    // This is called after events.js has loaded events from storage
    if (typeof EventsModule !== 'undefined' && EventsModule.initEvents) {
        // Wait for events module to initialize first
        EventsModule.onReady(() => {
            loadAndRenderMarkers();
        });
    } else {
        // Fallback: load after a short delay
        setTimeout(() => {
            loadAndRenderMarkers();
        }, 200);
    }
}

// Load events and render markers on map
function loadAndRenderMarkers() {
    // Clear existing markers first
    clearMarkers();
    
    const events = Storage.events || [];
    console.log('Rendering', events.length, 'events on map');
    
    const validEvents = [];
    
    events.forEach((event, index) => {
        // Support both new format (location object) and old format (latLng array)
        let latLng = null;
        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
            latLng = [event.location.lat, event.location.lng];
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            latLng = event.latLng;
        }
        if (latLng) {
            addMarker(latLng, event.name, event.category, event, index);
            validEvents.push({ event, latLng });
        }
    });
    
    // Fit map to show all markers after a short delay to ensure map is ready
    if (validEvents.length > 0) {
        setTimeout(() => {
            fitMapToMarkers();
        }, 300);
    }
}

// Fit map to show all markers with padding
function fitMapToMarkers() {
    if (!map || markers.length === 0) return;
    
    const bounds = markers.map(marker => marker.getLatLng());
    map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
    });
}

// Refresh map size
function refreshMap() {
    if (map) {
        map.invalidateSize();
    }
}

// Set map view
function setMapView(latlng, zoom) {
    if (map) {
        map.setView(latlng, zoom);
    }
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

// Remove specific marker
function removeMarker(title) {
    const markerIndex = markers.findIndex(m => m.options.title === title);
    if (markerIndex !== -1) {
        map.removeLayer(markers[markerIndex]);
        markers.splice(markerIndex, 1);
    }
}

// Filter markers by date and category
function filterMarkers(dateFilter = '', categoryFilter = '') {
    currentFilter.date = dateFilter;
    currentFilter.category = categoryFilter;
    
    // Clear existing markers
    clearMarkers();
    
    const events = Storage.events;
    const filteredMarkers = [];
    
    events.forEach((event, index) => {
        // Check date filter
        if (dateFilter) {
            const eventDate = parseEventDate(event.time);
            if (!eventDate || eventDate.toISOString().split('T')[0] !== dateFilter) {
                return;
            }
        }
        
        // Check category filter
        if (categoryFilter && event.category !== categoryFilter) {
            return;
        }
        
        // Add marker if passes filters
        let latLng = null;
        if (event.location && event.location.lat !== undefined && event.location.lng !== undefined) {
            latLng = [event.location.lat, event.location.lng];
        } else if (event.latLng && Array.isArray(event.latLng) && event.latLng.length === 2) {
            latLng = event.latLng;
        }
        if (latLng) {
            const marker = addMarker(latLng, event.name, event.category, event, index);
            if (marker) {
                filteredMarkers.push(marker);
            }
        }
    });
    
    // Fit map to filtered markers
    if (filteredMarkers.length > 0) {
        const bounds = filteredMarkers.map(marker => marker.getLatLng());
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15
        });
    } else if (dateFilter === '' && categoryFilter === '') {
        // If no filters and no markers, reset to default view
        map.setView([22.3193, 114.1694], 12);
    }
}

// Get current filter
function getCurrentFilter() {
    return { ...currentFilter };
}

// Parse event date from time string
function parseEventDate(timeStr) {
    if (!timeStr) return null;
    try {
        // Handle format like "Apr 1, 2024 09:00 AM"
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return null;
        return date;
    } catch (e) {
        return null;
    }
}

// Export functions
window.MapModule = {
    initMap,
    addMarker,
    createPopupContent,
    refreshMap,
    setMapView,
    clearMarkers,
    removeMarker,
    filterMarkers,
    getCurrentFilter,
    get map() { return map; }
};
