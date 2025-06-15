const AuthUtils = {
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

    handleUnauthorized() {
        console.log('🔒 User unauthorized, clearing auth data');
        Storage.Auth.removeToken();
        Storage.User.removeData();

        if (window.Navbar) {
            Navbar.updateAuthSection();
        }

        Helpers.UI.showToast('Session expired. Please log in again.', CONSTANTS.TOAST_TYPES.WARNING);
    },

    validateRegistrationForm(formData) {
        const errors = {};

        if (!formData.name || formData.name.trim().length < CONSTANTS.VALIDATION.NAME_MIN_LENGTH) {
            errors.name = 'Name must be at least 2 characters long';
        }

        if (!formData.email || !CONSTANTS.VALIDATION.EMAIL_REGEX.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password || formData.password.length < CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
            errors.password = 'Password must be at least 6 characters long';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    validateAuthorizationForm(formData) {
        const errors = {};

        if (!formData.email || !CONSTANTS.VALIDATION.EMAIL_REGEX.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password || formData.password.length < CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH) {
            errors.password = 'Password must be at least 6 characters long';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        if (password.length >= 8) score += 1;
        else feedback.push(' use at least 8 characters');

        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push(' add uppercase letters');

        if (/[a-z]/.test(password)) score += 1;
        else feedback.push(' add lowercase letters');

        if (/\d/.test(password)) score += 1;
        else feedback.push(' add numbers');

        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else feedback.push(' add special characters');

        let strength = 'weak';
        if (score >= 5) strength = 'strong';
        else if (score >= 3) strength = 'medium';
        else if (score >= 2) strength = 'fair';

        return {
            score,
            strength,
            feedback
        };
    },

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
            const feedbackElement = strengthElement.querySelector('.strength-feedback');

            if (fillElement) {
                fillElement.className = `strength-fill ${result.strength}`;
            }

            if (textElement) {
                textElement.textContent = `Password strength: ${result.strength}`;
            }

            if (feedbackElement && result.feedback) {
                feedbackElement.textContent = `Feedback:${result.feedback}`;
            }
        });
    },

    setupAutoLogout() {
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('user_leaving', 'true');
        });

        window.addEventListener('load', () => {
            if (sessionStorage.getItem('user_leaving')) {
                sessionStorage.removeItem('user_leaving');
            }
        });
    },

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
                }
            }
        }, 15 * 60 * 1000);
    },

    init() {
        this.setupAutoLogout();
        this.setupTokenRefresh();
        console.log('🔐 Auth utilities initialized');
    }
};

window.AuthUtils = AuthUtils;
