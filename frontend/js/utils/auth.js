const AuthUtils = {
    // API endpoints
    endpoints: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        profile: '/auth/profile',
        verify: '/auth/verify'
    },

    // Make authenticated API request
    async makeAuthenticatedRequest(url, options = {}) {
        const token = Storage.Auth.getToken();

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}${url}`, mergedOptions);

            // Handle unauthorized responses
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized');
            }

            return response;
        } catch (error) {
            console.error('Authenticated request failed:', error);
            throw error;
        }
    },

    // Handle unauthorized responses
    handleUnauthorized() {
        console.log('🔒 User unauthorized, clearing auth data');
        Storage.Auth.removeToken();
        Storage.User.removeData();

        if (window.Navbar) {
            Navbar.updateAuthSection();
        }

        Helpers.UI.showToast('Session expired. Please log in again.', CONSTANTS.TOAST_TYPES.WARNING);
    },

    // Check if user has specific permission
    hasPermission(permission) {
        const userData = Storage.User.getData();
        if (!userData || !userData.permissions) return false;

        return userData.permissions.includes(permission);
    },

    // Get user favorites
    async getUserFavorites() {
        try {
            const response = await this.makeAuthenticatedRequest('/user/favorites');
            const data = await response.json();

            if (data.success) {
                return data.data;
            }
            return [];
        } catch (error) {
            console.error('Failed to get user favorites:', error);
            return [];
        }
    },

    // Add venue to favorites
    async addToFavorites(venueId) {
        try {
            const response = await this.makeAuthenticatedRequest('/user/favorites', {
                method: 'POST',
                body: JSON.stringify({ venue_id: venueId })
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Failed to add to favorites:', error);
            return false;
        }
    },

    // Remove venue from favorites
    async removeFromFavorites(venueId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/user/favorites/${venueId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
            return false;
        }
    },

    // Join event
    async joinEvent(eventId) {
        try {
            const response = await this.makeAuthenticatedRequest('/user/events', {
                method: 'POST',
                body: JSON.stringify({
                    event_id: eventId,
                    status: 'joined'
                })
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Failed to join event:', error);
            return false;
        }
    },

    // Leave event
    async leaveEvent(eventId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/user/events/${eventId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Failed to leave event:', error);
            return false;
        }
    },

    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await this.makeAuthenticatedRequest('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                // Update local storage
                Storage.User.updateData(data.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update profile:', error);
            return false;
        }
    },

    // Validate form data
    validateRegistrationForm(formData) {
        const errors = {};

        // Name validation
        if (!formData.name || formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        }

        // Email validation
        if (!formData.email || !CONSTANTS.VALIDATION.EMAIL_REGEX.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters long';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Check password strength
    checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score += 1;
        else feedback.push('Use at least 8 characters');

        // Uppercase check
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Add uppercase letters');

        // Lowercase check
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Add lowercase letters');

        // Number check
        if (/\d/.test(password)) score += 1;
        else feedback.push('Add numbers');

        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else feedback.push('Add special characters');

        let strength = 'weak';
        if (score >= 4) strength = 'strong';
        else if (score >= 3) strength = 'medium';
        else if (score >= 2) strength = 'fair';

        return {
            score,
            strength,
            feedback
        };
    },

    // Show password strength indicator
    showPasswordStrength(inputElement, strengthElement) {
        inputElement.addEventListener('input', (e) => {
            const password = e.target.value;

            if (password.length === 0) {
                strengthElement.style.display = 'none';
                return;
            }

            const result = this.checkPasswordStrength(password);
            strengthElement.style.display = 'block';

            const fillElement = strengthElement.querySelector('.strength-fill');
            const textElement = strengthElement.querySelector('.strength-text');

            if (fillElement) {
                fillElement.className = `strength-fill ${result.strength}`;
            }

            if (textElement) {
                textElement.textContent = `Strength: ${result.strength.toUpperCase()}`;
            }
        });
    },

    // Auto-logout on tab close/refresh
    setupAutoLogout() {
        window.addEventListener('beforeunload', () => {
            // Mark that user is leaving
            sessionStorage.setItem('user_leaving', 'true');
        });

        window.addEventListener('load', () => {
            // Check if user was leaving
            if (sessionStorage.getItem('user_leaving')) {
                sessionStorage.removeItem('user_leaving');
                // Could implement auto-logout here if needed
            }
        });
    },

    // Setup periodic token refresh
    setupTokenRefresh() {
        setInterval(async () => {
            const token = Storage.Auth.getToken();
            if (token) {
                try {
                    const response = await this.makeAuthenticatedRequest('/auth/verify');
                    const data = await response.json();

                    if (!data.success) {
                        this.handleUnauthorized();
                    }
                } catch (error) {
                    console.log('Token verification failed:', error);
                    // Don't logout on network errors
                }
            }
        }, 15 * 60 * 1000); // Check every 15 minutes
    },

    // Initialize auth utilities
    init() {
        this.setupAutoLogout();
        this.setupTokenRefresh();
        console.log('🔐 Auth utilities initialized');
    }
};

// Make AuthUtils globally available
window.AuthUtils = AuthUtils;
