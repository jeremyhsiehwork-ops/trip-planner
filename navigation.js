// Bottom Navigation Controller with Lucide Icons

// Current navigation mode: 'landing' or 'trip-editor'
let currentNavMode = 'landing';

function initBottomNav() {
    // Setup landing nav
    const landingNav = document.getElementById('landing-nav');
    const tripEditorNav = document.getElementById('trip-editor-nav');
    
    // Landing nav items
    if (landingNav) {
        const navItems = landingNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Handle page switch
                switchPage(page);
            });
        });
    }
    
    // Trip editor nav items
    if (tripEditorNav) {
        const navItems = tripEditorNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Handle trip editor page switch
                switchTripEditorPage(page);
            });
        });
    }
    
    // Setup back-to-planner buttons
    document.querySelectorAll('.back-to-planner').forEach(btn => {
        btn.addEventListener('click', () => {
            backToPlanner();
        });
    });
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Switch between landing nav and trip editor nav
function setNavMode(mode) {
    currentNavMode = mode;
    const landingNav = document.getElementById('landing-nav');
    const tripEditorNav = document.getElementById('trip-editor-nav');
    
    if (mode === 'landing') {
        landingNav?.classList.remove('hidden');
        tripEditorNav?.classList.add('hidden');
    } else if (mode === 'trip-editor') {
        landingNav?.classList.add('hidden');
        tripEditorNav?.classList.remove('hidden');
    }
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Switch pages for landing mode
function switchPage(page) {
    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(p => p.classList.add('hidden'));
    
    // Hide shared planner header (landing mode doesn't need it)
    const sharedHeader = document.getElementById('shared-planner-header');
    if (sharedHeader) sharedHeader.classList.add('hidden');
    
    // Map page names to IDs
    const pageMap = {
        'schedules': 'schedules-page',
        'checklist': 'checklist-page',
        'addTrip': 'add-trip-page',
        'track': 'track-page',
        'settings': 'settings-page'
    };
    
    // Show selected page
    const selectedPage = document.getElementById(pageMap[page]);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }
    
    // Show trip list view (not planner view)
    const tripListView = document.getElementById('trip-list-view');
    const tripPlannerView = document.getElementById('trip-planner-view');
    if (tripListView) tripListView.classList.remove('hidden');
    if (tripPlannerView) tripPlannerView.classList.add('hidden');
    
    // Restore page headers
    document.querySelectorAll('.page-header').forEach(h => h.classList.remove('hidden'));
    
    // Refresh Lucide icons after page switch
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Switch pages for trip editor mode
function switchTripEditorPage(page) {
    // Get planner elements
    const plannerMain = document.querySelector('.planner-main');
    const mapSection = document.querySelector('.map-section');
    const eventsSection = document.querySelector('.events-section');
    const schedulesPage = document.getElementById('schedules-page');
    const tripPlannerView = document.getElementById('trip-planner-view');
    const sharedHeader = document.getElementById('shared-planner-header');
    
    // Reset visibility
    if (plannerMain) {
        plannerMain.classList.remove('hidden');
    }
    
    // Show shared planner header for all trip editor pages
    if (sharedHeader) sharedHeader.classList.remove('hidden');
    
    // Show schedules-page and trip-planner-view for schedule/map
    if (schedulesPage) schedulesPage.classList.remove('hidden');
    if (tripPlannerView) tripPlannerView.classList.remove('hidden');
    
    // Hide other pages
    document.querySelectorAll('.page-content').forEach(p => {
        if (p.id !== 'schedules-page') {
            p.classList.add('hidden');
        }
    });
    
    // Restore page headers (they may have been hidden by showFullPage)
    document.querySelectorAll('.page-header').forEach(h => h.classList.remove('hidden'));
    
    switch(page) {
        case 'schedule-editor':
            // Show events list full page
            if (mapSection) mapSection.classList.add('hidden');
            if (eventsSection) {
                eventsSection.classList.remove('hidden');
                eventsSection.style.flex = '1';
                eventsSection.style.maxWidth = '100%';
            }
            // Update mobile toggle button state
            const mobileToggleBtn = document.getElementById('mobile-events-toggle-btn');
            if (mobileToggleBtn && window.innerWidth < 1024) {
                mobileToggleBtn.classList.add('events-visible');
            }
            // Remove map-page class when not on map
            tripPlannerView?.classList.remove('map-page');
            
            // Hide mobile events panel when on schedule page
            const mobileEventsPanel = document.getElementById('mobile-events-panel');
            if (mobileEventsPanel) {
                mobileEventsPanel.classList.remove('expanded');
            }
            
            // Reset FAB state so it can open the panel on first click when returning to map
            window.mobileEventsPanelExpanded = false;
            break;
            
        case 'map-editor':
            // Show map full page - hide events section on mobile, show on desktop
            if (mapSection) {
                mapSection.classList.remove('hidden');
                mapSection.style.flex = '1';
                mapSection.classList.remove('collapsed');
            }
            // Only hide events section on mobile (desktop shows both side by side)
            if (window.innerWidth < 1024) {
                if (eventsSection) eventsSection.classList.add('hidden');
                // Update mobile toggle button state
                const mobileToggleBtn = document.getElementById('mobile-events-toggle-btn');
                if (mobileToggleBtn) {
                    mobileToggleBtn.classList.remove('events-visible');
                }
                // Add map-page class for FAB visibility on mobile
                tripPlannerView?.classList.add('map-page');
            } else {
                if (eventsSection) eventsSection.classList.remove('hidden');
                // Remove map-page class on desktop
                tripPlannerView?.classList.remove('map-page');
            }
            // Refresh map
            setTimeout(() => {
                if (window.Map && window.Map.map) {
                    window.Map.map.invalidateSize();
                }
            }, 100);
            break;
            
        case 'addEvent':
            // Open add event modal
            if (window.Events && window.Map && window.Map.map) {
                Events.openAddEventForm(window.Map.map.getCenter());
            } else if (window.Events) {
                Events.openAddEventForm([35.6762, 139.6503]);
            }
            break;
            
        case 'track':
        case 'checklist':
        case 'settings':
            // Hide planner main but keep the header visible
            if (plannerMain) plannerMain.classList.add('hidden');
            const pageMap = {
                'track': 'track-page',
                'checklist': 'checklist-page',
                'settings': 'settings-page'
            };
            showFullPage(pageMap[page]);
            
            // Load expenses when navigating to track page
            if (page === 'track' && window.ExpenseTracker) {
                ExpenseTracker.loadExpenses();
            }
            break;
    }
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Show a full page (for track/settings in trip editor mode)
function showFullPage(pageId) {
    const page = document.getElementById(pageId);
    const sharedHeader = document.getElementById('shared-planner-header');
    
    if (page) {
        // Show the shared planner header
        if (sharedHeader) sharedHeader.classList.remove('hidden');
        
        // Hide the planner-main (map and events sections)
        const plannerMain = document.querySelector('.planner-main');
        if (plannerMain) plannerMain.classList.add('hidden');
        
        // Hide trip-planner-view since we're showing a different page
        const tripPlannerView = document.getElementById('trip-planner-view');
        if (tripPlannerView) tripPlannerView.classList.add('hidden');
        
        // Hide all other pages first and remove the with-shared-header class
        document.querySelectorAll('.page-content').forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('with-shared-header');
        });
        
        // Show the target page (without its header, since shared header is shown)
        page.classList.remove('hidden');
        page.classList.add('with-shared-header');
        const pageHeader = page.querySelector('.page-header');
        if (pageHeader) pageHeader.classList.add('hidden');
        
        // Scroll to top of the page
        window.scrollTo(0, 0);
        
        // Refresh icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Go back to trip list (landing mode)
function backToTripList() {
    setNavMode('landing');
    
    // Hide trip planner view
    const tripPlannerView = document.getElementById('trip-planner-view');
    if (tripPlannerView) tripPlannerView.classList.add('hidden');
    
    // Hide all pages first
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('with-shared-header');
    });
    
    // Show schedules page and trip list view
    const schedulesPage = document.getElementById('schedules-page');
    if (schedulesPage) schedulesPage.classList.remove('hidden');
    
    const tripListView = document.getElementById('trip-list-view');
    if (tripListView) tripListView.classList.remove('hidden');
    
    // Restore page headers
    document.querySelectorAll('.page-header').forEach(h => h.classList.remove('hidden'));
    
    // Reset landing nav active state
    const landingNav = document.getElementById('landing-nav');
    if (landingNav) {
        const navItems = landingNav.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        navItems[0]?.classList.add('active'); // First item (Trip List)
    }
    
    // Reset trip editor nav
    const tripEditorNav = document.getElementById('trip-editor-nav');
    if (tripEditorNav) {
        const navItems = tripEditorNav.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        navItems[0]?.classList.add('active'); // First item (Schedule)
    }
    
    // Reset planner layout
    resetPlannerLayout();
    
    // Hide shared planner header
    const sharedHeader = document.getElementById('shared-planner-header');
    if (sharedHeader) sharedHeader.classList.add('hidden');
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Enter trip editor mode
function enterTripEditor() {
    setNavMode('trip-editor');
    
    // Hide all pages first
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.add('hidden');
        p.classList.remove('with-shared-header');
    });
    
    // Show schedules page (contains trip planner view)
    const schedulesPage = document.getElementById('schedules-page');
    if (schedulesPage) schedulesPage.classList.remove('hidden');
    
    // Show shared planner header
    const sharedHeader = document.getElementById('shared-planner-header');
    if (sharedHeader) sharedHeader.classList.remove('hidden');
    
    // Show trip planner view
    const tripPlannerView = document.getElementById('trip-planner-view');
    if (tripPlannerView) tripPlannerView.classList.remove('hidden');
    
    // Hide trip list view
    const tripListView = document.getElementById('trip-list-view');
    if (tripListView) tripListView.classList.add('hidden');
    
    // Reset planner layout
    resetPlannerLayout();
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Reset planner layout to default (split view)
function resetPlannerLayout() {
    const mapSection = document.querySelector('.map-section');
    const eventsSection = document.querySelector('.events-section');
    const plannerHeader = document.querySelector('.planner-header');
    
    // Show planner header
    if (plannerHeader) plannerHeader.classList.remove('hidden');
    
    if (mapSection) {
        mapSection.classList.remove('hidden');
        mapSection.style.flex = '';
        mapSection.classList.remove('collapsed');
    }
    if (eventsSection) {
        eventsSection.classList.remove('hidden');
        eventsSection.style.flex = '';
        eventsSection.style.maxWidth = '';
    }
}

// Back to planner from track/settings pages
function backToPlanner() {
    // Reset trip editor nav to first item (Schedule)
    const tripEditorNav = document.getElementById('trip-editor-nav');
    if (tripEditorNav) {
        const navItems = tripEditorNav.querySelectorAll('.nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        navItems[0]?.classList.add('active');
    }
    
    // Reset headers on track/settings pages
    document.querySelectorAll('.trip-editor-header').forEach(h => h.classList.add('hidden'));
    document.querySelectorAll('.landing-header').forEach(h => h.classList.remove('hidden'));
    
    // Show schedules page with planner
    const schedulesPage = document.getElementById('schedules-page');
    const tripPlannerView = document.getElementById('trip-planner-view');
    const plannerHeader = document.querySelector('.planner-header:not(.trip-editor-header)');
    const plannerMain = document.querySelector('.planner-main');
    
    // Hide all pages first
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // Show schedules page
    if (schedulesPage) schedulesPage.classList.remove('hidden');
    if (tripPlannerView) tripPlannerView.classList.remove('hidden');
    if (plannerHeader) plannerHeader.classList.remove('hidden');
    if (plannerMain) plannerMain.classList.remove('hidden');
    
    // Reset planner layout
    resetPlannerLayout();
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Refresh Lucide icons (can be called after dynamic content updates)
function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Export functions
window.Navigation = {
    setNavMode,
    switchPage,
    switchTripEditorPage,
    backToTripList,
    enterTripEditor,
    resetPlannerLayout,
    refreshIcons
};