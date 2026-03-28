// Share Module - Trip sharing functionality

const ShareModule = {
    // Generate shareable link with trip data
    generateShareableLink(tripId = null) {
        const trip = tripId ? Storage.savedTrips.find(t => t.id === tripId) : Storage.currentTrip;
        if (!trip) {
            console.error('No trip selected for sharing');
            return null;
        }
        
        // Filter events/expenses/checklist by trip - use current trip data
        const tripEvents = Storage.events || [];
        const tripExpenses = Storage.expenses || [];
        const tripChecklist = (typeof Storage.checklist !== 'undefined' ? Storage.checklist : []) || [];
        
        const shareData = {
            trip: trip,
            events: tripEvents,
            expenses: tripExpenses,
            checklist: tripChecklist,
            version: APP_VERSION || '1.0.0'
        };
        
        // Compress and encode data
        const jsonStr = JSON.stringify(shareData);
        const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
        
        // Generate shareable URL
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?share=${encoded}`;
    },
    
    // Generate shareable image (canvas-based)
    async generateShareImage(tripId = null) {
        const trip = tripId ? Storage.getTripById(tripId) : Storage.currentTrip;
        if (!trip) return null;
        
        const events = Storage.events.filter(e => e.tripId === trip.id || !e.tripId);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Background
        ctx.fillStyle = '#E7E4DD';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Title
        ctx.fillStyle = '#707070';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(trip.name, 40, 60);
        
        // Date range
        ctx.font = '18px Arial';
        ctx.fillStyle = '#A67C52';
        const dateRange = this.formatDateRange(trip.startDate, trip.endDate);
        ctx.fillText(dateRange, 40, 95);
        
        // Event count
        ctx.fillStyle = '#707070';
        ctx.fillText(`Total Events: ${events.length}`, 40, 130);
        
        // Events list
        let y = 180;
        const maxEvents = 8;
        const displayEvents = events.slice(0, maxEvents);
        
        ctx.font = '16px Arial';
        displayEvents.forEach((event, i) => {
            const category = event.category || 'event';
            const categoryColor = eventCategories[category]?.color || '#667eea';
            const time = this.formatShortTime(event.time);
            
            // Category dot
            ctx.fillStyle = categoryColor;
            ctx.beginPath();
            ctx.arc(50, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Time
            ctx.fillStyle = '#8E8E93';
            ctx.font = '14px Arial';
            ctx.fillText(time, 70, y - 4);
            
            // Event name
            ctx.fillStyle = '#707070';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(event.name, 140, y + 5);
            
            // Venue
            ctx.font = '14px Arial';
            ctx.fillStyle = '#A67C52';
            ctx.fillText(event.venue || '', 140, y + 25);
            
            y += 55;
        });
        
        // More indicator
        if (events.length > maxEvents) {
            ctx.fillStyle = '#8E8E93';
            ctx.font = 'italic 16px Arial';
            ctx.fillText(`... and ${events.length - maxEvents} more events`, 40, y + 20);
        }
        
        // QR Code placeholder (in real implementation, use a QR library)
        ctx.fillStyle = '#707070';
        ctx.font = '12px Arial';
        ctx.fillText('Scan to view full itinerary', 600, 550);
        
        return canvas.toDataURL('image/png');
    },
    
    // Share to social media
    async shareToSocial(platform, tripId = null) {
        const trip = tripId ? Storage.getTripById(tripId) : Storage.currentTrip;
        if (!trip) return;
        
        const shareData = {
            title: trip.name,
            text: `Check out my trip plan: ${trip.name}`,
            url: this.generateShareableLink(tripId)
        };
        
        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
                break;
            case 'line':
                window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank');
                break;
            case 'native':
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: shareData.title,
                            text: shareData.text,
                            url: shareData.url
                        });
                    } catch (err) {
                        console.log('Share failed:', err);
                    }
                } else {
                    // Fallback to copy link
                    this.copyToClipboard(shareData.url);
                }
                break;
        }
    },
    
    // Copy to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCopyToast();
            }).catch(err => {
                console.error('Copy failed:', err);
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },
    
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            this.showCopyToast();
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea);
    },
    
    showCopyToast() {
        const t = translations[Storage.currentLang] || translations.en;
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = t.linkCopied || 'Link copied!';
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },
    
    // Parse shared data from URL
    parseSharedData(urlParams) {
        const shareData = urlParams.get('share');
        if (!shareData) return null;
        
        try {
            const decoded = decodeURIComponent(escape(atob(shareData)));
            return JSON.parse(decoded);
        } catch (e) {
            console.error('Failed to parse shared data:', e);
            return null;
        }
    },
    
    // Import shared trip
    async importSharedTrip(shareData) {
        if (!shareData || !shareData.trip) return false;
        
        const t = translations[Storage.currentLang] || translations.en;
        
        // Create new trip from shared data
        const newTrip = {
            ...shareData.trip,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        
        // Save trip to savedTrips
        Storage.savedTrips.push(newTrip);
        Storage.currentTrip = newTrip;
        Storage.saveTrips();
        
        // Import events
        if (shareData.events && shareData.events.length > 0) {
            shareData.events.forEach(event => {
                const newEvent = {
                    ...event,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
                };
                Storage.events.push(newEvent);
            });
            Storage.saveEvents();
        }
        
        // Import expenses
        if (shareData.expenses && shareData.expenses.length > 0) {
            shareData.expenses.forEach(expense => {
                const newExpense = {
                    ...expense,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
                };
                Storage.expenses.push(newExpense);
            });
            Storage.saveExpenses();
        }
        
        // Import checklist
        if (shareData.checklist && shareData.checklist.length > 0) {
            shareData.checklist.forEach(item => {
                const newItem = {
                    ...item,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
                };
                if (typeof Storage.checklist !== 'undefined') {
                    Storage.checklist.push(newItem);
                }
            });
            if (typeof Storage.saveChecklist !== 'undefined') {
                Storage.saveChecklist();
            }
        }
        
        return true;
    },
    
    // Format date range
    formatDateRange(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const options = { month: 'short', day: 'numeric' };
        const startStr = startDate.toLocaleDateString('en-US', options);
        const endStr = endDate.toLocaleDateString('en-US', options);
        
        return `${startStr} - ${endStr}`;
    },
    
    // Format short time
    formatShortTime(timeStr) {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${month}/${day} ${displayHour}:00 ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    },
    
    // Show share modal
    showShareModal(tripId = null) {
        const modal = document.getElementById('share-modal');
        if (!modal) {
            this.createShareModal();
        }
        
        const shareModal = document.getElementById('share-modal');
        if (shareModal) {
            shareModal.classList.remove('hidden');
            
            // Generate and set share link
            const link = this.generateShareableLink(tripId);
            const linkInput = document.getElementById('share-link-input');
            if (linkInput) {
                linkInput.value = link;
            }
        }
    },
    
    // Create share modal dynamically
    createShareModal() {
        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay" data-close-share-modal></div>
            <div class="modal-content modal-share">
                <div class="modal-header">
                    <h3>Share Trip</h3>
                    <button class="close-modal" data-close-share-modal>
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="share-link-section">
                        <label>Share Link</label>
                        <div class="share-link-input-wrapper">
                            <input type="text" id="share-link-input" class="share-link-input" readonly>
                            <button class="btn-copy" id="copy-share-link">
                                <i data-lucide="copy"></i>
                            </button>
                        </div>
                    </div>
                    <div class="share-options">
                        <label>Share to</label>
                        <div class="share-platforms">
                            <button class="share-platform-btn" data-platform="native">
                                <i data-lucide="share-2"></i>
                                <span>Share</span>
                            </button>
                            <button class="share-platform-btn" data-platform="twitter">
                                <i data-lucide="twitter"></i>
                                <span>Twitter</span>
                            </button>
                            <button class="share-platform-btn" data-platform="facebook">
                                <i data-lucide="facebook"></i>
                                <span>Facebook</span>
                            </button>
                            <button class="share-platform-btn" data-platform="line">
                                <span style="font-weight: bold;">LINE</span>
                            </button>
                            <button class="share-platform-btn" data-platform="whatsapp">
                                <i data-lucide="message-circle"></i>
                                <span>WhatsApp</span>
                            </button>
                        </div>
                    </div>
                    <div class="share-image-section">
                        <button class="btn-generate-image" id="generate-share-image">
                            <i data-lucide="image"></i>
                            <span>Generate Share Image</span>
                        </button>
                        <canvas id="share-image-canvas" class="hidden"></canvas>
                        <img id="share-image-preview" class="share-image-preview hidden" alt="Share preview">
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Setup event listeners
        this.setupShareModalListeners();
    },
    
    setupShareModalListeners() {
        // Copy link button
        document.getElementById('copy-share-link')?.addEventListener('click', () => {
            const linkInput = document.getElementById('share-link-input');
            if (linkInput) {
                this.copyToClipboard(linkInput.value);
            }
        });
        
        // Platform buttons
        document.querySelectorAll('.share-platform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                this.shareToSocial(platform);
            });
        });
        
        // Generate image button
        document.getElementById('generate-share-image')?.addEventListener('click', async () => {
            const canvas = document.getElementById('share-image-canvas');
            const preview = document.getElementById('share-image-preview');
            
            const imageData = await this.generateShareImage();
            if (imageData && canvas && preview) {
                preview.src = imageData;
                preview.classList.remove('hidden');
            }
        });
        
        // Close modal
        document.querySelectorAll('[data-close-share-modal]').forEach(el => {
            el.addEventListener('click', () => {
                const modal = document.getElementById('share-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
};

// Export for global access
window.ShareModule = ShareModule;