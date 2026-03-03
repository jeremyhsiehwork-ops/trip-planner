// Map Module - Map initialization and marker management

let map;
let markers = [];

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
    
    const events = Storage.events;
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
    const t = translations[Storage.currentLang];
    const events = Storage.events;
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

    Storage.loadEvents();

    const events = Storage.events;
    events.forEach(event => {
        if (event.latLng) {
            addMarker(event.latLng, event.name, event.category);
        }
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

// Export functions
window.MapModule = {
    initMap,
    addMarker,
    createPopupContent,
    refreshMap,
    setMapView,
    clearMarkers,
    removeMarker,
    get map() { return map; }
};
