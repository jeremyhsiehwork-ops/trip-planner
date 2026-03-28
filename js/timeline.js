// Timeline Module - Event timeline view

const TimelineModule = {
    currentView: 'list', // 'list' or 'timeline'
    
    init() {
        this.setupTimelineToggle();
        this.renderTimeline();
    },
    
    // Setup timeline toggle button
    setupTimelineToggle() {
        // Add toggle button to events section header
        const eventsHeader = document.querySelector('.events-header .header-right');
        if (eventsHeader && !document.getElementById('timeline-toggle-btn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'timeline-toggle-btn';
            toggleBtn.className = 'timeline-toggle-btn';
            toggleBtn.title = 'Toggle Timeline View';
            toggleBtn.innerHTML = `
                <i data-lucide="clock"></i>
            `;
            eventsHeader.insertBefore(toggleBtn, eventsHeader.lastElementChild);
            
            toggleBtn.addEventListener('click', () => {
                this.toggleView();
            });
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    },
    
    // Toggle between list and timeline view
    toggleView() {
        this.currentView = this.currentView === 'list' ? 'timeline' : 'list';
        
        const eventsList = document.getElementById('events-list');
        const timelineContainer = document.getElementById('timeline-container');
        
        if (this.currentView === 'timeline') {
            if (eventsList) eventsList.classList.add('hidden');
            this.renderTimeline();
            if (timelineContainer) timelineContainer.classList.remove('hidden');
        } else {
            if (eventsList) eventsList.classList.remove('hidden');
            if (timelineContainer) timelineContainer.classList.add('hidden');
        }
        
        // Update button active state
        const toggleBtn = document.getElementById('timeline-toggle-btn');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', this.currentView === 'timeline');
        }
    },
    
    // Render timeline view
    renderTimeline() {
        let timelineContainer = document.getElementById('timeline-container');
        
        if (!timelineContainer) {
            timelineContainer = document.createElement('div');
            timelineContainer.id = 'timeline-container';
            timelineContainer.className = 'timeline-container hidden';
            
            const eventsSection = document.querySelector('.events-section');
            if (eventsSection) {
                const eventsList = document.getElementById('events-list');
                if (eventsList) {
                    eventsSection.insertBefore(timelineContainer, eventsList.nextSibling);
                }
            }
        }
        
        const events = Storage.events || [];
        const t = translations[Storage.currentLang] || translations.en;
        
        if (events.length === 0) {
            timelineContainer.innerHTML = `
                <div class="timeline-empty-state">
                    <i data-lucide="clock"></i>
                    <p>${t.noEventsYet || 'No events yet'}</p>
                    <p class="empty-hint">${t.clickMapOrTapPlus || 'Click on the map or tap "+" to create one'}</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        // Group events by date
        const eventsByDate = this.groupEventsByDate(events);
        
        timelineContainer.innerHTML = `
            <div class="timeline-content">
                ${this.renderTimelineDays(eventsByDate)}
            </div>
        `;
        
        // Add event click handlers
        this.setupTimelineEventListeners();
    },
    
    // Group events by date
    groupEventsByDate(events) {
        const grouped = {};
        
        events.forEach(event => {
            const date = this.parseEventDateKey(event.time);
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(event);
        });
        
        // Sort dates
        const sortedDates = Object.keys(grouped).sort();
        const result = {};
        sortedDates.forEach(date => {
            // Sort events by time within each date
            grouped[date].sort((a, b) => {
                const timeA = new Date(a.time).getTime();
                const timeB = new Date(b.time).getTime();
                return timeA - timeB;
            });
            result[date] = grouped[date];
        });
        
        return result;
    },
    
    // Parse date key from event time
    parseEventDateKey(timeStr) {
        if (!timeStr) return 'unknown';
        try {
            const date = new Date(timeStr);
            return date.toISOString().split('T')[0];
        } catch (e) {
            return 'unknown';
        }
    },
    
    // Render timeline days
    renderTimelineDays(eventsByDate) {
        const t = translations[Storage.currentLang] || translations.en;
        
        return Object.entries(eventsByDate).map(([date, events]) => {
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isToday = this.isToday(date);
            
            return `
                <div class="timeline-day ${isToday ? 'today' : ''}">
                    <div class="timeline-day-header">
                        <span class="timeline-day-name">${dayName}</span>
                        <span class="timeline-day-date">${monthDay}</span>
                        <span class="timeline-event-count">${events.length} events</span>
                    </div>
                    <div class="timeline-day-events">
                        <div class="timeline-line"></div>
                        ${events.map((event, index) => this.renderTimelineEvent(event, index, events.length)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Render single timeline event
    renderTimelineEvent(event, index, total) {
        const category = event.category || 'event';
        const categoryData = eventCategories[category] || {};
        const categoryColor = categoryData.color || '#667eea';
        const categoryIcon = categoryData.icon || '📍';
        const t = translations[Storage.currentLang] || translations.en;
        const categoryText = t[category] || category;
        
        const timeStr = this.formatTimelineTime(event.time);
        const venueName = event.venue || event.name;
        
        const isFirst = index === 0;
        const isLast = index === total - 1;
        
        return `
            <div class="timeline-event ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}" 
                 data-event-index="${Storage.events.indexOf(event)}">
                <div class="timeline-event-marker" style="background-color: ${categoryColor}">
                    <span class="timeline-event-icon">${categoryIcon}</span>
                </div>
                <div class="timeline-event-content">
                    <div class="timeline-event-time">${timeStr}</div>
                    <div class="timeline-event-body">
                        <h4 class="timeline-event-title">${event.name}</h4>
                        <p class="timeline-event-venue">${venueName}</p>
                        ${event.target ? `<p class="timeline-event-target">${event.target}</p>` : ''}
                    </div>
                    <div class="timeline-event-category" style="background-color: ${categoryColor}">
                        ${categoryText}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Format time for timeline
    formatTimelineTime(timeStr) {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            const hour = date.getHours();
            const minute = date.getMinutes();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const displayMinute = minute.toString().padStart(2, '0');
            return `${displayHour}:${displayMinute} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    },
    
    // Check if date is today
    isToday(dateStr) {
        const today = new Date().toISOString().split('T')[0];
        return dateStr === today;
    },
    
    // Setup timeline event listeners
    setupTimelineEventListeners() {
        document.querySelectorAll('.timeline-event').forEach(el => {
            el.addEventListener('click', () => {
                const eventIndex = parseInt(el.dataset.eventIndex);
                if (!isNaN(eventIndex)) {
                    viewEvent(eventIndex);
                }
            });
        });
    },
    
    // Refresh timeline
    refresh() {
        if (this.currentView === 'timeline') {
            this.renderTimeline();
        }
    },
    
    // Scroll to specific event
    scrollToEvent(eventIndex) {
        if (this.currentView !== 'timeline') return;
        
        const eventEl = document.querySelector(`.timeline-event[data-event-index="${eventIndex}"]`);
        if (eventEl) {
            eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            eventEl.classList.add('highlighted');
            setTimeout(() => {
                eventEl.classList.remove('highlighted');
            }, 2000);
        }
    }
};

// Export for global access
window.TimelineModule = TimelineModule;