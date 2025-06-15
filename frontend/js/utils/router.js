const Router = {
        currentRoute: 'home',

        routes: {
            home: {
                title: 'Home - BarcelonaLocal',
                render: () => Router.renderHomePage()
            },
            profile: {
                title: 'Profile - BarcelonaLocal',
                render: () => Router.renderProfilePage()
            },
            '404': {
                title: '404 - Page Not Found',
                render: () => Router.render404Page()
            }
        },

        init() {
            window.addEventListener('popstate', (e) => {
                const route = e.state?.route || this.getRouteFromHash();
                this.navigateToRoute(route, false);
            });

            const initialRoute = this.getRouteFromHash();
            this.navigateToRoute(initialRoute, false);

            console.log('🛤️ Router initialized');
        },

        getRouteFromHash() {
            const hash = window.location.hash.slice(1); // Remove #
            return hash || 'home';
        },

        navigateToRoute(route, pushState = true) {
            if (!this.routes[route]) {
                route = '404';
            }

            if (route === this.currentRoute && pushState) {
                return;
            }

            const previousRoute = this.currentRoute;
            this.currentRoute = route;

            if (pushState) {
                const newUrl = route === 'home' ? '#' : `#${route}`;
                history.pushState({ route }, '', newUrl);
            }

            document.title = this.routes[route].title;

            this.updateNavigation(route);

            this.routes[route].render();

            console.log(`🏃 Navigated to: ${route} (from: ${previousRoute})`);
        },

        updateNavigation(activeRoute) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.page === activeRoute) {
                    link.classList.add('active');
                }
            });
        },

        renderHomePage() {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            document.body.style.overflow = 'auto';

            mainContent.innerHTML = `
      <section class="hero">
        <div class="container">
          <h1>Discover Barcelona Like a Local</h1>
          <p>Find the best restaurants, bars, events and connect with like-minded people</p>
          <button class="btn btn-primary btn-large" id="explore-btn">Start Exploring</button>
        </div>
      </section>

      <section class="search-section">
        <div class="container">
          <div class="search-container" id="search-container">
            <h2>What are you looking for?</h2>
            <p>Search filters will be added here soon...</p>
          </div>
        </div>
      </section>

      <section class="results-section">
        <div class="container">
          <div class="results-header">
            <h2 id="results-title">Popular Places</h2>
            <div class="view-controls">
            </div>
          </div>
          
          <div class="results-container" id="results-container">
          </div>
          
          <div class="load-more" style="display: none;">
            <button class="btn btn-secondary" id="load-more-btn">Load More</button>
          </div>
        </div>
      </section>
    `;

            this.bindHomePageEvents();

            if (window.SearchFilters) {
                SearchFilters.init();
            }

            if (window.App) {
                App.loadVenues();
            }
        },

        renderProfilePage() {
            const isAuthenticated = Storage?.Auth?.isAuthenticated() || false;
            const userData = Storage?.User?.getData() || {};

            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            document.body.style.overflow = 'auto';

            if (!isAuthenticated) {
                mainContent.innerHTML = `
        <section class="page-header">
          <div class="container">
            <h1>👤 Your Profile</h1>
            <p>Please log in to access your profile</p>
          </div>
        </section>

        <section class="login-prompt">
          <div class="container">
            <div class="login-card">
              <h2>Welcome Back!</h2>
              <p>Sign in to access your profile, favorites, and personalized recommendations.</p>
              <div class="login-actions">
                <button class="btn btn-primary" id="login-prompt-btn">Sign In</button>
                <button class="btn btn-secondary" id="register-prompt-btn">Create Account</button>
              </div>
            </div>
          </div>
        </section>
      `;
            } else {
                mainContent.innerHTML = `
        <section class="page-header">
          <div class="container">
            <h1>👤 Your Profile</h1>
            <p>Welcome back, ${userData.name || 'User'}!</p>
          </div>
        </section>

        <section class="profile-section">
          <div class="container">
            <div class="profile-grid">
              <div class="profile-info">
                <div class="profile-card">
                  <h3>Profile Information</h3>
                  <div class="profile-details">
                    <div class="detail-item">
                      <span class="detail-label">Name:</span>
                      <span class="detail-value">${userData.name || 'Not set'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Email:</span>
                      <span class="detail-value">${userData.email || 'Not set'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Age Range:</span>
                      <span class="detail-value">${userData.age_range || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                <div class="profile-card">
                  <h3>Your Favorites</h3>
                  <p>Places you've saved: <strong>${Storage?.Favorites?.getCount() || 0}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
            }

            this.bindProfilePageEvents();
        },

        render404Page() {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            document.body.style.overflow = 'hidden';

            mainContent.innerHTML = `
      <section class="error-page">
        <div class="container">
          <div class="error-content">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Oops! The page you're looking for doesn't exist in our Barcelona guide.</p>
            <p>But don't worry, there are plenty of amazing places to discover!</p>
            <div class="error-actions">
              <button class="btn btn-primary" onclick="Router.navigateToRoute('home')">
                Go to Home
              </button>
              <button class="btn btn-secondary" onclick="Router.navigateToRoute('events')">
                Browse Events
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  },

      bindHomePageEvents() {
        const exploreBtn = document.getElementById('explore-btn');
        if (exploreBtn) {
          exploreBtn.addEventListener('click', () => {
            const searchSection = document.querySelector('.search-section');
            if (searchSection) {
              Helpers.UI.scrollTo(searchSection, 80);
            }
          });
        }

        if (window.SearchFilters) {
          SearchFilters.init();
        }

        // if (window.App && App.setupViewControls) {
        //   App.setupViewControls();
        // }
      },

      bindProfilePageEvents() {
        const loginBtn = document.getElementById('login-prompt-btn');
        const registerBtn = document.getElementById('register-prompt-btn');

        if (loginBtn && window.Navbar) {
          loginBtn.addEventListener('click', () => {
            Navbar.showAuthModal('login');
          });
        }

        if (registerBtn && window.Navbar) {
          registerBtn.addEventListener('click', () => {
            Navbar.showAuthModal('register');
          });
        }
      }
};

window.Router = Router;
