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

            // Re-initialize search component
            if (window.SearchFilters) {
                SearchFilters.init();
            }

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
        <!-- Events Hero Section -->
        <section class="events-hero">
            <div class="container">
                <div class="events-hero-content">
                    <h1>🎉 Events in Barcelona</h1>
                    <p>Discover amazing events happening around the city. From cultural experiences to nightlife - find your perfect match!</p>
                    
                    <!-- Events Search -->
                    <div class="events-search-bar">
                        <input type="text" id="events-search" placeholder="Search events..." class="events-search-input">
                        <button class="events-search-btn">🔍</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Events Filters -->
        <section class="events-filters-section">
            <div class="container">
                <div class="events-filters-container">
                    <h3>📅 When?</h3>
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="all">All Events</button>
                        <button class="filter-tab" data-filter="today">Today</button>
                        <button class="filter-tab" data-filter="tomorrow">Tomorrow</button>
                        <button class="filter-tab" data-filter="weekend">This Weekend</button>
                        <button class="filter-tab" data-filter="week">This Week</button>
                    </div>
                    
                    <h3>🎯 What?</h3>
                    <div class="event-categories">
                        <button class="category-chip active" data-category="all">
                            <span class="chip-icon">🎉</span>
                            <span>All</span>
                        </button>
                        <button class="category-chip" data-category="nightlife">
                            <span class="chip-icon">🌙</span>
                            <span>Nightlife</span>
                        </button>
                        <button class="category-chip" data-category="cultural">
                            <span class="chip-icon">🎭</span>
                            <span>Cultural</span>
                        </button>
                        <button class="category-chip" data-category="food">
                            <span class="chip-icon">🍽️</span>
                            <span>Food & Drink</span>
                        </button>
                        <button class="category-chip" data-category="music">
                            <span class="chip-icon">🎵</span>
                            <span>Music</span>
                        </button>
                        <button class="category-chip" data-category="networking">
                            <span class="chip-icon">🤝</span>
                            <span>Networking</span>
                        </button>
                        <button class="category-chip" data-category="sports">
                            <span class="chip-icon">⚽</span>
                            <span>Sports</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Events Grid -->
        <section class="events-content">
            <div class="container">
                <div class="events-header">
                    <h2 id="events-results-title">Upcoming Events</h2>
                    <div class="events-view-controls">
                        <button class="events-view-btn active" data-view="grid">
                            <span>📱</span> Grid
                        </button>
                        <button class="events-view-btn" data-view="calendar">
                            <span>📅</span> Calendar
                        </button>
                    </div>
                </div>

                <div class="events-grid" id="events-container">
                    <!-- Loading placeholder -->
                    <div class="events-loading">
                        <div class="loading-spinner-events">🎉</div>
                        <p>Loading amazing events...</p>
                    </div>
                </div>

                <!-- Load More -->
                <div class="events-load-more" style="display: none;">
                    <button class="btn btn-secondary" id="load-more-events">Show More Events</button>
                </div>
            </div>
        </section>

        <!-- Featured Events Section -->
        <section class="featured-events">
            <div class="container">
                <h2>⭐ Featured This Week</h2>
                <div class="featured-events-slider" id="featured-events">
                    <!-- Will be populated by JS -->
                </div>
            </div>
        </section>
    `;

        this.bindEventsPageEvents();
        this.loadEventsData();
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
          <p>Meet like-minded students and young professionals in Barcelona. Build your network, make friends, and explore the city together!</p>
        </div>
      </section>

      <section class="social-section">
        <div class="container">
          <div class="social-grid">
            
            <div class="social-card" data-feature="study-groups">
              <div class="social-feature">
                <span class="feature-badge">Popular</span>
                <span class="feature-stats">127 groups</span>
                <div class="feature-icon">👥</div>
                <h3>Study Groups</h3>
                <p>Connect with students from your university or field of study. Share knowledge, collaborate on projects, and ace your exams together.</p>
                <button class="btn btn-primary">Find Study Buddies</button>
              </div>
            </div>

            <div class="social-card" data-feature="language-exchange">
              <div class="social-feature">
                <span class="feature-stats">89 matches</span>
                <div class="feature-icon">🌍</div>
                <h3>Language Exchange</h3>
                <p>Practice Spanish with locals while helping them with your native language. Perfect for improving skills and making international friends.</p>
                <button class="btn btn-primary">Start Exchange</button>
              </div>
            </div>

            <div class="social-card" data-feature="activity-partners">
              <div class="social-feature">
                <span class="feature-badge">New</span>
                <span class="feature-stats">156 activities</span>
                <div class="feature-icon">🎯</div>
                <h3>Activity Partners</h3>
                <p>Find people to explore Barcelona with! Visit museums, attend concerts, try new restaurants, or discover hidden gems together.</p>
                <button class="btn btn-primary">Find Adventure</button>
              </div>
            </div>

            <div class="social-card" data-feature="professional-network">
              <div class="social-feature">
                <span class="feature-stats">234 professionals</span>
                <div class="feature-icon">💼</div>
                <h3>Professional Network</h3>
                <p>Connect with young professionals in your industry. Attend networking events, find mentors, and build valuable career connections.</p>
                <button class="btn btn-primary">Network Now</button>
              </div>
            </div>

            <div class="social-card" data-feature="roommate-finder">
              <div class="social-feature">
                <span class="feature-badge">Hot</span>
                <span class="feature-stats">67 listings</span>
                <div class="feature-icon">🏠</div>
                <h3>Roommate Finder</h3>
                <p>Looking for accommodation? Find compatible roommates based on lifestyle, interests, and budget. Safe and verified profiles.</p>
                <button class="btn btn-primary">Find Roommates</button>
              </div>
            </div>

            <div class="social-card" data-feature="event-buddies">
              <div class="social-feature">
                <span class="feature-stats">342 events</span>
                <div class="feature-icon">🎉</div>
                <h3>Event Buddies</h3>
                <p>Never go to events alone again! Find people with similar interests to attend concerts, parties, workshops, and cultural events.</p>
                <button class="btn btn-primary">Find Event Partners</button>
              </div>
            </div>

          </div>

          <!-- Enhanced CTA Section -->
          <div class="social-cta">
            <h2>Ready to Connect?</h2>
            <p>Join thousands of students and young professionals who are already making meaningful connections in Barcelona</p>
            <button class="btn btn-primary btn-large" id="create-profile-btn">Create Your Profile</button>
            
            <!-- Quick Stats -->
            <div class="social-stats" style="margin-top: 2rem; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;">
              <div class="stat-item">
                <div class="stat-number">1,247</div>
                <div class="stat-label">Active Members</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">89%</div>
                <div class="stat-label">Success Rate</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">156</div>
                <div class="stat-label">Weekly Meetups</div>
              </div>
            </div>
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
                      <span class="detail-value">${userData.age_range || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                <div class="profile-card">
                  <h3>Your Favorites</h3>
                  <p>Places you've saved: <strong>${Storage?.Favorites?.getCount() || 0}</strong></p>
                  <button class="btn btn-secondary">View Favorites</button>
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

    // Re-initialize search filters if they exist
    if (window.SearchFilters) {
      SearchFilters.init();
    }

    // Re-bind view controls if App is available
    if (window.App && App.setupViewControls) {
      App.setupViewControls();
    }
  },

    bindEventsPageEvents() {
        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const filter = tab.dataset.filter;
                this.filterEventsByTime(filter);
            });
        });

        // Category chips
        const categoryChips = document.querySelectorAll('.category-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const category = chip.dataset.category;
                this.filterEventsByCategory(category);
            });
        });

        // Events search
        const searchInput = document.getElementById('events-search');
        const searchBtn = document.querySelector('.events-search-btn');

        if (searchInput && Helpers.Utils.debounce) {
            searchInput.addEventListener('input',
                Helpers.Utils.debounce(() => {
                    this.searchEvents(searchInput.value);
                }, 300)
            );
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchEvents(searchInput ? searchInput.value : '');
            });
        }

        // View controls
        const viewButtons = document.querySelectorAll('.events-view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const view = btn.dataset.view;
                if (view === 'calendar') {
                    Helpers.UI.showToast('Calendar view coming soon!', CONSTANTS.TOAST_TYPES.INFO);
                }
            });
        });
    },

    async loadEventsData() {
        try {
            const loadingElement = document.querySelector('.events-loading');
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }

            // Загружаем события из API
            let events = [];

            try {
                const response = await fetch(`${CONFIG.API.BASE_URL}/events`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        events = data.data;
                    }
                }
            } catch (error) {
                console.log('Using mock data due to API error:', error);
            }

            // Если нет данных из API, используем моковые данные
            if (events.length === 0) {
                events = this.getMockEvents();
            }

            this.renderEvents(events);
            this.renderFeaturedEvents(events.filter(e => e.is_featured));

        } catch (error) {
            console.error('Error loading events:', error);
            this.renderEventsError();
        }
    },

    getMockEvents() {
        return [
            {
                id: 1,
                title: "Live Jazz Night at Jamboree",
                description: "Experience authentic jazz music in Barcelona's most iconic jazz club. Featuring local and international artists with an intimate atmosphere.",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
                venue: "Jamboree Jazz Club",
                venue_district: "Ciutat Vella",
                event_date: this.getDateString(0),
                event_time: "21:00",
                price: 15,
                category: "music",
                is_featured: true,
                attendees: 45,
                max_attendees: 80,
                popularity: "high"
            },
            {
                id: 2,
                title: "Student Networking Meetup",
                description: "Connect with fellow students and young professionals. Great opportunity to make new friends, share experiences, and expand your network in Barcelona.",
                image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop",
                venue: "Café Central",
                venue_district: "Eixample",
                event_date: this.getDateString(1),
                event_time: "19:00",
                price: 0,
                category: "networking",
                is_featured: false,
                attendees: 23,
                max_attendees: 50,
                popularity: "medium"
            },
            {
                id: 3,
                title: "Tapas & Wine Tasting Tour",
                description: "Discover the best tapas bars in Barcelona with our guided tour. Includes wine pairings, local insights, and hidden gems only locals know about.",
                image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
                venue: "Multiple Venues",
                venue_district: "Gràcia",
                event_date: this.getDateString(3),
                event_time: "20:00",
                price: 35,
                category: "food",
                is_featured: true,
                attendees: 12,
                max_attendees: 15,
                popularity: "high"
            },
            {
                id: 4,
                title: "Rooftop Party - Electronic Music",
                description: "Dance under the stars with the best views of Barcelona. Electronic music, creative cocktails, amazing vibes, and unforgettable sunset views.",
                image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop",
                venue: "Sky Bar",
                venue_district: "Eixample",
                event_date: this.getDateString(5),
                event_time: "23:00",
                price: 25,
                category: "nightlife",
                is_featured: false,
                attendees: 67,
                max_attendees: 100,
                popularity: "high"
            },
            {
                id: 5,
                title: "Contemporary Art Gallery Opening",
                description: "Exclusive opening of contemporary art exhibition featuring emerging local artists. Wine, networking, and thought-provoking modern art included.",
                image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=600&h=400&fit=crop",
                venue: "Galeria Moderna",
                venue_district: "El Born",
                event_date: this.getDateString(7),
                event_time: "18:30",
                price: 10,
                category: "cultural",
                is_featured: true,
                attendees: 34,
                max_attendees: 60,
                popularity: "medium"
            },
            {
                id: 6,
                title: "Beach Volleyball Tournament",
                description: "Join our friendly beach volleyball tournament at Barceloneta. All skill levels welcome! Prizes, fun, and post-game beers included.",
                image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
                venue: "Barceloneta Beach",
                venue_district: "Ciutat Vella",
                event_date: this.getDateString(2),
                event_time: "16:00",
                price: 5,
                category: "sports",
                is_featured: false,
                attendees: 28,
                max_attendees: 32,
                popularity: "medium"
            }
        ];
    },

    getDateString(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0];
    },

    renderEvents(events) {
        const container = document.getElementById('events-container');
        if (!container) return;

        const loadingElement = container.querySelector('.events-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }

        if (events.length === 0) {
            container.innerHTML = `
            <div class="no-events">
                <div class="no-events-icon">📅</div>
                <h3>No Events Found</h3>
                <p>Try adjusting your filters or check back later for new events!</p>
            </div>
        `;
            return;
        }

        container.innerHTML = events.map(event => this.createEventCard(event)).join('');
        this.bindEventCardEvents();
    },

    createEventCard(event) {
        const price = event.price === 0 ? 'Free' : `€${event.price}`;
        const categoryIcon = this.getCategoryIcon(event.category);
        const dateFormatted = this.formatEventDate(event.event_date);
        const attendancePercentage = Math.round((event.attendees / event.max_attendees) * 100);
        const popularityBadge = this.getPopularityBadge(event.popularity, attendancePercentage);

        return `
        <div class="event-card" data-event-id="${event.id}" data-category="${event.category}">
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}" loading="lazy">
                <div class="event-category-badge">
                    <span class="category-icon">${categoryIcon}</span>
                    <span class="category-text">${Helpers.String.capitalize(event.category)}</span>
                </div>
                ${event.is_featured ? '<div class="featured-badge">⭐ Featured</div>' : ''}
                ${popularityBadge}
                <div class="event-favorite-btn" data-event-id="${event.id}">
                    <span class="heart-icon">🤍</span>
                </div>
            </div>
            
            <div class="event-content">
                <div class="event-date-time">
                    <span class="event-date">📅 ${dateFormatted}</span>
                    <span class="event-time">🕐 ${event.event_time}</span>
                </div>
                
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${Helpers.String.truncate(event.description, 100)}</p>
                
                <div class="event-venue">
                    <span class="venue-icon">📍</span>
                    <span class="venue-name">${event.venue}</span>
                    <span class="venue-district">${event.venue_district}</span>
                </div>
                
                <div class="event-stats">
                    <div class="attendance-bar">
                        <div class="attendance-fill" style="width: ${attendancePercentage}%"></div>
                    </div>
                    <div class="attendance-text">
                        <span class="attendees-count">${event.attendees}/${event.max_attendees}</span>
                        <span class="attendees-label">attendees</span>
                    </div>
                </div>
                
                <div class="event-footer">
                    <div class="event-price">
                        <span class="price-amount">${price}</span>
                        ${event.price > 0 ? '<span class="price-label">per person</span>' : '<span class="price-label">🎉 Free entry</span>'}
                    </div>
                </div>
                
                <div class="event-actions">
                    <button class="btn btn-primary event-join-btn" data-event-id="${event.id}">
                        <span class="btn-icon">🎟️</span>
                        <span class="btn-text">Join Event</span>
                    </button>
                    <button class="btn btn-secondary event-share-btn" data-event-id="${event.id}">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">Share</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    },

    renderFeaturedEvents(events) {
        const container = document.getElementById('featured-events');
        if (!container || events.length === 0) return;

        container.innerHTML = events.map(event => `
        <div class="featured-event-card" data-event-id="${event.id}">
            <div class="featured-event-image">
                <img src="${event.image}" alt="${event.title}">
                <div class="featured-overlay">
                    <span class="featured-category">${this.getCategoryIcon(event.category)} ${Helpers.String.capitalize(event.category)}</span>
                </div>
            </div>
            <div class="featured-event-info">
                <h4>${event.title}</h4>
                <p class="featured-date">📅 ${this.formatEventDate(event.event_date)} at ${event.event_time}</p>
                <p class="featured-venue">📍 ${event.venue}, ${event.venue_district}</p>
                <div class="featured-footer">
                    <div class="featured-event-price">${event.price === 0 ? 'Free' : `€${event.price}`}</div>
                    <div class="featured-attendees">👥 ${event.attendees} going</div>
                </div>
            </div>
        </div>
    `).join('');
    },

    bindEventCardEvents() {
        const eventCards = document.querySelectorAll('.event-card');
        const joinButtons = document.querySelectorAll('.event-join-btn');
        const shareButtons = document.querySelectorAll('.event-share-btn');
        const favoriteButtons = document.querySelectorAll('.event-favorite-btn');

        eventCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.event-actions') && !e.target.closest('.event-favorite-btn')) {
                    const eventId = card.dataset.eventId;
                    this.showEventDetails(eventId);
                }
            });

            // Hover effect
            card.addEventListener('mouseenter', () => {
                this.addEventCardHoverEffect(card);
            });
        });

        joinButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                this.joinEvent(eventId, btn);
            });
        });

        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                this.shareEvent(eventId);
            });
        });

        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = btn.dataset.eventId;
                this.toggleEventFavorite(eventId, btn);
            });
        });
    },

    getCategoryIcon(category) {
        const icons = {
            'music': '🎵',
            'networking': '🤝',
            'food': '🍽️',
            'nightlife': '🌙',
            'cultural': '🎭',
            'sports': '⚽'
        };
        return icons[category] || '🎉';
    },

    getPopularityBadge(popularity, attendancePercentage) {
        if (attendancePercentage >= 80) {
            return '<div class="popularity-badge hot">🔥 Almost Full</div>';
        } else if (popularity === 'high') {
            return '<div class="popularity-badge trending">📈 Trending</div>';
        } else if (attendancePercentage >= 50) {
            return '<div class="popularity-badge popular">⭐ Popular</div>';
        }
        return '';
    },

    formatEventDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    },

// Обработчики действий
    joinEvent(eventId, button) {
        // Add loading state
        button.classList.add('loading');
        const btnText = button.querySelector('.btn-text');
        const btnIcon = button.querySelector('.btn-icon');
        const originalText = btnText.textContent;

        btnText.textContent = 'Joining...';
        btnIcon.textContent = '⏳';
        button.disabled = true;

        // Simulate API call
        setTimeout(() => {
            button.classList.remove('loading');
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.disabled = false;

            btnText.textContent = 'Joined!';
            btnIcon.textContent = '✅';

            Helpers.UI.showToast('🎉 You joined the event!', CONSTANTS.TOAST_TYPES.SUCCESS);

            // Обновляем счетчик участников
            const card = button.closest('.event-card');
            if (card) {
                const attendeesElement = card.querySelector('.attendees-count');
                if (attendeesElement) {
                    const [current, max] = attendeesElement.textContent.split('/');
                    const newCount = parseInt(current) + 1;
                    attendeesElement.textContent = `${newCount}/${max}`;

                    // Обновляем progress bar
                    const progressBar = card.querySelector('.attendance-fill');
                    if (progressBar) {
                        const percentage = (newCount / parseInt(max)) * 100;
                        progressBar.style.width = `${percentage}%`;
                    }
                }
            }
        }, 1000);
    },

    shareEvent(eventId) {
        const url = `${window.location.origin}${window.location.pathname}#event=${eventId}`;

        if (navigator.share) {
            navigator.share({
                title: 'Check out this event!',
                text: 'Found this amazing event on BarcelonaLocal',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                Helpers.UI.showToast('Event link copied to clipboard!', CONSTANTS.TOAST_TYPES.SUCCESS);
            });
        }
    },

    toggleEventFavorite(eventId, button) {
        const heartIcon = button.querySelector('.heart-icon');
        const isFavorite = heartIcon.textContent === '❤️';

        if (isFavorite) {
            heartIcon.textContent = '🤍';
            button.classList.remove('active');
            Helpers.UI.showToast('Removed from favorites', CONSTANTS.TOAST_TYPES.INFO);
        } else {
            heartIcon.textContent = '❤️';
            button.classList.add('active');
            Helpers.UI.showToast('Added to favorites!', CONSTANTS.TOAST_TYPES.SUCCESS);
        }
    },

    addEventCardHoverEffect(card) {
        const image = card.querySelector('.event-image img');
        if (image) {
            image.style.transform = 'scale(1.05)';
            setTimeout(() => {
                image.style.transform = 'scale(1)';
            }, 300);
        }
    },

    showEventDetails(eventId) {
        Helpers.UI.showToast('Event details modal coming soon!', CONSTANTS.TOAST_TYPES.INFO);
    },

// Фильтрация событий
    filterEventsByTime(filter) {
        const cards = document.querySelectorAll('.event-card');
        let visibleCount = 0;

        cards.forEach(card => {
            // Здесь можно добавить реальную логику фильтрации
            card.style.display = 'block';
            visibleCount++;
        });

        Helpers.UI.showToast(`Showing ${visibleCount} events for: ${filter}`, CONSTANTS.TOAST_TYPES.INFO);
    },

    filterEventsByCategory(category) {
        const cards = document.querySelectorAll('.event-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        Helpers.UI.showToast(`Found ${visibleCount} ${category === 'all' ? '' : category} events`, CONSTANTS.TOAST_TYPES.INFO);
    },

    searchEvents(query) {
        if (query.length > 2) {
            const cards = document.querySelectorAll('.event-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const title = card.querySelector('.event-title').textContent.toLowerCase();
                const description = card.querySelector('.event-description').textContent.toLowerCase();
                const venue = card.querySelector('.venue-name').textContent.toLowerCase();

                if (title.includes(query.toLowerCase()) ||
                    description.includes(query.toLowerCase()) ||
                    venue.includes(query.toLowerCase())) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            Helpers.UI.showToast(`Found ${visibleCount} events for: "${query}"`, CONSTANTS.TOAST_TYPES.INFO);
        } else {
            // Показываем все карточки если запрос короткий
            const cards = document.querySelectorAll('.event-card');
            cards.forEach(card => {
                card.style.display = 'block';
            });
        }
    },

    renderEventsError() {
        const container = document.getElementById('events-container');
        if (!container) return;

        container.innerHTML = `
        <div class="events-error">
            <div class="error-icon">⚠️</div>
            <h3>Unable to load events</h3>
            <p>Please check your connection and try again.</p>
            <button class="btn btn-primary" onclick="Router.loadEventsData()">Retry</button>
        </div>
    `;
    },


    bindSocialPageEvents() {
        const socialCards = document.querySelectorAll('.social-card');
        const createProfileBtn = document.getElementById('create-profile-btn');

        // Enhanced card interactions
        socialCards.forEach(card => {
            const button = card.querySelector('.btn');
            const feature = card.dataset.feature;

            // Card click handler
            card.addEventListener('click', (e) => {
                // Если клик не по кнопке, то показываем детали
                if (!e.target.closest('.btn')) {
                    this.showFeatureDetails(feature);
                }
            });

            // Button click handler
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleFeatureAction(feature, button);
                });
            }

            // Add hover sound effect (optional)
            card.addEventListener('mouseenter', () => {
                // Можно добавить звуковой эффект или haptic feedback
                this.addHoverEffect(card);
            });
        });

        // Create profile button
        if (createProfileBtn) {
            createProfileBtn.addEventListener('click', () => {
                this.handleCreateProfile();
            });
        }
    },

    handleFeatureAction(feature, button) {
        // Add loading state
        button.classList.add('loading');
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;

        // Simulate API call
        setTimeout(() => {
            button.classList.remove('loading');
            button.disabled = false;

            switch(feature) {
                case 'study-groups':
                    button.textContent = 'Joined! ✓';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                    Helpers.UI.showToast('🎓 Welcome to Study Groups!', CONSTANTS.TOAST_TYPES.SUCCESS);
                    break;

                case 'language-exchange':
                    button.textContent = 'Matched! ✓';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                    Helpers.UI.showToast('🌍 Found your language partner!', CONSTANTS.TOAST_TYPES.SUCCESS);
                    break;

                case 'activity-partners':
                    button.textContent = 'Ready to Explore! ✓';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                    Helpers.UI.showToast('🎯 Adventure awaits!', CONSTANTS.TOAST_TYPES.SUCCESS);
                    break;

                case 'professional-network':
                    button.textContent = 'Connected! ✓';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                    Helpers.UI.showToast('💼 Professional network activated!', CONSTANTS.TOAST_TYPES.SUCCESS);
                    break;

                case 'roommate-finder':
                    button.textContent = 'Searching... ✓';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                    Helpers.UI.showToast('🏠 Roommate search started!', CONSTANTS.TOAST_TYPES.SUCCESS);
                    break;

                case 'event-buddies':
                    button.textContent = 'Ready to Party! ✓';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                    Helpers.UI.showToast('🎉 Event buddy system activated!', CONSTANTS.TOAST_TYPES.SUCCESS);
                    break;

                default:
                    button.textContent = originalText;
                    Helpers.UI.showToast('Feature coming soon!', CONSTANTS.TOAST_TYPES.INFO);
            }
        }, 1000);
    },

    showFeatureDetails(feature) {
        const details = {
            'study-groups': {
                title: '👥 Study Groups',
                description: 'Find study partners in your field, join existing groups, or create your own. Connect based on university, subject, or study style.',
                features: ['Match by university & major', 'Schedule study sessions', 'Share resources & notes', 'Group chat & collaboration']
            },
            'language-exchange': {
                title: '🌍 Language Exchange',
                description: 'Practice languages with native speakers in a fun, casual environment. Perfect for improving conversational skills.',
                features: ['1-on-1 language sessions', 'Group language meetups', 'Cultural exchange events', 'Progress tracking']
            },
            'activity-partners': {
                title: '🎯 Activity Partners',
                description: 'Never explore Barcelona alone! Find people who share your interests and discover the city together.',
                features: ['Museum visits', 'Food tours', 'Hiking & outdoor activities', 'Concerts & nightlife']
            },
            'professional-network': {
                title: '💼 Professional Network',
                description: 'Build meaningful professional relationships with other young professionals in Barcelona.',
                features: ['Industry-specific groups', 'Networking events', 'Mentorship programs', 'Career workshops']
            },
            'roommate-finder': {
                title: '🏠 Roommate Finder',
                description: 'Find the perfect roommate based on lifestyle compatibility, budget, and location preferences.',
                features: ['Compatibility matching', 'Verified profiles', 'Budget filters', 'Location preferences']
            },
            'event-buddies': {
                title: '🎉 Event Buddies',
                description: 'Attend events with like-minded people. From concerts to workshops, never go alone again!',
                features: ['Event matching', 'Group bookings', 'Shared transportation', 'Event reviews & photos']
            }
        };

        const detail = details[feature];
        if (detail) {
            // Создаем модальное окно с деталями
            const modal = `
            <div class="feature-detail-modal">
                <h3>${detail.title}</h3>
                <p>${detail.description}</p>
                <ul>
                    ${detail.features.map(f => `<li>✓ ${f}</li>`).join('')}
                </ul>
                <button class="btn btn-primary">Get Started</button>
            </div>
        `;

            Helpers.UI.showToast(detail.title + ' - Coming soon!', CONSTANTS.TOAST_TYPES.INFO);
        }
    },

    addHoverEffect(card) {
        // Можно добавить дополнительные эффекты
        const icon = card.querySelector('.feature-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 300);
        }
    },

// Обработка создания профиля
    handleCreateProfile() {
        // Проверяем аутентификацию
        if (!Storage.Auth.isAuthenticated()) {
            if (window.Navbar) {
                Navbar.showAuthModal('register');
            }
        } else {
            Helpers.UI.showToast('Profile creation coming soon!', CONSTANTS.TOAST_TYPES.INFO);
        }
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
