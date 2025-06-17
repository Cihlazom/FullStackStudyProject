const App = {
    state: {
        currentPage: 'home',
        venues: [],
        isLoading: false,
        filters: {
            query: '',
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

    init() {
        console.log('🚀 Initializing Barcelona Local Platform...');

        if (!this.checkDependencies()) {
            console.error('❌ Missing dependencies. Please check console for details.');
            return;
        }

        this.initializeComponents();

        this.loadInitialData();

        this.bindGlobalEvents();

        console.log('✅ Application initialized successfully!');
    },

    checkDependencies() {
        const requiredGlobals = ['CONFIG', 'CONSTANTS', 'Helpers', 'Storage', 'Navbar', 'VenueCard', 'Router'];
        const missing = requiredGlobals.filter(name => typeof window[name] === 'undefined');

        if (missing.length > 0) {
            console.error('Missing required dependencies:', missing);
            return false;
        }

        return true;
    },

    initializeComponents() {
        Router.init();

        Navbar.init();

        if (window.AuthUtils) {
            AuthUtils.init();
        }

        if (window.SearchFilters) {
            console.log('🔄 Initializing SearchFilters...');
            console.log('SearchFilters has state:', !!SearchFilters.state);

            if (SearchFilters.state) {
                SearchFilters.init();
                console.log('✅ New SearchFilters initialized');
            } else {
                console.log('⚠️ Old SearchFilters detected, skipping');
            }
        } else {
            console.error('❌ SearchFilters not found!');
        }

        this.setupModals();

        console.log('📦 Components initialized');
    },

    async loadInitialData() {
        try {
            this.state.isLoading = true;

            if (Router.currentRoute === 'home') {
                Helpers.UI.showLoading();

                if (window.SearchFilters) {
                    SearchFilters.loadFiltersFromURL();
                } else {
                    await this.loadVenues();
                }
            }

            if (Storage.Auth.isAuthenticated() && window.VenueCard) {
                await VenueCard.loadUserFavorites();
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

    async onUserLogin() {
        if (window.VenueCard) {
            await VenueCard.loadUserFavorites();
            VenueCard.refreshFavoritesUI();
        }
        console.log('🔄 User data refreshed after login');
    },

    async loadVenues(append = false) {
        try {
            const params = new URLSearchParams();

            if (this.state.filters.query) {
                params.append('search', this.state.filters.query);
            }

            if (this.state.filters.type) {
                params.append('type', this.state.filters.type);
            }
            if (this.state.filters.district) {
                params.append('district', this.state.filters.district);
            }
            if (this.state.filters.priceRange) {
                params.append('priceRange', this.state.filters.priceRange);
            }

            params.append('page', this.state.pagination.page);
            params.append('limit', this.state.pagination.limit);

            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.VENUES.PARAMS(params)}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch venues');
            }

            if (append) {
                this.state.venues = [...this.state.venues, ...data.data];
            } else {
                this.state.venues = data.data;
            }

            this.state.pagination.hasMore = data.page * data.limit < data.total;

            if (append) {
                VenueCard.append(data.data, 'results-container');
            } else {
                VenueCard.render(this.state.venues, 'results-container');
            }

            this.updateResultsTitle(data.total);

            this.updateLoadMoreButton();

            console.log(`📍 Loaded ${data.data.length} venues from API`);

            if (this.state.filters.query && !append) {
                Storage.SearchHistory.add(this.state.filters.query);
            }

        } catch (error) {
            console.error('Error loading venues:', error);

            Helpers.UI.showToast(
                'Unable to load venues. Please check your connection.',
                CONSTANTS.TOAST_TYPES.ERROR
            );

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

    async applyFilters(filters) {
        this.state.filters = { ...this.state.filters, ...filters };
        this.state.pagination.page = 1;

        Helpers.UI.showLoading();

        try {
            await this.loadVenues();

            this.updateSearchStats();

        } catch (error) {
            console.error('Filter application failed:', error);
            Helpers.UI.showToast('Failed to apply filters', CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            Helpers.UI.hideLoading();
        }
    },

    async clearFilters() {
        this.state.filters = {
            query: '',
            type: '',
            district: '',
            priceRange: '',
            rating: 0
        };
        this.state.pagination.page = 1;

        Helpers.UI.showLoading();

        try {
            await this.loadVenues();
            this.updateSearchStats();
        } finally {
            Helpers.UI.hideLoading();
        }
    },

    updateResultsTitle(totalCount = null) {
        const titleElement = Helpers.DOM.get('results-title');
        if (!titleElement) return;

        const count = totalCount || this.state.venues.length;
        const hasQuery = this.state.filters.query;
        const hasFilters = Object.values(this.state.filters).some(filter => filter && filter !== this.state.filters.query);

        if (hasQuery) {
            titleElement.textContent = `Found ${count} result${count !== 1 ? 's' : ''} for "${this.state.filters.query}"`;
        } else if (hasFilters) {
            titleElement.textContent = `Found ${count} place${count !== 1 ? 's' : ''}`;
        } else {
            titleElement.textContent = `${count} Popular Places`;
        }
    },

    updateSearchStats() {
        const count = this.state.venues.length;
        const hasQuery = this.state.filters.query;

        if (hasQuery && count === 0) {
            this.showSearchSuggestions();
        }
    },

    showSearchSuggestions() {
        const container = Helpers.DOM.get('results-container');
        if (!container) return;

        const recentSearches = Storage.SearchHistory.getRecent();
        const suggestions = ['restaurants in Gràcia', 'bars near me', 'cheap cafes', 'coworking spaces'];

        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try searching for something else or check out these suggestions:</p>
                
                <div class="search-suggestions">
                    <h4>Popular searches:</h4>
                    <div class="suggestion-tags">
                        ${suggestions.map(suggestion =>
            `<button class="suggestion-tag" onclick="App.applySuggestion('${suggestion}')">${suggestion}</button>`
        ).join('')}
                    </div>
                </div>
                
                ${recentSearches.length > 0 ? `
                <div class="recent-searches">
                    <h4>Recent searches:</h4>
                    <div class="suggestion-tags">
                        ${recentSearches.slice(0, 5).map(search =>
            `<button class="suggestion-tag" onclick="App.applySuggestion('${search.query}')">${search.query}</button>`
        ).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    },

    applySuggestion(suggestion) {
        if (window.SearchFilters) {
            const searchInput = Helpers.DOM.get('search-query');
            if (searchInput) {
                searchInput.value = suggestion;
                SearchFilters.performSearch();
            }
        }
    },

    updateLoadMoreButton() {
        const loadMoreSection = document.querySelector('.load-more');
        if (!loadMoreSection) return;

        if (this.state.pagination.hasMore) {
            loadMoreSection.style.display = 'block';
        } else {
            loadMoreSection.style.display = 'none';
        }
    },

    setupModals() {
        const modal = Helpers.DOM.get('venue-modal');
        const closeBtn = document.querySelector('.modal-close');

        if (modal && closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        }
    },

    bindGlobalEvents() {
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange();
        });

        window.addEventListener('online', () => {
            Helpers.UI.showToast('Connection restored', CONSTANTS.TOAST_TYPES.SUCCESS);
            this.loadVenues();
        });

        window.addEventListener('offline', () => {
            Helpers.UI.showToast('No internet connection', CONSTANTS.TOAST_TYPES.WARNING);
        });

        const exploreBtn = Helpers.DOM.get('explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                Helpers.UI.scrollTo(document.querySelector('.search-section'), 80);
            });
        }

        console.log('🔗 Global events bound');
    },

    handleRouteChange() {
        const hash = window.location.hash.slice(1);

        if (hash.startsWith('venue=')) {
            const venueId = hash.split('=')[1];
            VenueCard.showVenueDetails(venueId);
        }
    },

    utils: {
        logAppInfo() {
            console.log('%c🏛️ Barcelona Local Platform', 'font-size: 20px; color: #667eea;');
            console.log('Version:', CONFIG.APP.VERSION);
            console.log('API URL:', CONFIG.API.BASE_URL);
            console.log('Environment:', CONFIG.API.BASE_URL.includes('localhost') ? 'Development' : 'Production');
            console.log('User authenticated:', Storage.Auth.isAuthenticated());
            console.log('Favorites count:', Storage.Favorites.getCount());
            console.log('Search history:', Storage.SearchHistory.getRecent().length, 'items');
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.utils.logAppInfo();
});

window.App = App;
