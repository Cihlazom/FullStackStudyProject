const Helpers = {
    DOM: {
        get(id) {
            return document.getElementById(id);
        },

        getAll(selector) {
            return document.querySelectorAll(selector);
        },

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
    },

    String: {
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        truncate(str, length = 100) {
            return str.length > length ? str.substring(0, length) + '...' : str;
        },

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    },

    Date: {
        format(date, options = {}) {
            const defaults = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(new Date(date));
        },
    },

    Utils: {
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

        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },

        formatDistance(distance) {
            if (distance < 1) {
                return `${Math.round(distance * 1000)}m`;
            }
            return `${distance.toFixed(1)}km`;
        }
    },

    UI: {
        showLoading() {
            const spinner = Helpers.DOM.get('loading-spinner');
            if (spinner) {
                spinner.style.display = 'flex';
            }
        },

        hideLoading() {
            const spinner = Helpers.DOM.get('loading-spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
        },

        showToast(message, type = CONSTANTS.TOAST_TYPES.INFO, duration = CONFIG.APP.TOAST_DURATION) {
            const container = Helpers.DOM.get('toast-container');
            if (!container) return;

            const toast = Helpers.DOM.create('div', {
                className: `toast ${type}`,
                innerHTML: Helpers.String.escapeHtml(message)
            });

            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, duration);

            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        },

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

window.Helpers = Helpers;
