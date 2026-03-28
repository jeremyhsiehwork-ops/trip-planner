// PWA Update Checker Module
const APP_VERSION = '1.0.1';

const UpdateChecker = {
    currentVersion: APP_VERSION,
    checkInterval: 30 * 60 * 1000, // 30 minutes
    notificationElement: null,
    
    init() {
        // Store version in localStorage
        const storedVersion = localStorage.getItem('app_version');
        if (storedVersion && storedVersion !== this.currentVersion) {
            // Version changed, reload to get new content
            this.showUpdateNotification();
        }
        localStorage.setItem('app_version', this.currentVersion);
        
        // Periodic check for service worker updates
        setInterval(() => this.checkForUpdates(), this.checkInterval);
        
        // Add manual check button listener in settings
        this.addManualCheckButton();
    },
    
    addManualCheckButton() {
        // Add update check button to settings
        const settingsSection = document.querySelector('.settings-section:last-child');
        if (settingsSection) {
            const updateBtn = document.createElement('button');
            updateBtn.id = 'check-update-btn';
            updateBtn.className = 'settings-option';
            updateBtn.innerHTML = `
                <i data-lucide="refresh-cw" style="width: 20px; height: 20px; stroke: var(--color-accent);"></i>
                <span>Check for Updates</span>
            `;
            updateBtn.addEventListener('click', () => {
                this.checkForUpdates(true);
            });
            settingsSection.before(updateBtn);
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    },
    
    async checkForUpdates(manual = false) {
        try {
            // Check service worker for updates
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const update = await registration.update();
                
                if (update) {
                    // Check if there's a waiting worker
                    if (registration.waiting) {
                        this.showUpdateNotification();
                        return;
                    }
                }
            }
            
            // Note: version.json check removed - using APP_VERSION constant instead
            // If you want to use version.json, create the file and uncomment this code
            
            if (manual) {
                this.showUpToDateMessage();
            }
        } catch (e) {
            console.log('Update check failed:', e);
            if (manual) {
                this.showUpToDateMessage();
            }
        }
    },
    
    showUpdateNotification(newVersion) {
        if (this.notificationElement) {
            this.notificationElement.remove();
        }
        
        const t = translations[Storage.currentLang] || translations.en;
        
        this.notificationElement = document.createElement('div');
        this.notificationElement.className = 'update-notification';
        this.notificationElement.innerHTML = `
            <i data-lucide="refresh-cw" style="width: 20px; height: 20px;"></i>
            <span>${t.newVersionAvailable || 'New version available!'}</span>
            <button class="refresh-btn">${t.refreshNow || 'Refresh'}</button>
            <button class="dismiss-btn">${t.later || 'Later'}</button>
        `;
        
        document.body.appendChild(this.notificationElement);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Refresh button
        this.notificationElement.querySelector('.refresh-btn').addEventListener('click', () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(() => {
                    window.location.reload();
                });
            } else {
                window.location.reload();
            }
        });
        
        // Dismiss button
        this.notificationElement.querySelector('.dismiss-btn').addEventListener('click', () => {
            this.notificationElement.remove();
            this.notificationElement = null;
        });
    },
    
    showUpToDateMessage() {
        const t = translations[Storage.currentLang] || translations.en;
        
        const message = document.createElement('div');
        message.className = 'update-toast';
        message.textContent = t.appUpToDate || 'App is up to date';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 2000);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UpdateChecker.init();
});

// Export for global access
window.UpdateChecker = UpdateChecker;