// Updated App.js with real API integration
const App = {
    // Application state
    state: {
        currentPage: 'home',
        venues: [],
        events: [],
        isLoading: false,
        filters: {
            type: '',
            district: '',
            priceRange: '',
            rating: 0
        },
        pagination: {
            page: 1,
            limit: CONSTANTS.PAGINATION.DEFAULT_LIMIT,
            hasMore: true
        }
    },

    // Initialize application
    init() {
        console.log('🚀 Initializing Barcelona Local Platform...');

        // Check if all required dependencies are loaded
        if (!this.checkDependencies()) {
            console.error('❌ Missing dependencies. Please check console for details.');
            return;
        }

        // Initialize components
        this.initializeComponents();

        // Load initial data
        this.loadInitialData();

        // Bind global events
        this.bindGlobalEvents();

        console.log('✅ Application initialized successfully!');
    },

    // Check if all dependencies are loaded
    checkDependencies() {
        const requiredGlobals = ['CONFIG', 'CONSTANTS', 'Helpers', 'Storage', 'Navbar', 'VenueCard', 'Router'];
        const missing = requiredGlobals.filter(name => typeof window[name] === 'undefined');

        if (missing.length > 0) {
            console.error('Missing required dependencies:', missing);
            return false;
        }

        return true;
    },

    // Initialize all components
    initializeComponents() {
        // Initialize router first
        Router.init();

        // Initialize navbar
        Navbar.init();

        // Set up modal close functionality
        this.setupModals();

        console.log('📦 Components initialized');
    },

    // Load initial data
    async loadInitialData() {
        try {
            this.state.isLoading = true;

            // Load venues only if we're on the home page
            if (Router.currentRoute === 'home') {
                Helpers.UI.showLoading();
                await this.loadVenues();
            }

            console.log('📊 Initial data loaded');
        } catch (error) {
            console.error('Error loading initial data:', error);
            Helpers.UI.showToast('Failed to load data', CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            this.state.isLoading = false;
            Helpers.UI.hideLoading();
        }
    },

    // Load venues with current filters - NOW USING REAL API
    async loadVenues(append = false) {
        try {
            const params = new URLSearchParams();

            // Add filters to API request
            if (this.state.filters.type) {
                params.append('type', this.state.filters.type);
            }
            if (this.state.filters.district) {
                params.append('district', this.state.filters.district);
            }
            if (this.state.filters.priceRange) {
                params.append('priceRange', this.state.filters.priceRange);
            }

            // Add pagination
            params.append('page', this.state.pagination.page);
            params.append('limit', this.state.pagination.limit);

            // Make API request to your PHP backend
            const response = await fetch(`${CONFIG.API.BASE_URL}/venues?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch venues');
            }

            // Update state with real data
            if (append) {
                this.state.venues = [...this.state.venues, ...data.data];
            } else {
                this.state.venues = data.data;
            }

            // Update pagination state
            this.state.pagination.hasMore = data.page * data.limit < data.total;

            // Render venues
            if (append) {
                VenueCard.append(data.data, 'results-container');
            } else {
                VenueCard.render(this.state.venues, 'results-container');
            }

            // Update results title
            this.updateResultsTitle(data.total);

            // Show/hide load more button
            this.updateLoadMoreButton();

            console.log(`📍 Loaded ${data.data.length} venues from API`);

        } catch (error) {
            console.error('Error loading venues:', error);

            // Show user-friendly error message
            Helpers.UI.showToast(
                'Unable to load venues. Please check your connection.',
                CONSTANTS.TOAST_TYPES.ERROR
            );

            // Show empty state in UI
            const container = Helpers.DOM.get('results-container');
            if (container) {
                container.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Unable to load venues</h3>
                        <p>Please check your internet connection and try again.</p>
                        <button class="btn btn-primary" onclick="App.loadVenues()">Retry</button>
                    </div>
                `;
            }
        }
    },

    // Load events - NOW USING REAL API
    async loadEvents() {
        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/${CONFIG.API.ENDPOINTS.EVENTS.LIST}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch events');
            }

            this.state.events = data.data;

            console.log(`🎉 Loaded ${data.data.length} events from API`);
            return data.data;

        } catch (error) {
            console.error('Error loading events:', error);
            Helpers.UI.showToast('Failed to load events', CONSTANTS.TOAST_TYPES.ERROR);
            return [];
        }
    },

    // Update results title with real count
    updateResultsTitle(totalCount = null) {
        const titleElement = Helpers.DOM.get('results-title');
        if (!titleElement) return;

        const count = totalCount || this.state.venues.length;
        const hasFilters = Object.values(this.state.filters).some(filter => filter);

        if (hasFilters) {
            titleElement.textContent = `Found ${count} place${count !== 1 ? 's' : ''}`;
        } else {
            titleElement.textContent = `${count} Popular Places`;
        }
    },

    // Update load more button visibility
    updateLoadMoreButton() {
        const loadMoreSection = document.querySelector('.load-more');
        if (!loadMoreSection) return;

        if (this.state.pagination.hasMore) {
            loadMoreSection.style.display = 'block';
        } else {
            loadMoreSection.style.display = 'none';
        }
    },

    // Setup modal functionality
    setupModals() {
        const modal = Helpers.DOM.get('venue-modal');
        const closeBtn = document.querySelector('.modal-close');

        if (modal && closeBtn) {
            // Close modal when clicking close button
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    },

    // Setup view controls
    setupViewControls() {
        const viewButtons = document.querySelectorAll('.view-btn');

        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Change view
                const view = btn.dataset.view;
                this.changeView(view);
            });
        });

        // Setup load more button
        const loadMoreBtn = Helpers.DOM.get('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreVenues();
            });
        }
    },

    // Change view type
    changeView(viewType) {
        const container = Helpers.DOM.get('results-container');
        if (!container) return;

        // Remove existing view classes
        container.classList.remove('grid-view', 'list-view', 'map-view');

        // Add new view class
        container.classList.add(`${viewType}-view`);

        // For now, just show a message for non-grid views
        if (viewType === 'list') {
            Helpers.UI.showToast('List view - Coming soon!', CONSTANTS.TOAST_TYPES.INFO);
        } else if (viewType === 'map') {
            Helpers.UI.showToast('Map view - Coming soon!', CONSTANTS.TOAST_TYPES.INFO);
        }
    },

    // Load more venues
    async loadMoreVenues() {
        if (!this.state.pagination.hasMore || this.state.isLoading) {
            return;
        }

        this.state.pagination.page++;
        this.state.isLoading = true;

        const loadMoreBtn = Helpers.DOM.get('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Loading...';
            loadMoreBtn.disabled = true;
        }

        try {
            await this.loadVenues(true);
        } finally {
            this.state.isLoading = false;
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Load More';
                loadMoreBtn.disabled = false;
            }
        }
    },

    // Apply filters
    async applyFilters(filters) {
        this.state.filters = { ...this.state.filters, ...filters };
        this.state.pagination.page = 1;

        Helpers.UI.showLoading();
        await this.loadVenues();
        Helpers.UI.hideLoading();
    },

    // Clear all filters
    async clearFilters() {
        this.state.filters = {
            type: '',
            district: '',
            priceRange: '',
            rating: 0
        };
        this.state.pagination.page = 1;

        Helpers.UI.showLoading();
        await this.loadVenues();
        Helpers.UI.hideLoading();
    },

    // Test API connection
    async testAPIConnection() {
        try {
            console.log('🔍 Testing API connection...');

            // Test venues endpoint
            const venuesResponse = await fetch(`${CONFIG.API.BASE_URL}/venues?limit=1`);
            console.log('Venues API status:', venuesResponse.status);

            // Test events endpoint
            const eventsResponse = await fetch(`${CONFIG.API.BASE_URL}/events`);
            console.log('Events API status:', eventsResponse.status);

            if (venuesResponse.ok && eventsResponse.ok) {
                console.log('✅ API connection successful');
                Helpers.UI.showToast('Connected to server!', CONSTANTS.TOAST_TYPES.SUCCESS);
                return true;
            } else {
                throw new Error('API endpoints not responding correctly');
            }

        } catch (error) {
            console.error('❌ API connection failed:', error);
            Helpers.UI.showToast('Server connection failed', CONSTANTS.TOAST_TYPES.ERROR);
            return false;
        }
    },

    // Bind global events
    bindGlobalEvents() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange();
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            Helpers.UI.showToast('Connection restored', CONSTANTS.TOAST_TYPES.SUCCESS);
            // Reload data when back online
            this.loadVenues();
        });

        window.addEventListener('offline', () => {
            Helpers.UI.showToast('No internet connection', CONSTANTS.TOAST_TYPES.WARNING);
        });

        // Handle explore button
        const exploreBtn = Helpers.DOM.get('explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                Helpers.UI.scrollTo(document.querySelector('.search-section'), 80);
            });
        }

        console.log('🔗 Global events bound');
    },

    // Handle route changes
    handleRouteChange() {
        const hash = window.location.hash.slice(1);

        if (hash.startsWith('venue=')) {
            const venueId = hash.split('=')[1];
            VenueCard.showVenueDetails(venueId);
        }
    },

    // Utility methods
    utils: {
        // Show error message
        showError(message) {
            Helpers.UI.showToast(message, CONSTANTS.TOAST_TYPES.ERROR);
        },

        // Show success message
        showSuccess(message) {
            Helpers.UI.showToast(message, CONSTANTS.TOAST_TYPES.SUCCESS);
        },

        // Log app info
        logAppInfo() {
            console.log('%c🏛️ Barcelona Local Platform', 'font-size: 20px; color: #667eea;');
            console.log('Version:', CONFIG.APP.VERSION);
            console.log('API URL:', CONFIG.API.BASE_URL);
            console.log('Environment:', CONFIG.API.BASE_URL.includes('localhost') ? 'Development' : 'Production');
            console.log('User authenticated:', Storage.Auth.isAuthenticated());
            console.log('Favorites count:', Storage.Favorites.getCount());
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.utils.logAppInfo();

    // Test API connection on startup
    setTimeout(() => {
        App.testAPIConnection();
    }, 1000);
});

// Make App globally available for debugging
window.App = App;
