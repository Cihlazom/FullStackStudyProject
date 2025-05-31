// Helper functions for Barcelona Local Platform
const Helpers = {
    // DOM Manipulation
    DOM: {
        // Get element by ID
        get(id) {
            return document.getElementById(id);
        },

        // Get elements by selector
        getAll(selector) {
            return document.querySelectorAll(selector);
        },

        // Create element with attributes
        create(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);

            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'innerHTML') {
                    element.innerHTML = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });

            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });

            return element;
        },

        // Show/hide elements
        show(element) {
            if (element) element.style.display = 'block';
        },

        hide(element) {
            if (element) element.style.display = 'none';
        },

        toggle(element) {
            if (element) {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        },

        // Add/remove classes
        addClass(element, className) {
            if (element) element.classList.add(className);
        },

        removeClass(element, className) {
            if (element) element.classList.remove(className);
        },

        toggleClass(element, className) {
            if (element) element.classList.toggle(className);
        }
    },

    // String utilities
    String: {
        // Capitalize first letter
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        // Truncate string
        truncate(str, length = 100) {
            return str.length > length ? str.substring(0, length) + '...' : str;
        },

        // Generate slug from string
        slugify(str) {
            return str
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },

        // Format price
        formatPrice(price, currency = '€') {
            return `${currency}${price.toFixed(2)}`;
        },

        // Escape HTML
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    },

    // Array utilities
    Array: {
        // Remove duplicates
        unique(arr) {
            return [...new Set(arr)];
        },

        // Shuffle array
        shuffle(arr) {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        // Group by key
        groupBy(arr, key) {
            return arr.reduce((groups, item) => {
                const group = item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        }
    },

    // Date utilities
    Date: {
        // Format date
        format(date, options = {}) {
            const defaults = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(new Date(date));
        },

        // Get relative time (e.g., "2 hours ago")
        timeAgo(date) {
            const now = new Date();
            const diffMs = now - new Date(date);
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins} minutes ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 7) return `${diffDays} days ago`;
            return this.format(date);
        },

        // Check if date is today
        isToday(date) {
            const today = new Date();
            const compareDate = new Date(date);
            return today.toDateString() === compareDate.toDateString();
        }
    },

    // Validation utilities
    Validation: {
        // Validate email
        isValidEmail(email) {
            return CONSTANTS.VALIDATION.EMAIL_REGEX.test(email);
        },

        // Validate password
        isValidPassword(password) {
            return password.length >= CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH;
        },

        // Validate required field
        isRequired(value) {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },

        // Validate URL
        isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
    },

    // Utility functions
    Utils: {
        // Debounce function
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function
        throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Generate random ID
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        // Deep clone object
        deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        // Check if object is empty
        isEmpty(obj) {
            return Object.keys(obj).length === 0;
        },

        // Get current position
        getCurrentPosition() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported'));
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    position => resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }),
                    error => reject(error),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
                );
            });
        },

        // Calculate distance between two points (Haversine formula)
        calculateDistance(lat1, lng1, lat2, lng2) {
            const R = 6371; // Earth's radius in km
            const dLat = this.toRadians(lat2 - lat1);
            const dLng = this.toRadians(lng2 - lng1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        },

        toRadians(degrees) {
            return degrees * (Math.PI / 180);
        },

        // Format distance
        formatDistance(distance) {
            if (distance < 1) {
                return `${Math.round(distance * 1000)}m`;
            }
            return `${distance.toFixed(1)}km`;
        }
    },

    // UI utilities
    UI: {
        // Show loading spinner
        showLoading() {
            const spinner = Helpers.DOM.get('loading-spinner');
            if (spinner) {
                spinner.style.display = 'flex';
            }
        },

        // Hide loading spinner
        hideLoading() {
            const spinner = Helpers.DOM.get('loading-spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        },

        // Show toast notification
        showToast(message, type = CONSTANTS.TOAST_TYPES.INFO, duration = CONFIG.APP.TOAST_DURATION) {
            const container = Helpers.DOM.get('toast-container');
            if (!container) return;

            const toast = Helpers.DOM.create('div', {
                className: `toast ${type}`,
                innerHTML: Helpers.String.escapeHtml(message)
            });

            container.appendChild(toast);

            // Auto remove after duration
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, duration);

            // Allow manual close
            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        },

        // Smooth scroll to element
        scrollTo(element, offset = 0) {
            if (element) {
                const top = element.offsetTop - offset;
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        }
    }
};

// Make helpers globally available
window.Helpers = Helpers;
