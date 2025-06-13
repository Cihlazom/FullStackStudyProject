const Navbar = {
    // Initialize navbar
    init() {
        this.bindEvents();
        this.updateAuthSection();
        this.setActiveLink();
        this.checkAuthOnLoad();
    },

    // Check authentication status on page load
    async checkAuthOnLoad() {
        const token = Storage.Auth.getToken();
        if (token) {
            try {
                const response = await fetch(`${CONFIG.API.BASE_URL}/auth/verify`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Token is valid, update user data
                        Storage.User.setData(data.data);
                        this.updateAuthSection();
                        console.log('✅ User authenticated on load');
                    } else {
                        // Token is invalid, clear auth data
                        this.clearAuthData();
                    }
                } else {
                    // Server error, clear auth data
                    this.clearAuthData();
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                // Keep existing auth data on network error
            }
        }
    },

    // Clear authentication data
    clearAuthData() {
        Storage.Auth.removeToken();
        Storage.User.removeData();
        this.updateAuthSection();
    },

    // Bind event listeners
    bindEvents() {
        // Mobile menu toggle
        const navToggle = Helpers.DOM.get('nav-toggle');
        const navMenu = Helpers.DOM.get('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            console.log('🛤️ Navbar initialized');
        }

        // Navigation links
        const navLinks = Helpers.DOM.getAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navToggle &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    },

    // Navigate to different pages
    navigateTo(page) {
        // Update active link FIRST
        this.setActiveLink(page);

        // Close mobile menu
        const navMenu = Helpers.DOM.get('nav-menu');
        const navToggle = Helpers.DOM.get('nav-toggle');
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }

        // Check authentication for profile
        if (page === 'profile' && !Storage.Auth.isAuthenticated()) {
            this.showAuthModal('login');
            return;
        }

        // Use Router directly
        Router.navigateToRoute(page);
    },

    // Set active navigation link
    setActiveLink(activePage = 'home') {
        const navLinks = Helpers.DOM.getAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === activePage) {
                link.classList.add('active');
            }
        });
    },

    // Update auth section based on login status
    updateAuthSection() {
        const authSection = Helpers.DOM.get('auth-section');
        if (!authSection) return;

        const isAuthenticated = Storage.Auth.isAuthenticated();
        const userData = Storage.User.getData();

        if (isAuthenticated && userData.name) {
            // User is logged in
            authSection.innerHTML = `
                <div class="user-menu">
                    <span class="user-name">Hi, ${userData.name}</span>
                    <button class="btn btn-ghost" id="logout-btn">Logout</button>
                </div>
            `;

            // Re-bind logout event
            const logoutBtn = Helpers.DOM.get('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        } else {
            // User is not logged in
            authSection.innerHTML = `
                <button class="btn btn-ghost" id="login-btn">Login</button>
                <button class="btn btn-primary" id="register-btn">Sign Up</button>
            `;

            // Re-bind auth events
            const loginBtn = Helpers.DOM.get('login-btn');
            const registerBtn = Helpers.DOM.get('register-btn');

            if (loginBtn) {
                loginBtn.addEventListener('click', () => this.showAuthModal('login'));
            }

            if (registerBtn) {
                registerBtn.addEventListener('click', () => this.showAuthModal('register'));
            }
        }
    },

    // Show authentication modal
    showAuthModal(type = 'login') {
        const modal = Helpers.DOM.get('venue-modal'); // Reuse existing modal
        const modalBody = Helpers.DOM.get('modal-body');

        if (!modal || !modalBody) return;

        const isLogin = type === 'login';

        modalBody.innerHTML = `
            <div class="auth-modal">
                <h2>${isLogin ? 'Welcome Back' : 'Join BarcelonaLocal'}</h2>
                <p>${isLogin ? 'Sign in to your account' : 'Create your account to get started'}</p>
                
                <form id="auth-form" class="auth-form">
                    ${!isLogin ? `
                        <div class="form-group">
                            <label for="auth-name" class="form-label">Full Name</label>
                            <input type="text" id="auth-name" name="name" class="form-input" required>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label for="auth-email" class="form-label">Email</label>
                        <input type="email" id="auth-email" name="email" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="auth-password" class="form-label">Password</label>
                        <input type="password" id="auth-password" name="password" class="form-input" required minlength="6">
                    </div>
                    
                    ${!isLogin ? `
                        <div class="form-group">
                            <label for="auth-age" class="form-label">Age Range</label>
                            <select id="auth-age" name="age" class="form-select">
                                <option value="">Select age range</option>
                                <option value="18-22">18-22</option>
                                <option value="23-26">23-26</option>
                                <option value="27-30">27-30</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Interests</label>
                            <div class="interests-grid">
                                <label class="interest-checkbox">
                                    <input type="checkbox" name="interests" value="nightlife">
                                    <span>🌙 Nightlife</span>
                                </label>
                                <label class="interest-checkbox">
                                    <input type="checkbox" name="interests" value="food">
                                    <span>🍽️ Food</span>
                                </label>
                                <label class="interest-checkbox">
                                    <input type="checkbox" name="interests" value="culture">
                                    <span>🎭 Culture</span>
                                </label>
                                <label class="interest-checkbox">
                                    <input type="checkbox" name="interests" value="sports">
                                    <span>⚽ Sports</span>
                                </label>
                                <label class="interest-checkbox">
                                    <input type="checkbox" name="interests" value="music">
                                    <span>🎵 Music</span>
                                </label>
                                <label class="interest-checkbox">
                                    <input type="checkbox" name="interests" value="networking">
                                    <span>🤝 Networking</span>
                                </label>
                            </div>
                        </div>
                    ` : ''}
                    
                    <button type="submit" class="btn btn-primary w-full" id="auth-submit-btn">
                        ${isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <div class="auth-switch">
                    <p>
                        ${isLogin ? "Don't have an account?" : "Already have an account?"}
                        <a href="#" id="auth-switch-link">
                            ${isLogin ? 'Sign up' : 'Sign in'}
                        </a>
                    </p>
                </div>
            </div>
        `;

        // Show modal
        modal.style.display = 'flex';

        // Bind form events
        const authForm = Helpers.DOM.get('auth-form');
        const switchLink = Helpers.DOM.get('auth-switch-link');

        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth(type, authForm);
            });
        }

        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal(isLogin ? 'register' : 'login');
            });
        }
    },

    // Handle authentication - REAL API CALLS
    async handleAuth(type, form) {
        const isLogin = type === 'login';
        const submitBtn = Helpers.DOM.get('auth-submit-btn');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = isLogin ? 'Signing in...' : 'Creating account...';
        submitBtn.disabled = true;

        try {
            // Prepare form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                age_range: formData.get('age_range')
            };

            // Get interests for registration
            if (!isLogin) {
                const interests = [];
                const interestCheckboxes = form.querySelectorAll('input[name="interests"]:checked');
                interestCheckboxes.forEach(checkbox => {
                    interests.push(checkbox.value);
                });
                data.interests = interests;
            }

            // Make API call
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await fetch(`${CONFIG.API.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Save auth data
                Storage.Auth.setToken(result.data.token);
                Storage.User.setData(result.data.user);

                // Update UI
                this.updateAuthSection();
                this.closeModal();

                if (window.App && App.onUserLogin) {
                    await App.onUserLogin();
                }

                // Show success message
                Helpers.UI.showToast(
                    isLogin ? 'Welcome back! 🎉' : 'Account created successfully! 🎉',
                    CONSTANTS.TOAST_TYPES.SUCCESS
                );

                console.log('✅ Authentication successful:', result.data.user);

            } else {
                throw new Error(result.message || 'Authentication failed');
            }

        } catch (error) {
            console.error('Auth error:', error);

            let errorMessage = 'Authentication failed. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            }

            Helpers.UI.showToast(errorMessage, CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    // Logout user - REAL API CALL
    async logout() {
        const token = Storage.Auth.getToken();

        try {
            // Call logout API
            if (token) {
                await fetch(`${CONFIG.API.BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API fails
        }

        // Clear local auth data
        this.clearAuthData();
        this.navigateTo('home');

        Helpers.UI.showToast('Logged out successfully! 👋', CONSTANTS.TOAST_TYPES.SUCCESS);
    },

    // Close modal
    closeModal() {
        const modal = Helpers.DOM.get('venue-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Page navigation methods
    showHomePage() {
        Router.navigateToRoute('home');
    },

    showEventsPage() {
        Router.navigateToRoute('events');
    },

    showSocialPage() {
        Router.navigateToRoute('social');
    },

    showProfilePage() {
        Router.navigateToRoute('profile');
    }
};

// Make Navbar globally available
window.Navbar = Navbar;
