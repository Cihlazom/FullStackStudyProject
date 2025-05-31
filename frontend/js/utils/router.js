// Simple SPA Router for Barcelona Local Platform
const Router = {
        // Current route state
        currentRoute: 'home',

        // Available routes and their content
        routes: {
            home: {
                title: 'Home - BarcelonaLocal',
                render: () => Router.renderHomePage()
            },
            events: {
                title: 'Events - BarcelonaLocal',
                render: () => Router.renderEventsPage()
            },
            social: {
                title: 'Social - BarcelonaLocal',
                render: () => Router.renderSocialPage()
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

        // Initialize router
        init() {
            // Handle browser back/forward buttons
            window.addEventListener('popstate', (e) => {
                const route = e.state?.route || this.getRouteFromHash();
                this.navigateToRoute(route, false);
            });

            // Handle initial load
            const initialRoute = this.getRouteFromHash();
            this.navigateToRoute(initialRoute, true);

            console.log('🛤️ Router initialized');
        },

        // Get route from URL hash
        getRouteFromHash() {
            const hash = window.location.hash.slice(1); // Remove #
            return hash || 'home';
        },

        // Navigate to a route
        navigateToRoute(route, pushState = true) {
            // Check if route exists
            if (!this.routes[route]) {
                route = '404';
            }

            // Don't navigate if already on this route
            if (route === this.currentRoute && pushState) {
                return;
            }

            this.currentRoute = route;

            // Update URL
            if (pushState) {
                const newUrl = route === 'home' ? '#' : `#${route}`;
                history.pushState({ route }, '', newUrl);
            }

            // Update page title
            document.title = this.routes[route].title;

            // Render the page
            this.routes[route].render();

            // Update navigation active state
            this.updateNavigation(route);

            console.log(`🏃 Navigated to: ${route}`);
        },

        // Update navigation active states
        updateNavigation(activeRoute) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.page === activeRoute) {
                    link.classList.add('active');
                }
            });
        },

        // Render Home Page
        renderHomePage() {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            // Включаем скролл обратно
            document.body.style.overflow = 'auto';

            mainContent.innerHTML = `
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <h1>Discover Barcelona Like a Local</h1>
          <p>Find the best restaurants, bars, events and connect with like-minded people</p>
          <button class="btn btn-primary btn-large" id="explore-btn">Start Exploring</button>
        </div>
      </section>

      <!-- Search Section -->
      <section class="search-section">
        <div class="container">
          <div class="search-container" id="search-container">
            <h2>What are you looking for?</h2>
            <p>Search filters will be added here soon...</p>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section class="results-section">
        <div class="container">
          <div class="results-header">
            <h2 id="results-title">Popular Places</h2>
            <div class="view-controls">
              <button class="view-btn active" data-view="grid">
                <span>Grid</span>
              </button>
              <button class="view-btn" data-view="list">
                <span>List</span>
              </button>
              <button class="view-btn" data-view="map">
                <span>Map</span>
              </button>
            </div>
          </div>
          
          <div class="results-container" id="results-container">
            <!-- Results will be loaded here -->
          </div>
          
          <div class="load-more" style="display: none;">
            <button class="btn btn-secondary" id="load-more-btn">Load More</button>
          </div>
        </div>
      </section>
    `;

            // Re-bind events and load data
            this.bindHomePageEvents();
            if (window.App) {
                App.loadVenues();
            }
        },

        // Render Events Page
        renderEventsPage() {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            // Включаем скролл обратно
            document.body.style.overflow = 'auto';

            mainContent.innerHTML = `
      <section class="page-header">
        <div class="container">
          <h1>🎉 Events in Barcelona</h1>
          <p>Discover the best events happening around the city</p>
        </div>
      </section>

      <section class="events-section page-content">
        <div class="container">
          <div class="events-filters">
            <h3>Filter Events</h3>
            <div class="filter-buttons">
              <button class="btn btn-secondary active" data-filter="all">All Events</button>
              <button class="btn btn-secondary" data-filter="tonight">Tonight</button>
              <button class="btn btn-secondary" data-filter="weekend">This Weekend</button>
              <button class="btn btn-secondary" data-filter="free">Free Events</button>
            </div>
          </div>

          <div class="events-grid" id="events-container">
            <div class="event-card">
              <div class="event-image">
                <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400" alt="Live Jazz Night">
                <div class="event-date">
                  <span class="day">15</span>
                  <span class="month">APR</span>
                </div>
              </div>
              <div class="event-content">
                <h3>Live Jazz Night</h3>
                <p class="event-venue">📍 Bar Central, Eixample</p>
                <p class="event-time">🕘 21:00 - 02:00</p>
                <p class="event-price">💶 €15</p>
                <p class="event-description">Enjoy live jazz music with great cocktails in a cozy atmosphere.</p>
                <button class="btn btn-primary">Get Tickets</button>
              </div>
            </div>

            <div class="event-card">
              <div class="event-image">
                <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=400" alt="Student Networking">
                <div class="event-date">
                  <span class="day">18</span>
                  <span class="month">APR</span>
                </div>
              </div>
              <div class="event-content">
                <h3>Student Networking Event</h3>
                <p class="event-venue">📍 Café del Born, Ciutat Vella</p>
                <p class="event-time">🕘 19:00 - 22:00</p>
                <p class="event-price">💶 Free</p>
                <p class="event-description">Meet fellow students and young professionals in Barcelona.</p>
                <button class="btn btn-primary">Join Event</button>
              </div>
            </div>

            <div class="event-card">
              <div class="event-image">
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400" alt="Tapas Tour">
                <div class="event-date">
                  <span class="day">20</span>
                  <span class="month">APR</span>
                </div>
              </div>
              <div class="event-content">
                <h3>Tapas Tasting Tour</h3>
                <p class="event-venue">📍 Gràcia Tapas, Gràcia</p>
                <p class="event-time">🕘 20:00 - 23:00</p>
                <p class="event-price">💶 €25</p>
                <p class="event-description">Discover authentic Catalan tapas with local wine pairings.</p>
                <button class="btn btn-primary">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

            this.bindEventsPageEvents();
        },

        // Render Social Page
        renderSocialPage() {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            // Включаем скролл обратно
            document.body.style.overflow = 'auto';

            mainContent.innerHTML = `
      <section class="page-header">
        <div class="container">
          <h1>🤝 Connect with People</h1>
          <p>Meet like-minded students and young professionals in Barcelona</p>
        </div>
      </section>

      <section class="social-section">
        <div class="container">
          <div class="social-grid">
            <div class="social-card">
              <div class="social-feature">
                <div class="feature-icon">👥</div>
                <h3>Find Study Groups</h3>
                <p>Connect with students from your university or field of study</p>
                <button class="btn btn-primary">Join Groups</button>
              </div>
            </div>

            <div class="social-card">
              <div class="social-feature">
                <div class="feature-icon">🌍</div>
                <h3>Language Exchange</h3>
                <p>Practice Spanish with locals and help them with your language</p>
                <button class="btn btn-primary">Start Exchange</button>
              </div>
            </div>

            <div class="social-card">
              <div class="social-feature">
                <div class="feature-icon">🎯</div>
                <h3>Activity Partners</h3>
                <p>Find people to explore Barcelona, visit museums, or go to events</p>
                <button class="btn btn-primary">Find Partners</button>
              </div>
            </div>

            <div class="social-card">
              <div class="social-feature">
                <div class="feature-icon">💼</div>
                <h3>Professional Network</h3>
                <p>Connect with young professionals and expand your network</p>
                <button class="btn btn-primary">Network</button>
              </div>
            </div>

            <div class="social-card">
              <div class="social-feature">
                <div class="feature-icon">🏠</div>
                <h3>Roommate Finder</h3>
                <p>Looking for accommodation? Find compatible roommates</p>
                <button class="btn btn-primary">Find Roommates</button>
              </div>
            </div>

            <div class="social-card">
              <div class="social-feature">
                <div class="feature-icon">🎉</div>
                <h3>Event Buddies</h3>
                <p>Don't go to events alone! Find people with similar interests</p>
                <button class="btn btn-primary">Find Buddies</button>
              </div>
            </div>
          </div>

          <div class="social-cta">
            <h2>Ready to Connect?</h2>
            <p>Create your profile and start meeting amazing people in Barcelona</p>
            <button class="btn btn-primary btn-large">Create Profile</button>
          </div>
        </div>
      </section>
    `;

            this.bindSocialPageEvents();
        },

        // Render Profile Page
        renderProfilePage() {
            const isAuthenticated = Storage?.Auth?.isAuthenticated() || false;
            const userData = Storage?.User?.getData() || {};

            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            // Включаем скролл обратно
            document.body.style.overflow = 'auto';

            if (!isAuthenticated) {
                // Show login prompt
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
                // Show profile page
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
                      <span class="detail-value">${userData.age || 'Not set'}</span>
                    </div>
                  </div>
                  <button class="btn btn-secondary">Edit Profile</button>
                </div>

                <div class="profile-card">
                  <h3>Your Favorites</h3>
                  <p>Places you've saved: <strong>${Storage?.Favorites?.getCount() || 0}</strong></p>
                  <button class="btn btn-secondary">View Favorites</button>
                </div>
              </div>

              <div class="profile-actions">
                <div class="profile-card">
                  <h3>Quick Actions</h3>
                  <div class="action-buttons">
                    <button class="btn btn-primary">Find Events</button>
                    <button class="btn btn-primary">Discover Places</button>
                    <button class="btn btn-primary">Connect with People</button>
                    <button class="btn btn-secondary">Settings</button>
                  </div>
                </div>

                <div class="profile-card">
                  <h3>Recent Activity</h3>
                  <p>Your recent visits and interactions will appear here.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
            }

            this.bindProfilePageEvents();
        },

        // Render 404 Page
        render404Page() {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            // Отключаем скролл для всей страницы
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

  // Event binding methods
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

    // Re-bind view controls if App is available
    if (window.App && App.setupViewControls) {
      App.setupViewControls();
    }
  },

  bindEventsPageEvents() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show toast for now
        const filter = btn.dataset.filter;
        Helpers.UI.showToast(`Filtering by: ${filter}`, CONSTANTS.TOAST_TYPES.INFO);
      });
    });
  },

  bindSocialPageEvents() {
    const socialButtons = document.querySelectorAll('.social-card .btn');
    socialButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        Helpers.UI.showToast('Social feature coming soon!', CONSTANTS.TOAST_TYPES.INFO);
      });
    });
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

// Make Router globally available
window.Router = Router;
