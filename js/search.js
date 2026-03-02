// Search Module - Map search functionality

let searchResults = [];

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
                Map.setMapView([result.lat, result.lng], 15);
                searchResultsEl.classList.add('hidden');
                document.getElementById('map-search-input').value = result.name;
                
                // Open add event form at this location
                Events.openAddEventForm({ lat: result.lat, lng: result.lng });
            }
        });
    });
}

// Export functions
window.Search = {
    setupMapSearch,
    searchLocation,
    displaySearchResults
};