// Main Application for Barcelona Local Platform
const App = {
    // Application state
    state: {
        currentPage: 'home',
        venues: [],
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

    // Load venues with current filters
    async loadVenues(append = false) {
        try {
            // Mock API call - replace with real API when backend is ready
            const mockVenues = [
                {
                    id: 1,
                    name: 'Bar Central',
                    type: 'bar',
                    district: 'Eixample',
                    rating: 4.5,
                    priceRange: 'moderate',
                    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
                    description: 'Cozy bar in the heart of Eixample with great cocktails and atmosphere.',
                    distance: 0.8
                },
                {
                    id: 2,
                    name: 'Café del Born',
                    type: 'cafe',
                    district: 'Ciutat Vella',
                    rating: 4.3,
                    priceRange: 'budget',
                    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
                    description: 'Traditional café with amazing coffee and local pastries.',
                    distance: 1.2
                },
                {
                    id: 3,
                    name: 'Gràcia Tapas',
                    type: 'restaurant',
                    district: 'Gràcia',
                    rating: 4.7,
                    priceRange: 'moderate',
                    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
                    description: 'Authentic tapas in the bohemian neighborhood of Gràcia.',
                    distance: 2.1
                },
                {
                    id: 4,
                    name: 'Rooftop Sky',
                    type: 'bar',
                    district: 'Eixample',
                    rating: 4.6,
                    priceRange: 'expensive',
                    image: 'https://images.unsplash.com/photo-1566417109403-c9bbcb2ebd91?w=400',
                    description: 'Amazing rooftop bar with panoramic city views.',
                    distance: 0.5
                },
                {
                    id: 5,
                    name: 'Student Hub',
                    type: 'coworking',
                    district: 'Sarrià-Sant Gervasi',
                    rating: 4.4,
                    priceRange: 'budget',
                    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
                    description: 'Perfect coworking space for students and digital nomads.',
                    distance: 1.8
                },
                {
                    id: 6,
                    name: 'Picasso Museum Café',
                    type: 'cafe',
                    district: 'Ciutat Vella',
                    rating: 4.2,
                    priceRange: 'moderate',
                    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
                    description: 'Charming café near the famous Picasso Museum.',
                    distance: 1.4
                }
            ];

            // Apply filters
            let filteredVenues = mockVenues;

            if (this.state.filters.type) {
                filteredVenues = filteredVenues.filter(venue => venue.type === this.state.filters.type);
            }

            if (this.state.filters.district) {
                filteredVenues = filteredVenues.filter(venue => venue.district === this.state.filters.district);
            }

            if (this.state.filters.priceRange) {
                filteredVenues = filteredVenues.filter(venue => venue.priceRange === this.state.filters.priceRange);
            }

            // Update state
            if (append) {
                this.state.venues = [...this.state.venues, ...filteredVenues];
            } else {
                this.state.venues = filteredVenues;
            }

            // Render venues
            if (append) {
                VenueCard.append(filteredVenues, 'results-container');
            } else {
                VenueCard.render(this.state.venues, 'results-container');
            }

            // Update results title
            this.updateResultsTitle();

            // Show/hide load more button
            this.updateLoadMoreButton();

        } catch (error) {
            console.error('Error loading venues:', error);
            Helpers.UI.showToast('Failed to load venues', CONSTANTS.TOAST_TYPES.ERROR);
        }
    },

    // Update results title
    updateResultsTitle() {
        const titleElement = Helpers.DOM.get('results-title');
        if (!titleElement) return;

        const count = this.state.venues.length;
        const hasFilters = Object.values(this.state.filters).some(filter => filter);

        if (hasFilters) {
            titleElement.textContent = `Found ${count} place${count !== 1 ? 's' : ''}`;
        } else {
            titleElement.textContent = 'Popular Places';
        }
    },

    // Update load more button visibility
    updateLoadMoreButton() {
        const loadMoreSection = document.querySelector('.load-more');
        if (!loadMoreSection) return;

        // For demo purposes, hide after showing some venues
        if (this.state.venues.length >= 6) {
            loadMoreSection.style.display = 'none';
        } else {
            loadMoreSection.style.display = 'block';
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
        this.state.pagination.page++;
        await this.loadVenues(true);
    },

    // Apply filters
    applyFilters(filters) {
        this.state.filters = { ...this.state.filters, ...filters };
        this.state.pagination.page = 1;
        this.loadVenues();
    },

    // Clear all filters
    clearFilters() {
        this.state.filters = {
            type: '',
            district: '',
            priceRange: '',
            rating: 0
        };
        this.loadVenues();
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
});

// Make App globally available for debugging
window.App = App;
