// Navigation Component for Barcelona Local Platform
const Navbar = {
    // Initialize navbar
    init() {
        this.bindEvents();
        this.updateAuthSection();
        this.setActiveLink();
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

        // Auth buttons
        const loginBtn = Helpers.DOM.get('login-btn');
        const registerBtn = Helpers.DOM.get('register-btn');
        const logoutBtn = Helpers.DOM.get('logout-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showAuthModal('login'));
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showAuthModal('register'));
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

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

        // Use Router directly (это и есть исправление!)
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
            <input type="password" id="auth-password" name="password" class="form-input" required>
          </div>
          
          ${!isLogin ? `
            <div class="form-group">
              <label for="auth-age" class="form-label">Age Range</label>
              <select id="auth-age" name="age" class="form-select" required>
                <option value="">Select age range</option>
                <option value="18-22">18-22</option>
                <option value="23-26">23-26</option>
                <option value="27-30">27-30</option>
              </select>
            </div>
          ` : ''}
          
          <button type="submit" class="btn btn-primary w-full">
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
                this.handleAuth(type, new FormData(authForm));
            });
        }

        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal(isLogin ? 'register' : 'login');
            });
        }
    },

    // Handle authentication
    async handleAuth(type, formData) {
        const isLogin = type === 'login';

        try {
            let response;

            if (isLogin) {
                // Mock login for now
                response = {
                    success: true,
                    data: {
                        user: {
                            name: 'Test User',
                            email: formData.get('email')
                        },
                        token: 'mock_token_123'
                    }
                };
            } else {
                // Mock registration
                response = {
                    success: true,
                    data: {
                        user: {
                            name: formData.get('name'),
                            email: formData.get('email'),
                            age: formData.get('age')
                        },
                        token: 'mock_token_123'
                    }
                };
            }

            if (response.success) {
                // Save auth data
                Storage.Auth.setToken(response.data.token);
                Storage.User.setData(response.data.user);

                // Update UI
                this.updateAuthSection();
                this.closeModal();

                // Show success message
                Helpers.UI.showToast(
                    isLogin ? CONSTANTS.SUCCESS_MESSAGES.LOGIN : CONSTANTS.SUCCESS_MESSAGES.REGISTER,
                    CONSTANTS.TOAST_TYPES.SUCCESS
                );
            }
        } catch (error) {
            console.error('Auth error:', error);
            Helpers.UI.showToast(
                'Authentication failed. Please try again.',
                CONSTANTS.TOAST_TYPES.ERROR
            );
        }
    },

    // Logout user
    logout() {
        Storage.Auth.removeToken();
        Storage.User.removeData();
        this.updateAuthSection();
        this.navigateTo('home');

        Helpers.UI.showToast(
            CONSTANTS.SUCCESS_MESSAGES.LOGOUT,
            CONSTANTS.TOAST_TYPES.SUCCESS
        );
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
    },
};

// Make Navbar globally available
window.Navbar = Navbar;
