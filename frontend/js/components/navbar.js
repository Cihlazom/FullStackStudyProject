const Navbar = {
    init() {
        this.bindEvents();
        this.updateAuthSection();
        const currentRoute = Router.getRouteFromHash() || 'home';
        this.setActiveLink(currentRoute);
        this.checkAuthOnLoad();
    },

    async checkAuthOnLoad() {
        const token = Storage.Auth.getToken();
        if (token) {
            try {
                const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH.VERIFY}`, {
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
                        this.clearAuthData();
                    }
                } else {
                    this.clearAuthData();
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
            }
        }
    },

    clearAuthData() {
        Storage.Auth.removeToken();
        Storage.User.removeData();
        this.updateAuthSection();
    },

    bindEvents() {
        const navToggle = Helpers.DOM.get('nav-toggle');
        const navMenu = Helpers.DOM.get('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            console.log('🛤️ Navbar initialized');
        }

        const navLinks = Helpers.DOM.getAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        document.addEventListener('click', (e) => {
            if (navMenu && navToggle &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    },

    navigateTo(page) {
        this.setActiveLink(page);

        const navMenu = Helpers.DOM.get('nav-menu');
        const navToggle = Helpers.DOM.get('nav-toggle');
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }

        if (page === 'profile' && !Storage.Auth.isAuthenticated()) {
            this.showAuthModal('login');
            return;
        }

        Router.navigateToRoute(page);
    },

    setActiveLink(activePage = 'home') {
        const navLinks = Helpers.DOM.getAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === activePage) {
                link.classList.add('active');
            }
        });
    },

    updateAuthSection() {
        const authSection = Helpers.DOM.get('auth-section');
        if (!authSection) return;

        const isAuthenticated = Storage.Auth.isAuthenticated();
        const userData = Storage.User.getData();

        this.updateProfileVisibility(isAuthenticated);

        if (isAuthenticated && userData.name) {
            authSection.innerHTML = `
                <div class="user-menu">
                    <span class="user-name">Hi, ${userData.name}</span>
                    <button class="btn btn-ghost" id="logout-btn">Logout</button>
                </div>
            `;

            const logoutBtn = Helpers.DOM.get('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        } else {
            authSection.innerHTML = `
                <button class="btn btn-ghost" id="login-btn">Login</button>
                <button class="btn btn-primary" id="register-btn">Sign Up</button>
            `;

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

    updateProfileVisibility(isAuthenticated) {
        const profileLink = document.querySelector('[data-page="profile"]');
        if (profileLink) {
            const profileLi = profileLink.closest('li');
            if (profileLi) {
                if (isAuthenticated) {
                    profileLi.style.display = 'block';
                } else {
                    profileLi.style.display = 'none';

                    if (Router.currentRoute === 'profile') {
                        Router.navigateToRoute('home');
                    }
                }
            }
        }
    },

    showAuthModal(type = 'login') {
        const modal = Helpers.DOM.get('venue-modal');
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
                ${!isLogin ? `
                    <div class="password-strength" id="password-strength">
                        <div class="strength-bar">
                            <div class="strength-fill"></div>
                        </div>
                        <div class="strength-text">Enter password to see strength</div>
                        <div class="strength-feedback">Enter password to see strength</div>
                    </div>
                ` : ''}
            </div>
            
            ${!isLogin ? `
                <div class="form-group">
                    <label for="auth-age" class="form-label">Age Range</label>
                    <select id="auth-age" name="age_range" class="form-select">
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

        modal.style.display = 'flex';

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

        if (!isLogin) {
            setTimeout(() => {
                const passwordInput = Helpers.DOM.get('auth-password');
                if (passwordInput) {
                    const passwordGroup = passwordInput.closest('.form-group');
                    if (passwordGroup) {
                        const strengthHTML = `
                <div class="password-strength" id="password-strength">
                    <div class="strength-bar">
                        <div class="strength-fill"></div>
                    </div>
                    <div class="strength-text">Enter password to see strength</div>
                </div>
            `;
                        passwordGroup.insertAdjacentHTML('beforeend', strengthHTML);

                        const strengthElement = Helpers.DOM.get('password-strength');
                        if (window.AuthUtils && strengthElement) {
                            AuthUtils.showPasswordStrength(passwordInput, strengthElement);
                        }
                    }
                }
            }, 50)
        }
    },

    async handleAuth(type, form) {
        const isLogin = type === 'login';
        const submitBtn = Helpers.DOM.get('auth-submit-btn');
        const originalText = submitBtn.textContent;

        this.clearFormErrors(form);

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            age_range: formData.get('age_range')
        };

        const interests = [];
        const interestCheckboxes = form.querySelectorAll('input[name="interests"]:checked');
        interestCheckboxes.forEach(checkbox => {
            interests.push(checkbox.value);
        });
        data.interests = interests;

        if (window.AuthUtils) {
            let validation = isLogin ? AuthUtils.validateAuthorizationForm(data) : AuthUtils.validateRegistrationForm(data);

            if (!validation.isValid) {
                this.showFormErrors(form, validation.errors);
                return;
            }
        }

        submitBtn.textContent = isLogin ? 'Signing in...' : 'Creating account...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            const endpoint = isLogin ? CONFIG.API.ENDPOINTS.AUTH.LOGIN : CONFIG.API.ENDPOINTS.AUTH.REGISTER;
            const response = await fetch(`${CONFIG.API.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                Storage.Auth.setToken(result.data.token);
                Storage.User.setData(result.data.user);

                this.updateAuthSection();
                this.closeModal();

                if (window.App && App.onUserLogin) {
                    await App.onUserLogin();
                }

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
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    },

    clearFormErrors(form) {
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });

        const errorMessages = form.querySelectorAll('.form-error');
        errorMessages.forEach(message => {
            message.style.display = 'none';
        });
    },

    showFormErrors(form, errors) {
        Object.keys(errors).forEach(fieldName => {
            if (errors[fieldName]) {
                const input = form.querySelector(`[name="${fieldName}"]`);
                if (input) {
                    const formGroup = input.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('error');

                        let errorElement = formGroup.querySelector('.form-error');
                        if (!errorElement) {
                            errorElement = document.createElement('div');
                            errorElement.className = 'form-error';
                            formGroup.appendChild(errorElement);
                        }

                        errorElement.textContent = errors[fieldName];
                        errorElement.style.display = 'block';
                    }
                }
            }
        });
    },

    async logout() {
        const token = Storage.Auth.getToken();

        try {
            if (token) {
                await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.AUTH.LOGOUT}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        }

        Storage.Favorites.clear();

        this.clearAuthData();
        this.navigateTo('home');

        if (window.VenueCard) {
            const favoriteButtons = document.querySelectorAll('.favorite-btn, .event-favorite-btn');
            favoriteButtons.forEach(btn => {
                btn.classList.remove('active');
                const heartIcon = btn.querySelector('.heart-icon');
                if (heartIcon) {
                    heartIcon.textContent = '🤍';
                }
            });
        }

        Helpers.UI.showToast('Logged out successfully! 👋', CONSTANTS.TOAST_TYPES.SUCCESS);
    },

    closeModal() {
        const modal = Helpers.DOM.get('venue-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
};

window.Navbar = Navbar;
