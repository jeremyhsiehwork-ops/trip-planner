// Theme Module - Custom theme colors management

const ThemeModule = {
    defaultTheme: {
        primary: '#707070',
        accent: '#A67C52',
        accentLight: '#D4C4B0',
        surface: '#FFFFFF',
        background: '#E7E4DD',
        border: '#D4D0C8',
        text: '#707070',
        textSecondary: '#8E8E93'
    },
    
    presetThemes: [
        {
            name: 'Classic',
            id: 'classic',
            colors: {
                primary: '#707070',
                accent: '#A67C52',
                accentLight: '#D4C4B0',
                surface: '#FFFFFF',
                background: '#E7E4DD',
                border: '#D4D0C8',
                text: '#707070',
                textSecondary: '#8E8E93'
            }
        },
        {
            name: 'Ocean',
            id: 'ocean',
            colors: {
                primary: '#1e40af',
                accent: '#3b82f6',
                accentLight: '#93c5fd',
                surface: '#FFFFFF',
                background: '#eff6ff',
                border: '#bfdbfe',
                text: '#1e3a8a',
                textSecondary: '#64748b'
            }
        },
        {
            name: 'Forest',
            id: 'forest',
            colors: {
                primary: '#166534',
                accent: '#22c55e',
                accentLight: '#86efac',
                surface: '#FFFFFF',
                background: '#f0fdf4',
                border: '#bbf7d0',
                text: '#14532d',
                textSecondary: '#6b7280'
            }
        },
        {
            name: 'Sunset',
            id: 'sunset',
            colors: {
                primary: '#c2410c',
                accent: '#f97316',
                accentLight: '#fdba74',
                surface: '#FFFFFF',
                background: '#fff7ed',
                border: '#fed7aa',
                text: '#7c2d12',
                textSecondary: '#78716c'
            }
        },
        {
            name: 'Purple',
            id: 'purple',
            colors: {
                primary: '#6b21a8',
                accent: '#a855f7',
                accentLight: '#d8b4fe',
                surface: '#FFFFFF',
                background: '#faf5ff',
                border: '#e9d5ff',
                text: '#581c87',
                textSecondary: '#78716c'
            }
        },
        {
            name: 'Dark',
            id: 'dark',
            colors: {
                primary: '#a1a1aa',
                accent: '#71717a',
                accentLight: '#52525b',
                surface: '#27272a',
                background: '#18181b',
                border: '#3f3f46',
                text: '#e4e4e7',
                textSecondary: '#a1a1aa'
            }
        }
    ],
    
    init() {
        this.loadCurrentTheme();
        this.setupThemeSelector();
    },
    
    // Get current theme from localStorage
    getCurrentTheme() {
        const saved = localStorage.getItem('app_theme');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return this.defaultTheme;
            }
        }
        return this.defaultTheme;
    },
    
    // Load and apply theme
    loadCurrentTheme() {
        const theme = this.getCurrentTheme();
        this.applyTheme(theme);
    },
    
    // Apply theme to document
    applyTheme(theme) {
        const root = document.documentElement.style;
        root.setProperty('--color-primary', theme.primary || this.defaultTheme.primary);
        root.setProperty('--color-accent', theme.accent || this.defaultTheme.accent);
        root.setProperty('--color-accent-light', theme.accentLight || this.defaultTheme.accentLight);
        root.setProperty('--color-surface', theme.surface || this.defaultTheme.surface);
        root.setProperty('--color-bg', theme.background || this.defaultTheme.background);
        root.setProperty('--color-border', theme.border || this.defaultTheme.border);
        root.setProperty('--color-text', theme.text || this.defaultTheme.text);
        root.setProperty('--color-text-secondary', theme.textSecondary || this.defaultTheme.textSecondary);
        
        // Update Tailwind config if available
        if (window.tailwind && window.tailwind.config) {
            window.tailwind.config.theme = {
                extend: {
                    colors: {
                        primary: theme.primary || this.defaultTheme.primary,
                        accent: theme.accent || this.defaultTheme.accent,
                        'accent-light': theme.accentLight || this.defaultTheme.accentLight,
                        surface: theme.surface || this.defaultTheme.surface,
                        background: theme.background || this.defaultTheme.background,
                        border: theme.border || this.defaultTheme.border,
                        text: theme.text || this.defaultTheme.text,
                        'text-secondary': theme.textSecondary || this.defaultTheme.textSecondary
                    }
                }
            };
        }
        
        // Save to localStorage
        localStorage.setItem('app_theme', JSON.stringify(theme));
    },
    
    // Apply preset theme
    applyPreset(presetId) {
        const preset = this.presetThemes.find(t => t.id === presetId);
        if (preset) {
            this.applyTheme(preset.colors);
            localStorage.setItem('app_theme_preset', presetId);
        }
    },
    
    // Apply custom theme
    applyCustomTheme(colors) {
        const theme = { ...this.defaultTheme, ...colors };
        this.applyTheme(theme);
        localStorage.removeItem('app_theme_preset');
    },
    
    // Setup theme selector UI
    setupThemeSelector() {
        // Find or create theme section in settings
        let themeSection = document.getElementById('theme-settings-section');
        
        if (!themeSection) {
            themeSection = document.createElement('div');
            themeSection.id = 'theme-settings-section';
            themeSection.className = 'settings-section';
            themeSection.innerHTML = `
                <h3 class="settings-section-title">🎨 Theme 主題</h3>
                <div class="theme-presets" id="theme-presets"></div>
                <div class="theme-custom-section">
                    <h4>Custom Colors</h4>
                    <div class="theme-color-picker">
                        <label>Primary Color</label>
                        <input type="color" id="theme-primary" value="#707070">
                    </div>
                    <div class="theme-color-picker">
                        <label>Accent Color</label>
                        <input type="color" id="theme-accent" value="#A67C52">
                    </div>
                    <button class="btn-reset-theme" id="reset-theme-btn">Reset to Default</button>
                </div>
            `;
            
            const settingsMain = document.querySelector('#settings-page .settings-main');
            if (settingsMain) {
                const firstSection = settingsMain.querySelector('.settings-section');
                if (firstSection) {
                    settingsMain.insertBefore(themeSection, firstSection);
                }
            }
        }
        
        // Render preset themes
        this.renderPresetThemes();
        
        // Setup color pickers
        const currentTheme = this.getCurrentTheme();
        const primaryPicker = document.getElementById('theme-primary');
        const accentPicker = document.getElementById('theme-accent');
        
        if (primaryPicker) {
            primaryPicker.value = currentTheme.primary;
            primaryPicker.addEventListener('input', (e) => {
                this.applyCustomTheme({ primary: e.target.value });
            });
        }
        
        if (accentPicker) {
            accentPicker.value = currentTheme.accent;
            accentPicker.addEventListener('input', (e) => {
                this.applyCustomTheme({ accent: e.target.value });
            });
        }
        
        // Reset button
        document.getElementById('reset-theme-btn')?.addEventListener('click', () => {
            this.applyPreset('classic');
            this.loadCurrentTheme();
        });
    },
    
    // Render preset theme buttons
    renderPresetThemes() {
        const container = document.getElementById('theme-presets');
        if (!container) return;
        
        const currentPreset = localStorage.getItem('app_theme_preset') || 'classic';
        
        container.innerHTML = this.presetThemes.map(preset => `
            <button class="theme-preset-btn ${preset.id === currentPreset ? 'active' : ''}" 
                    data-preset="${preset.id}">
                <span class="theme-preview" style="background: linear-gradient(135deg, ${preset.colors.primary}, ${preset.colors.accent})"></span>
                <span class="theme-name">${preset.name}</span>
            </button>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.theme-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const presetId = btn.dataset.preset;
                this.applyPreset(presetId);
                
                // Update active state
                container.querySelectorAll('.theme-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },
    
    // Show theme modal
    showThemeModal() {
        const modal = document.getElementById('theme-modal');
        if (!modal) {
            this.createThemeModal();
        }
        
        const themeModal = document.getElementById('theme-modal');
        if (themeModal) {
            themeModal.classList.remove('hidden');
        }
    },
    
    // Create theme modal
    createThemeModal() {
        const modal = document.createElement('div');
        modal.id = 'theme-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-overlay" data-close-theme-modal></div>
            <div class="modal-content modal-theme">
                <div class="modal-header">
                    <h3>Customize Theme</h3>
                    <button class="close-modal" data-close-theme-modal>
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="theme-section">
                        <h4>Preset Themes</h4>
                        <div class="theme-presets-grid" id="theme-presets-grid"></div>
                    </div>
                    <div class="theme-section">
                        <h4>Custom Colors</h4>
                        <div class="theme-colors-form">
                            <div class="color-field">
                                <label>Primary</label>
                                <input type="color" id="custom-primary" value="#707070">
                            </div>
                            <div class="color-field">
                                <label>Accent</label>
                                <input type="color" id="custom-accent" value="#A67C52">
                            </div>
                            <div class="color-field">
                                <label>Background</label>
                                <input type="color" id="custom-bg" value="#E7E4DD">
                            </div>
                            <div class="color-field">
                                <label>Surface</label>
                                <input type="color" id="custom-surface" value="#FFFFFF">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        this.setupThemeModalListeners();
    },
    
    setupThemeModalListeners() {
        // Close modal
        document.querySelectorAll('[data-close-theme-modal]').forEach(el => {
            el.addEventListener('click', () => {
                const modal = document.getElementById('theme-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeModule.init();
});

// Export for global access
window.ThemeModule = ThemeModule;