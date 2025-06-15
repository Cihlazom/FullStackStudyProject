const SearchFilters = {
    state: {
        isExpanded: false,
        hasActiveFilters: false
    },

    init() {
        this.render();
        this.bindEvents();
        this.updateFilterIndicator();

        console.log('🛤️ SearchFilters initialized');
    },

    render() {
        const container = Helpers.DOM.get('search-container');
        if (!container) return;

        container.innerHTML = `
            <div class="search-form">
                <h2>What are you looking for?</h2>
                
                <div class="main-search-container">
                    <div class="search-input-group">
                        <input type="text" 
                               id="search-query" 
                               name="query" 
                               class="form-input search-main-input" 
                               placeholder="Search restaurants, bars, cafés..."
                               autocomplete="off">
                        <button type="button" class="search-btn-main btn btn-primary">
                            🔍 Search
                        </button>
                    </div>
                    
                    <button type="button" class="filters-toggle-btn" id="filters-toggle">
                        <span class="toggle-icon">⚙️</span>
                        <span class="toggle-text">Filters</span>
                        <span class="active-filters-count" id="active-filters-count" style="display: none;">0</span>
                        <span class="expand-arrow" id="expand-arrow">▼</span>
                    </button>
                </div>

                <div class="filters-panel" id="filters-panel">
                    <form id="venue-search-form" class="filters-form-container">
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label for="venue-type" class="filter-label">Type</label>
                                <select id="venue-type" name="type" class="form-select filter-select">
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
                            
                            <div class="filter-group">
                                <label for="venue-district" class="filter-label">District</label>
                                <select id="venue-district" name="district" class="form-select filter-select">
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
                            
                            <div class="filter-group">
                                <label for="price-range" class="filter-label">Price Range</label>
                                <select id="price-range" name="priceRange" class="form-select filter-select">
                                    <option value="">Any price</option>
                                    <option value="budget">€ - Budget</option>
                                    <option value="moderate">€€ - Moderate</option>
                                    <option value="expensive">€€€ - Expensive</option>
                                    <option value="luxury">€€€€ - Luxury</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filters-actions">
                            <button type="button" class="btn btn-secondary clear-filters-btn">
                                Clear All
                            </button>
                            <button type="submit" class="btn btn-primary apply-filters-btn">
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="quick-filters">
                    <div class="filter-tags">
                        <button class="filter-tag" data-type="bar">🍺 Bars</button>
                        <button class="filter-tag" data-type="restaurant">🍽️ Restaurants</button>
                        <button class="filter-tag" data-type="cafe">☕ Cafés</button>
                        <button class="filter-tag" data-district="Gràcia">📍 Gràcia</button>
                        <button class="filter-tag" data-district="Ciutat Vella">📍 Ciutat Vella</button>
                        <button class="filter-tag" data-price="budget">💰 Budget</button>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const form = Helpers.DOM.get('venue-search-form');
        const searchInput = Helpers.DOM.get('search-query');
        const mainSearchBtn = document.querySelector('.search-btn-main');
        const clearBtn = document.querySelector('.clear-filters-btn');
        const applyBtn = document.querySelector('.apply-filters-btn');
        const filtersToggle = Helpers.DOM.get('filters-toggle');
        const filterTags = document.querySelectorAll('.filter-tag');

        if (filtersToggle) {
            filtersToggle.addEventListener('click', () => {
                this.toggleFiltersPanel();
            });
        }

        if (mainSearchBtn) {
            mainSearchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch();
                this.toggleFiltersPanel(); // Close panel after applying
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input',
                Helpers.Utils.debounce(() => {
                    this.performSearch();
                }, CONFIG.APP.DEBOUNCE_DELAY)
            );

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        }

        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.applyQuickFilter(tag);
            });
        });

        const filterSelects = form?.querySelectorAll('select');
        filterSelects?.forEach(select => {
            select.addEventListener('change', () => {
                this.updateFilterIndicator();
                this.performSearch();
            });
        });

        document.addEventListener('click', (e) => {
            const filtersPanel = Helpers.DOM.get('filters-panel');
            const filtersToggle = Helpers.DOM.get('filters-toggle');

            if (this.state.isExpanded &&
                filtersPanel &&
                !filtersPanel.contains(e.target) &&
                !filtersToggle.contains(e.target)) {
                this.toggleFiltersPanel();
            }
        });
    },

    toggleFiltersPanel() {
        const panel = Helpers.DOM.get('filters-panel');
        const arrow = Helpers.DOM.get('expand-arrow');
        const toggleBtn = Helpers.DOM.get('filters-toggle');

        if (!panel || !arrow || !toggleBtn) return;

        this.state.isExpanded = !this.state.isExpanded;

        if (this.state.isExpanded) {
            panel.classList.add('expanded');
            arrow.textContent = '▲';
            toggleBtn.classList.add('active');
        } else {
            panel.classList.remove('expanded');
            arrow.textContent = '▼';
            toggleBtn.classList.remove('active');
        }
    },

    updateFilterIndicator() {
        const filters = this.getCurrentFilters();
        const activeCount = Object.values(filters).filter(value => value && value !== filters.query).length;
        const countElement = Helpers.DOM.get('active-filters-count');
        const toggleBtn = Helpers.DOM.get('filters-toggle');

        if (countElement && toggleBtn) {
            if (activeCount > 0) {
                countElement.style.display = 'inline-block';
                countElement.textContent = activeCount;
                toggleBtn.classList.add('has-filters');
                this.state.hasActiveFilters = true;
            } else {
                countElement.style.display = 'none';
                toggleBtn.classList.remove('has-filters');
                this.state.hasActiveFilters = false;
            }
        }
    },

    async performSearch() {
        const searchQuery = Helpers.DOM.get('search-query').value || '';
        const form = Helpers.DOM.get('venue-search-form');
        if (!form) return;

        const formData = new FormData(form);

        const filters = {
            query: searchQuery,
            type: formData.get('type') || '',
            district: formData.get('district') || '',
            priceRange: formData.get('priceRange') || ''
        };

        const searchBtn = document.querySelector('.search-btn-main');
        const applyBtn = document.querySelector('.apply-filters-btn');

        if (searchBtn) {
            searchBtn.textContent = '🔍 Searching...';
            searchBtn.disabled = true;
        }

        if (applyBtn) {
            applyBtn.textContent = 'Applying...';
            applyBtn.disabled = true;
        }

        try {
            if (window.App) {
                await App.applyFilters(filters);
            }

            this.updateURL(filters);

            this.updateFilterIndicator();

        } catch (error) {
            console.error('Search failed:', error);
            Helpers.UI.showToast('Search failed. Please try again.', CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            if (searchBtn) {
                searchBtn.textContent = '🔍 Search';
                searchBtn.disabled = false;
            }

            if (applyBtn) {
                applyBtn.textContent = 'Apply Filters';
                applyBtn.disabled = false;
            }
        }
    },

    clearFilters() {
        const form = Helpers.DOM.get('venue-search-form');
        const searchInput = Helpers.DOM.get('search-query');

        if (form) form.reset();
        if (searchInput) searchInput.value = '';

        if (window.App) {
            App.clearFilters();
        }

        this.updateFilterIndicator();

        if (this.state.isExpanded) {
            this.toggleFiltersPanel();
        }

        Helpers.UI.showToast('Filters cleared', CONSTANTS.TOAST_TYPES.SUCCESS);
    },

    applyQuickFilter(tag) {
        const type = tag.dataset.type;
        const district = tag.dataset.district;
        const price = tag.dataset.price;

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

        this.performSearch();

        tag.classList.add('active');
        setTimeout(() => tag.classList.remove('active'), 2000);
    },

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

    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        const form = Helpers.DOM.get('venue-search-form');
        const searchInput = Helpers.DOM.get('search-query');

        if (!form) return;

        params.forEach((value, key) => {
            if (key === 'query') {
                if (searchInput) searchInput.value = value;
            } else {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = value;
            }
        });

        this.updateFilterIndicator();

        if (params.toString()) {
            this.performSearch();
        }
    },

    getCurrentFilters() {
        const searchInput = Helpers.DOM.get('search-query');
        const form = Helpers.DOM.get('venue-search-form');

        if (!form) return {};

        const formData = new FormData(form);
        return {
            query: searchInput ? searchInput.value : '',
            type: formData.get('type') || '',
            district: formData.get('district') || '',
            priceRange: formData.get('priceRange') || ''
        };
    }
};

window.SearchFilters = SearchFilters;
