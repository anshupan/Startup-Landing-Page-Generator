class LandingPageGenerator {
    constructor() {
        this.formData = {
            brandName: '',
            tagline: '',
            description: '',
            features: [''],
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            fontFamily: 'Inter',
            theme: 'light',
            logo: null
        };
        
        this.featureIcons = [
            'fas fa-rocket',
            'fas fa-star',
            'fas fa-heart',
            'fas fa-lightning-bolt',
            'fas fa-shield-alt',
            'fas fa-cog',
            'fas fa-chart-line',
            'fas fa-users',
            'fas fa-mobile-alt',
            'fas fa-globe'
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.generatePreview();
        this.setupFileUpload();
    }

    bindEvents() {
        // Form inputs
        document.getElementById('brandName').addEventListener('input', (e) => {
            this.formData.brandName = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        document.getElementById('tagline').addEventListener('input', (e) => {
            this.formData.tagline = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        document.getElementById('description').addEventListener('input', (e) => {
            this.formData.description = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        document.getElementById('primaryColor').addEventListener('input', (e) => {
            this.formData.primaryColor = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        document.getElementById('secondaryColor').addEventListener('input', (e) => {
            this.formData.secondaryColor = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.formData.fontFamily = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        document.getElementById('theme').addEventListener('change', (e) => {
            this.formData.theme = e.target.value;
            this.generatePreview();
            this.saveToLocalStorage();
        });

        // Feature management
        document.getElementById('addFeature').addEventListener('click', () => {
            this.addFeature();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.showExportModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideExportModal();
        });

        document.getElementById('copyCode').addEventListener('click', () => {
            this.copyCode();
        });

        document.getElementById('downloadZip').addEventListener('click', () => {
            this.downloadZip();
        });

        // Code tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCodeTab(e.target.dataset.tab);
            });
        });

        // Preview controls
        document.getElementById('desktopView').addEventListener('click', () => {
            this.setPreviewSize('desktop');
        });

        document.getElementById('tabletView').addEventListener('click', () => {
            this.setPreviewSize('tablet');
        });

        document.getElementById('mobileView').addEventListener('click', () => {
            this.setPreviewSize('mobile');
        });

        // Close modal on outside click
        document.getElementById('exportModal').addEventListener('click', (e) => {
            if (e.target.id === 'exportModal') {
                this.hideExportModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveToLocalStorage();
                        this.showNotification('Configuration saved! 💾');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.showExportModal();
                        break;
                }
            }
        });
    }

    setupFileUpload() {
        const fileInput = document.getElementById('logoUpload');
        const uploadInfo = document.querySelector('.file-upload-info');

        uploadInfo.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleLogoUpload(file);
            }
        });
    }

    handleLogoUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file! 🖼️', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.formData.logo = e.target.result;
            this.generatePreview();
            this.saveToLocalStorage();
            this.showNotification('Logo uploaded successfully! 🎉');
        };
        reader.readAsDataURL(file);
    }

    addFeature() {
        const container = document.getElementById('featuresContainer');
        const featureCount = container.children.length;
        
        if (featureCount >= 5) {
            this.showNotification('Maximum 5 features allowed! 📝', 'warning');
            return;
        }

        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        featureItem.innerHTML = `
            <input type="text" class="feature-input" placeholder="e.g., Lightning fast performance" data-index="${featureCount}">
            <button type="button" class="remove-feature" data-index="${featureCount}">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(featureItem);

        // Bind events for new feature
        const input = featureItem.querySelector('.feature-input');
        const removeBtn = featureItem.querySelector('.remove-feature');

        input.addEventListener('input', (e) => {
            this.updateFeature(featureCount, e.target.value);
        });

        removeBtn.addEventListener('click', () => {
            this.removeFeature(featureCount);
        });

        // Update form data
        this.formData.features[featureCount] = '';
        this.generatePreview();
    }

    updateFeature(index, value) {
        this.formData.features[index] = value;
        this.generatePreview();
        this.saveToLocalStorage();
    }

    removeFeature(index) {
        const container = document.getElementById('featuresContainer');
        const featureItem = container.children[index];
        
        if (container.children.length > 1) {
            featureItem.remove();
            this.formData.features.splice(index, 1);
            
            // Update remaining indices
            container.querySelectorAll('.feature-item').forEach((item, i) => {
                item.querySelector('.feature-input').dataset.index = i;
                item.querySelector('.remove-feature').dataset.index = i;
            });
            
            this.generatePreview();
            this.saveToLocalStorage();
        } else {
            this.showNotification('At least one feature is required! 📝', 'warning');
        }
    }

    generatePreview() {
        const previewFrame = document.getElementById('previewFrame');
        const html = this.generateLandingPageHTML();
        previewFrame.innerHTML = html;
    }

    generateLandingPageHTML() {
        const { brandName, tagline, description, features, primaryColor, secondaryColor, fontFamily, theme, logo } = this.formData;
        
        const filteredFeatures = features.filter(f => f.trim() !== '');
        const displayName = brandName || 'Your Startup';
        const displayTagline = tagline || 'Start changing the world with our innovative solution...';
        const displayDescription = description || 'Describe your amazing product here. What problem does it solve? How does it make life better?';

        return `
            <div class="generated-page theme-${theme}" style="--generated-primary: ${primaryColor}; --generated-secondary: ${secondaryColor}; --generated-font: '${fontFamily}', sans-serif;">
                <!-- Header -->
                <header class="header">
                    <div class="header-content">
                        <div class="logo">
                            ${logo ? `<img src="${logo}" alt="${displayName}">` : displayName}
                        </div>
                        <nav>
                            <ul class="nav">
                                <li><a href="#features">Features</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#contact">Contact</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>

                <!-- Hero Section -->
                <section class="hero">
                    <div class="hero-content">
                        <h1>${displayName}</h1>
                        <p>${displayTagline}</p>
                        <p>${displayDescription}</p>
                        <a href="#contact" class="cta-button">Get Started Today</a>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="features" id="features">
                    <div class="features-content">
                        <h2>Why Choose ${displayName}?</h2>
                        <div class="features-grid">
                            ${filteredFeatures.map((feature, index) => `
                                <div class="feature-card">
                                    <div class="feature-icon">
                                        <i class="${this.featureIcons[index % this.featureIcons.length]}"></i>
                                    </div>
                                    <h3>${feature}</h3>
                                    <p>Experience the power of ${feature.toLowerCase()} with our innovative platform.</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>

                <!-- Footer -->
                <footer class="footer">
                    <div class="footer-content">
                        <p>&copy; 2024 ${displayName}. All rights reserved. Made with ❤️ for entrepreneurs.</p>
                    </div>
                </footer>
            </div>
        `;
    }

    generateHTMLCode() {
        const { brandName, tagline, description, features, primaryColor, secondaryColor, fontFamily, theme, logo } = this.formData;
        
        const filteredFeatures = features.filter(f => f.trim() !== '');
        const displayName = brandName || 'Your Startup';
        const displayTagline = tagline || 'Start changing the world with our innovative solution...';
        const displayDescription = description || 'Describe your amazing product here. What problem does it solve? How does it make life better?';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Generated CSS will be inserted here */
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">
                ${logo ? `<img src="${logo}" alt="${displayName}">` : displayName}
            </div>
            <nav>
                <ul class="nav">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>${displayName}</h1>
            <p>${displayTagline}</p>
            <p>${displayDescription}</p>
            <a href="#contact" class="cta-button">Get Started Today</a>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <div class="features-content">
            <h2>Why Choose ${displayName}?</h2>
            <div class="features-grid">
                ${filteredFeatures.map((feature, index) => `
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="${this.featureIcons[index % this.featureIcons.length]}"></i>
                        </div>
                        <h3>${feature}</h3>
                        <p>Experience the power of ${feature.toLowerCase()} with our innovative platform.</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <p>&copy; 2024 ${displayName}. All rights reserved. Made with ❤️ for entrepreneurs.</p>
        </div>
    </footer>
</body>
</html>`;
    }

    generateCSSCode() {
        const { primaryColor, secondaryColor, fontFamily, theme } = this.formData;
        
        const themeColors = {
            light: {
                bg: '#ffffff',
                bgSecondary: '#f8fafc',
                bgDark: '#1e293b',
                text: '#1e293b',
                textSecondary: '#64748b'
            },
            dark: {
                bg: '#0f172a',
                bgSecondary: '#1e293b',
                bgDark: '#020617',
                text: '#f8fafc',
                textSecondary: '#cbd5e1'
            },
            minimal: {
                bg: '#ffffff',
                bgSecondary: '#fafafa',
                bgDark: '#f5f5f5',
                text: '#000000',
                textSecondary: '#666666'
            },
            elegant: {
                bg: '#fefefe',
                bgSecondary: '#f8f9fa',
                bgDark: '#2c3e50',
                text: '#2c3e50',
                textSecondary: '#7f8c8d'
            }
        };

        const colors = themeColors[theme];

        return `/* Generated CSS for ${this.formData.brandName || 'Your Startup'} */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: '${fontFamily}', sans-serif;
    line-height: 1.6;
    color: ${colors.text};
    background: ${colors.bg};
}

/* Header */
.header {
    background: ${colors.bg};
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${primaryColor};
}

.logo img {
    height: 40px;
    width: auto;
}

.nav {
    display: flex;
    gap: 2rem;
    list-style: none;
}

.nav a {
    text-decoration: none;
    color: ${colors.text};
    font-weight: 500;
    transition: color 0.2s;
}

.nav a:hover {
    color: ${primaryColor};
}

/* Hero Section */
.hero {
    padding: 4rem 2rem;
    text-align: center;
    background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
    color: white;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    line-height: 1.2;
}

.hero p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-button {
    display: inline-block;
    background: white;
    color: ${primaryColor};
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

/* Features Section */
.features {
    padding: 4rem 2rem;
    background: ${colors.bgSecondary};
}

.features-content {
    max-width: 1200px;
    margin: 0 auto;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
    color: ${colors.text};
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.feature-icon {
    width: 60px;
    height: 60px;
    background: ${primaryColor};
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: white;
    font-size: 1.5rem;
}

.feature-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: ${colors.text};
}

.feature-card p {
    color: ${colors.textSecondary};
}

/* Footer */
.footer {
    background: ${colors.bgDark};
    color: white;
    padding: 2rem;
    text-align: center;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
}

.footer p {
    opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero h1 {
        font-size: 2rem;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .nav {
        display: none;
    }
    
    .header,
    .hero,
    .features {
        padding: 2rem 1rem;
    }
}`;
    }

    generateFullCode() {
        const html = this.generateHTMLCode();
        const css = this.generateCSSCode();
        
        return html.replace('    <style>\n        /* Generated CSS will be inserted here */\n    </style>', 
                          `    <style>\n${css.split('\n').map(line => `        ${line}`).join('\n')}\n    </style>`);
    }

    showExportModal() {
        const modal = document.getElementById('exportModal');
        const htmlCode = document.getElementById('htmlCode');
        const cssCode = document.getElementById('cssCode');
        const fullCode = document.getElementById('fullCode');

        htmlCode.textContent = this.generateHTMLCode();
        cssCode.textContent = this.generateCSSCode();
        fullCode.textContent = this.generateFullCode();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    switchCodeTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update code display
        document.querySelectorAll('.code-content code').forEach(code => {
            code.classList.remove('active');
        });
        document.getElementById(`${tab}Code`).classList.add('active');
    }

    async copyCode() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        const codeElement = document.getElementById(`${activeTab}Code`);
        const text = codeElement.textContent;

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Code copied to clipboard! 📋');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Code copied to clipboard! 📋');
        }
    }

    downloadZip() {
        // For now, we'll create a simple download of the full HTML file
        const fullCode = this.generateFullCode();
        const blob = new Blob([fullCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.formData.brandName || 'landing-page'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('HTML file downloaded! 📁');
    }

    setPreviewSize(size) {
        const container = document.getElementById('previewContainer');
        const buttons = document.querySelectorAll('.preview-controls .btn');
        
        // Remove active class from all buttons
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Set container width based on size
        switch(size) {
            case 'desktop':
                container.style.maxWidth = '100%';
                break;
            case 'tablet':
                container.style.maxWidth = '768px';
                break;
            case 'mobile':
                container.style.maxWidth = '375px';
                break;
        }
    }

    toggleDarkMode() {
        const body = document.body;
        const isDark = body.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            body.removeAttribute('data-theme');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        localStorage.setItem('darkMode', !isDark);
    }

    saveToLocalStorage() {
        localStorage.setItem('landingPageData', JSON.stringify(this.formData));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('landingPageData');
        if (saved) {
            this.formData = { ...this.formData, ...JSON.parse(saved) };
            this.populateForm();
        }

        // Load dark mode preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    populateForm() {
        document.getElementById('brandName').value = this.formData.brandName;
        document.getElementById('tagline').value = this.formData.tagline;
        document.getElementById('description').value = this.formData.description;
        document.getElementById('primaryColor').value = this.formData.primaryColor;
        document.getElementById('secondaryColor').value = this.formData.secondaryColor;
        document.getElementById('fontFamily').value = this.formData.fontFamily;
        document.getElementById('theme').value = this.formData.theme;

        // Populate features
        const container = document.getElementById('featuresContainer');
        container.innerHTML = '';
        
        this.formData.features.forEach((feature, index) => {
            if (index === 0 || feature.trim() !== '') {
                const featureItem = document.createElement('div');
                featureItem.className = 'feature-item';
                featureItem.innerHTML = `
                    <input type="text" class="feature-input" value="${feature}" placeholder="e.g., Lightning fast performance" data-index="${index}">
                    <button type="button" class="remove-feature" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                container.appendChild(featureItem);

                // Bind events
                const input = featureItem.querySelector('.feature-input');
                const removeBtn = featureItem.querySelector('.remove-feature');

                input.addEventListener('input', (e) => {
                    this.updateFeature(index, e.target.value);
                });

                removeBtn.addEventListener('click', () => {
                    this.removeFeature(index);
                });
            }
        });
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
            max-width: 300px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 0.25rem;
            transition: background 0.2s;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LandingPageGenerator();
});

// Add some helpful tooltips
document.addEventListener('DOMContentLoaded', () => {
    // Add tooltip functionality for question marks
    document.querySelectorAll('[title]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.title;
            tooltip.style.cssText = `
                position: absolute;
                background: #1e293b;
                color: white;
                padding: 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.75rem;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
            
            e.target.addEventListener('mouseleave', () => {
                if (document.body.contains(tooltip)) {
                    document.body.removeChild(tooltip);
                }
            }, { once: true });
        });
    });
}); 