// Search and Filters Component for Barcelona Local Platform
const SearchFilters = {
    // Initialize search component
    init() {
        this.render();
        this.bindEvents();

        console.log('🛤️ SearchFilters initialized');
    },

    // Render search form
    render() {
        const container = Helpers.DOM.get('search-container');
        if (!container) return;

        container.innerHTML = `
            <div class="search-form">
                <h2>What are you looking for?</h2>
                <form id="venue-search-form" class="search-form-container">
                    <div class="search-row">
                        <div class="form-group">
                            <label for="search-query" class="form-label">Search venues</label>
                            <input type="text" 
                                   id="search-query" 
                                   name="query" 
                                   class="form-input" 
                                   placeholder="Restaurant, bar, café..."
                                   autocomplete="off">
                        </div>
                        
                        <div class="form-group">
                            <label for="venue-type" class="form-label">Type</label>
                            <select id="venue-type" name="type" class="form-select">
                                <option value="">All types</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="bar">Bar</option>
                                <option value="cafe">Café</option>
                                <option value="club">Club</option>
                                <option value="coworking">Coworking</option>
                                <option value="cultural">Cultural</option>
                                <option value="outdoor">Outdoor</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="search-row">
                        <div class="form-group">
                            <label for="venue-district" class="form-label">District</label>
                            <select id="venue-district" name="district" class="form-select">
                                <option value="">All districts</option>
                                <option value="Ciutat Vella">Ciutat Vella</option>
                                <option value="Eixample">Eixample</option>
                                <option value="Sants-Montjuïc">Sants-Montjuïc</option>
                                <option value="Les Corts">Les Corts</option>
                                <option value="Sarrià-Sant Gervasi">Sarrià-Sant Gervasi</option>
                                <option value="Gràcia">Gràcia</option>
                                <option value="Horta-Guinardó">Horta-Guinardó</option>
                                <option value="Nou Barris">Nou Barris</option>
                                <option value="Sant Andreu">Sant Andreu</option>
                                <option value="Sant Martí">Sant Martí</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="price-range" class="form-label">Price Range</label>
                            <select id="price-range" name="priceRange" class="form-select">
                                <option value="">Any price</option>
                                <option value="budget">€ - Budget</option>
                                <option value="moderate">€€ - Moderate</option>
                                <option value="expensive">€€€ - Expensive</option>
                                <option value="luxury">€€€€ - Luxury</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="search-actions">
                        <button type="submit" class="btn btn-primary search-btn">
                            🔍 Search
                        </button>
                        <button type="button" class="btn btn-secondary clear-btn">
                            Clear Filters
                        </button>
                    </div>
                </form>
                
                <!-- Quick Filter Tags -->
                <div class="quick-filters">
                    <h3>Popular searches:</h3>
                    <div class="filter-tags">
                        <button class="filter-tag" data-type="bar">🍺 Bars</button>
                        <button class="filter-tag" data-type="restaurant">🍽️ Restaurants</button>
                        <button class="filter-tag" data-type="cafe">☕ Cafés</button>
                        <button class="filter-tag" data-district="Gràcia">📍 Gràcia</button>
                        <button class="filter-tag" data-district="Ciutat Vella">📍 Ciutat Vella</button>
                        <button class="filter-tag" data-price="budget">💰 Budget-friendly</button>
                    </div>
                </div>
            </div>
        `;
    },

    // Bind event listeners
    bindEvents() {
        const form = Helpers.DOM.get('venue-search-form');
        const clearBtn = document.querySelector('.clear-btn');
        const searchInput = Helpers.DOM.get('search-query');
        const filterTags = document.querySelectorAll('.filter-tag');

        // Search form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        // Clear filters
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Real-time search with debounce
        if (searchInput) {
            searchInput.addEventListener('input',
                Helpers.Utils.debounce(() => {
                    this.performSearch();
                }, CONFIG.APP.DEBOUNCE_DELAY)
            );
        }

        // Quick filter tags
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.applyQuickFilter(tag);
            });
        });

        // Filter change events
        const filterSelects = form?.querySelectorAll('select');
        filterSelects?.forEach(select => {
            select.addEventListener('change', () => {
                this.performSearch();
            });
        });
    },

    // Perform search with current filters
    async performSearch() {
        const form = Helpers.DOM.get('venue-search-form');
        if (!form) return;

        const formData = new FormData(form);
        const filters = {
            query: formData.get('query') || '',
            type: formData.get('type') || '',
            district: formData.get('district') || '',
            priceRange: formData.get('priceRange') || ''
        };

        // Show loading state
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.textContent = '🔍 Searching...';
            searchBtn.disabled = true;
        }

        try {
            // Apply filters through App
            if (window.App) {
                await App.applyFilters(filters);
            }

            // Update URL with search params
            this.updateURL(filters);

        } catch (error) {
            console.error('Search failed:', error);
            Helpers.UI.showToast('Search failed. Please try again.', CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            // Reset button state
            if (searchBtn) {
                searchBtn.textContent = '🔍 Search';
                searchBtn.disabled = false;
            }
        }
    },

    // Apply quick filter
    applyQuickFilter(tag) {
        const type = tag.dataset.type;
        const district = tag.dataset.district;
        const price = tag.dataset.price;

        // Update form fields
        if (type) {
            const typeSelect = Helpers.DOM.get('venue-type');
            if (typeSelect) typeSelect.value = type;
        }

        if (district) {
            const districtSelect = Helpers.DOM.get('venue-district');
            if (districtSelect) districtSelect.value = district;
        }

        if (price) {
            const priceSelect = Helpers.DOM.get('price-range');
            if (priceSelect) priceSelect.value = price;
        }

        // Perform search with new filters
        this.performSearch();

        // Visual feedback
        tag.classList.add('active');
        setTimeout(() => tag.classList.remove('active'), 2000);
    },

    // Clear all filters
    clearFilters() {
        const form = Helpers.DOM.get('venue-search-form');
        if (!form) return;

        // Reset form
        form.reset();

        // Clear search through App
        if (window.App) {
            App.clearFilters();
        }

        // Show success message
        Helpers.UI.showToast('Filters cleared', CONSTANTS.TOAST_TYPES.SUCCESS);
    },

    // Update URL with search parameters
    updateURL(filters) {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });

        const newURL = params.toString() ?
            `${window.location.pathname}?${params.toString()}` :
            window.location.pathname;

        window.history.replaceState({}, '', newURL);
    },

    // Load filters from URL
    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        const form = Helpers.DOM.get('venue-search-form');
        if (!form) return;

        // Set form values from URL params
        params.forEach((value, key) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });

        // Perform search if there are filters
        if (params.toString()) {
            this.performSearch();
        }
    },

    // Get current filters
    getCurrentFilters() {
        const form = Helpers.DOM.get('venue-search-form');
        if (!form) return {};

        const formData = new FormData(form);
        return {
            query: formData.get('query') || '',
            type: formData.get('type') || '',
            district: formData.get('district') || '',
            priceRange: formData.get('priceRange') || ''
        };
    }
};

// Make SearchFilters globally available
window.SearchFilters = SearchFilters;
