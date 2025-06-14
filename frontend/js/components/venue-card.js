// Updated Venue Card Component for real API data
const VenueCard = {
    // Create a venue card HTML
    create(venue) {
        const isFavorite = this.isFavorite(venue.id);
        const priceSymbol = this.getPriceSymbol(venue.price_range || venue.priceRange);
        const distanceText = venue.distance ? Helpers.Utils.formatDistance(venue.distance) : '';

        return `
            <div class="venue-card" data-venue-id="${venue.id}">
                <div class="venue-image">
                    <img src="${venue.image || CONSTANTS.IMAGE.PLACEHOLDER}" 
                         alt="${venue.name}" 
                         onerror="this.src='${CONSTANTS.IMAGE.PLACEHOLDER}'">
                    <div class="venue-type-badge">${Helpers.String.capitalize(venue.type)}</div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                            data-venue-id="${venue.id}" 
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <span class="heart-icon">${isFavorite ? '❤️' : '🤍'}</span>
                    </button>
                </div>
                
                <div class="venue-content">
                    <div class="venue-header">
                        <h3 class="venue-name">${Helpers.String.escapeHtml(venue.name)}</h3>
                        <div class="venue-rating">
                            <span class="rating-stars">${this.createStars(venue.rating)}</span>
                            <span class="rating-number">${venue.rating}</span>
                        </div>
                    </div>
                    
                    <div class="venue-info">
                        <div class="venue-district">
                            <span class="icon">📍</span>
                            <span>${venue.district}</span>
                            ${distanceText ? `<span class="distance">(${distanceText})</span>` : ''}
                        </div>
                        
                        <div class="venue-price">
                            <span class="price-range">${priceSymbol}</span>
                            <span class="price-label">${Helpers.String.capitalize(venue.price_range || venue.priceRange || 'moderate')}</span>
                        </div>
                    </div>
                    
                    <p class="venue-description">${Helpers.String.truncate(venue.description || 'No description available', 80)}</p>
                    
                    <div class="venue-actions">
                        <button class="btn btn-primary btn-sm view-details-btn" data-venue-id="${venue.id}">
                            View Details
                        </button>
                        <button class="btn btn-secondary btn-sm share-btn" data-venue-id="${venue.id}">
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Create multiple venue cards
    createMultiple(venues) {
        return venues.map(venue => this.create(venue)).join('');
    },

    // Get price symbol based on price range
    getPriceSymbol(priceRange) {
        const priceMap = {
            'budget': '€',
            'moderate': '€€',
            'expensive': '€€€',
            'luxury': '€€€€'
        };
        return priceMap[priceRange] || '€';
    },

    // Create star rating HTML
    createStars(rating) {
        const numRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star full">★</span>';
        }

        // Half star
        if (hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star empty">☆</span>';
        }

        return starsHTML;
    },

    // Render venues in container
    render(venues, containerId) {
        const container = Helpers.DOM.get(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        if (!venues || venues.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No venues found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.createMultiple(venues);
        this.bindEvents(container);

        // Загружаем favorites пользователя после рендера
        this.loadUserFavorites();
    },

    // Append venues to existing container
    append(venues, containerId) {
        const container = Helpers.DOM.get(containerId);
        if (!container) return;

        const newCardsHTML = this.createMultiple(venues);
        container.insertAdjacentHTML('beforeend', newCardsHTML);
        this.bindEvents(container);
    },

    // Bind event listeners to venue cards
    bindEvents(container) {
        // View details buttons
        const detailButtons = container.querySelectorAll('.view-details-btn');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const venueId = btn.dataset.venueId;
                this.showVenueDetails(venueId);
            });
        });

        // Favorite buttons
        const favoriteButtons = container.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const venueId = btn.dataset.venueId;
                this.toggleFavorite(venueId, btn);
            });
        });

        // Share buttons
        const shareButtons = container.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const venueId = btn.dataset.venueId;
                this.shareVenue(venueId);
            });
        });

        // Card click (show details)
        const venueCards = container.querySelectorAll('.venue-card');
        venueCards.forEach(card => {
            card.addEventListener('click', () => {
                const venueId = card.dataset.venueId;
                this.showVenueDetails(venueId);
            });
        });
    },

    // Show venue details modal - NOW USING REAL API
    async showVenueDetails(venueId) {
        try {
            Helpers.UI.showLoading();

            // Fetch venue details from real API
            const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.VENUES.DETAILS(venueId)}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Venue not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch venue details');
            }

            // ДОБАВЛЕНО: Обновляем favorites перед рендером модала
            if (Storage.Auth.isAuthenticated()) {
                await this.loadUserFavorites();
            }

            this.renderVenueModal(data.data);

        } catch (error) {
            console.error('Error loading venue details:', error);
            Helpers.UI.showToast('Failed to load venue details', CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            Helpers.UI.hideLoading();
        }
    },

    // Render venue details in modal
    renderVenueModal(venue) {
        const modal = Helpers.DOM.get('venue-modal');
        const modalBody = Helpers.DOM.get('modal-body');

        if (!modal || !modalBody) return;

        // ПРАВИЛЬНАЯ проверка избранного
        const isFavorite = this.isFavorite(venue.id);
        console.log('🔍 Modal venue favorite status:', venue.id, isFavorite);

        const priceSymbol = this.getPriceSymbol(venue.price_range || venue.priceRange);

        // Parse features and hours from JSON if they're strings
        let features = venue.features;
        let hours = venue.hours;

        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
            } catch {
                features = [];
            }
        }

        if (typeof hours === 'string') {
            try {
                hours = JSON.parse(hours);
            } catch {
                hours = {};
            }
        }

        modalBody.innerHTML = `
        <div class="venue-details">
            <div class="venue-hero">
                <img src="${venue.image || CONSTANTS.IMAGE.PLACEHOLDER}" alt="${venue.name}" class="venue-hero-image">
                <div class="venue-hero-overlay">
                    <h1 class="venue-title">${venue.name}</h1>
                    <div class="venue-meta">
                        <span class="venue-type">${Helpers.String.capitalize(venue.type)}</span>
                        <span class="venue-rating">
                            ${this.createStars(venue.rating)} ${venue.rating}
                        </span>
                        <span class="venue-price">${priceSymbol}</span>
                    </div>
                </div>
            </div>
            
            <div class="venue-info-grid">
                <div class="venue-main-info">
                    <h3>About</h3>
                    <p>${venue.description || 'No description available.'}</p>
                    
                    ${features && features.length > 0 ? `
                    <h3>Features</h3>
                    <div class="features-list">
                        ${features.map(feature =>
            `<span class="feature-tag">${feature}</span>`
        ).join('')}
                    </div>
                    ` : ''}
                    
                    ${hours && Object.keys(hours).length > 0 ? `
                    <h3>Opening Hours</h3>
                    <div class="hours-list">
                        ${Object.entries(hours).map(([day, time]) =>
            `<div class="hours-item">
                                <span class="day">${Helpers.String.capitalize(day)}</span>
                                <span class="hours">${time}</span>
                            </div>`
        ).join('')}
                    </div>
                    ` : ''}
                    
                    ${venue.reviews && venue.reviews.length > 0 ? `
                    <h3>Recent Reviews</h3>
                    <div class="reviews-list">
                        ${venue.reviews.slice(0, 3).map(review => `
                            <div class="review-item">
                                <div class="review-header">
                                    <span class="reviewer-name">${review.user_name || 'Anonymous'}</span>
                                    <span class="review-rating">${this.createStars(review.rating)}</span>
                                </div>
                                <p class="review-text">${review.comment || review.review}</p>
                                <span class="review-date">${Helpers.Date.format(review.created_at || review.date)}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                
                <div class="venue-contact-info">
                    <h3>Contact & Location</h3>
                    <div class="contact-item">
                        <span class="icon">📍</span>
                        <span>${venue.address || venue.district + ', Barcelona'}</span>
                    </div>
                    
                    ${venue.phone ? `
                        <div class="contact-item">
                            <span class="icon">📞</span>
                            <a href="tel:${venue.phone}">${venue.phone}</a>
                        </div>
                    ` : ''}
                    
                    ${venue.website ? `
                        <div class="contact-item">
                            <span class="icon">🌐</span>
                            <a href="${venue.website}" target="_blank">Visit Website</a>
                        </div>
                    ` : ''}
                    
                    <div class="venue-actions-modal">
                        <button class="btn btn-primary ${isFavorite ? 'btn-error' : ''}" 
                                id="modal-favorite-btn" 
                                data-venue-id="${venue.id}"
                                data-is-favorite="${isFavorite}">
                            ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                        </button>
                        <button class="btn btn-secondary" id="modal-share-btn" data-venue-id="${venue.id}">
                            Share Venue
                        </button>
                        ${venue.website ? `
                            <button class="btn btn-secondary" onclick="window.open('${venue.website}', '_blank')">
                                Visit Website
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

        // Show modal
        modal.style.display = 'flex';

        // Bind modal events
        const modalFavoriteBtn = Helpers.DOM.get('modal-favorite-btn');
        const modalShareBtn = Helpers.DOM.get('modal-share-btn');

        if (modalFavoriteBtn) {
            // ИСПРАВЛЕННЫЙ обработчик - учитываем текущее состояние
            modalFavoriteBtn.addEventListener('click', () => {
                // Создаем временную кнопку для совместимости с toggleFavorite
                const tempButton = {
                    classList: {
                        contains: (className) => className === 'active' ? isFavorite : false,
                        add: (className) => {
                            if (className === 'active') {
                                modalFavoriteBtn.dataset.isFavorite = 'true';
                                modalFavoriteBtn.classList.add('btn-error');
                                modalFavoriteBtn.innerHTML = '❤️ Remove from Favorites';
                            }
                        },
                        remove: (className) => {
                            if (className === 'active') {
                                modalFavoriteBtn.dataset.isFavorite = 'false';
                                modalFavoriteBtn.classList.remove('btn-error');
                                modalFavoriteBtn.innerHTML = '🤍 Add to Favorites';
                            }
                        }
                    },
                    innerHTML: modalFavoriteBtn.innerHTML,
                    disabled: false,
                    title: modalFavoriteBtn.title
                };

                // Передаем в toggleFavorite с правильным состоянием
                this.toggleFavoriteModal(venue.id, modalFavoriteBtn);
            });
        }

        if (modalShareBtn) {
            modalShareBtn.addEventListener('click', () => {
                this.shareVenue(venue.id);
            });
        }
    },

    async toggleFavoriteModal(venueId, button) {
        // Проверяем авторизацию
        if (!Storage.Auth.isAuthenticated()) {
            Helpers.UI.showToast('Please log in to add favorites', CONSTANTS.TOAST_TYPES.WARNING);
            if (window.Navbar) {
                Navbar.showAuthModal('login');
            }
            return;
        }

        // Получаем текущее состояние из data-attribute
        const isFavorite = button.dataset.isFavorite === 'true';
        const token = Storage.Auth.getToken();

        console.log('🔄 Toggling favorite in modal:', venueId, 'Current state:', isFavorite);

        // Показываем loading состояние
        const originalContent = button.innerHTML;
        button.innerHTML = isFavorite ? '⏳ Removing...' : '⏳ Adding...';
        button.disabled = true;

        try {
            let response;

            if (isFavorite) {
                // Удаляем из избранного
                response = await fetch(`${CONFIG.API.BASE_URL}/favorites/${venueId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Добавляем в избранное
                response = await fetch(`${CONFIG.API.BASE_URL}/favorites`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ venue_id: venueId })
                });
            }

            const result = await response.json();

            if (result.success) {
                // Обновляем состояние кнопки
                const newIsFavorite = !isFavorite;
                button.dataset.isFavorite = newIsFavorite.toString();

                if (newIsFavorite) {
                    button.classList.add('btn-error');
                    button.innerHTML = '❤️ Remove from Favorites';
                } else {
                    button.classList.remove('btn-error');
                    button.innerHTML = '🤍 Add to Favorites';
                }

                // Обновляем все остальные кнопки для этого venue
                const allFavoriteButtons = document.querySelectorAll(`[data-venue-id="${venueId}"]`);
                allFavoriteButtons.forEach(btn => {
                    if (btn !== button && (btn.classList.contains('favorite-btn') || btn.classList.contains('event-favorite-btn'))) {
                        this.updateFavoriteButton(btn, newIsFavorite);
                    }
                });

                // Обновляем local storage
                if (newIsFavorite) {
                    Storage.Favorites.add(venueId, { name: 'Venue' });
                } else {
                    Storage.Favorites.remove(venueId);
                }

                if (window.FavoriteSync) {
                    FavoriteSync.notifyFavoriteChanged(venueId, newIsFavorite);
                }

                // Показываем уведомление
                const message = newIsFavorite ?
                    CONSTANTS.SUCCESS_MESSAGES.FAVORITE_ADDED :
                    CONSTANTS.SUCCESS_MESSAGES.FAVORITE_REMOVED;
                Helpers.UI.showToast(message, CONSTANTS.TOAST_TYPES.SUCCESS);

                console.log('✅ Modal favorite status updated:', result);

            } else {
                throw new Error(result.message || 'Failed to update favorite status');
            }

        } catch (error) {
            console.error('❌ Modal favorite toggle failed:', error);

            // Восстанавливаем оригинальное состояние
            button.innerHTML = originalContent;

            // Показываем ошибку
            let errorMessage = 'Failed to update favorites';
            if (error.message.includes('Authentication required')) {
                errorMessage = 'Please log in to manage favorites';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Helpers.UI.showToast(errorMessage, CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            button.disabled = false;
        }
    },

    // Toggle favorite status
    async toggleFavorite(venueId, button) {
        // Проверяем авторизацию
        if (!Storage.Auth.isAuthenticated()) {
            Helpers.UI.showToast('Please log in to add favorites', CONSTANTS.TOAST_TYPES.WARNING);
            if (window.Navbar) {
                Navbar.showAuthModal('login');
            }
            return;
        }

        const isFavorite = button.classList.contains('active');
        const token = Storage.Auth.getToken();

        // Показываем loading состояние
        const originalContent = button.innerHTML;
        button.innerHTML = '<span class="heart-icon">⏳</span>';
        button.disabled = true;

        try {
            let response;

            if (isFavorite) {
                // Удаляем из избранного
                response = await fetch(`${CONFIG.API.BASE_URL}/favorites/${venueId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Добавляем в избранное
                response = await fetch(`${CONFIG.API.BASE_URL}/favorites`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ venue_id: venueId })
                });
            }

            const result = await response.json();

            if (result.success) {
                const newIsFavorite = !isFavorite;

                // Обновляем local storage
                if (newIsFavorite) {
                    Storage.Favorites.add(venueId, { name: 'Venue' });
                } else {
                    Storage.Favorites.remove(venueId);
                }

                // НОВОЕ: Уведомляем систему синхронизации
                if (window.FavoriteSync) {
                    FavoriteSync.notifyFavoriteChanged(venueId, newIsFavorite);
                } else {
                    // Fallback: обновляем все кнопки вручную
                    const allFavoriteButtons = document.querySelectorAll(`[data-venue-id="${venueId}"]`);
                    allFavoriteButtons.forEach(btn => {
                        if (btn.classList.contains('favorite-btn') || btn.classList.contains('event-favorite-btn')) {
                            this.updateFavoriteButton(btn, newIsFavorite);
                        }
                    });
                }

                // Показываем уведомление
                const message = newIsFavorite ?
                    CONSTANTS.SUCCESS_MESSAGES.FAVORITE_ADDED :
                    CONSTANTS.SUCCESS_MESSAGES.FAVORITE_REMOVED;
                Helpers.UI.showToast(message, CONSTANTS.TOAST_TYPES.SUCCESS);

                console.log('✅ Favorite status updated:', result);

            } else {
                throw new Error(result.message || 'Failed to update favorite status');
            }

        } catch (error) {
            console.error('❌ Favorite toggle failed:', error);

            button.innerHTML = originalContent;

            let errorMessage = 'Failed to update favorites';
            if (error.message.includes('Authentication required')) {
                errorMessage = 'Please log in to manage favorites';
                if (window.Navbar) {
                    Navbar.showAuthModal('login');
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Helpers.UI.showToast(errorMessage, CONSTANTS.TOAST_TYPES.ERROR);
        } finally {
            button.disabled = false;
        }
    },

    updateOpenModalFavoriteState(venueId) {
        const modal = Helpers.DOM.get('venue-modal');
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');

        // Проверяем, открыт ли модал для этого venue
        if (modal && modal.style.display === 'flex' &&
            modalFavoriteBtn && modalFavoriteBtn.dataset.venueId === venueId) {

            const isFavorite = this.isFavorite(venueId);
            modalFavoriteBtn.dataset.isFavorite = isFavorite.toString();

            if (isFavorite) {
                modalFavoriteBtn.classList.add('btn-error');
                modalFavoriteBtn.innerHTML = '❤️ Remove from Favorites';
            } else {
                modalFavoriteBtn.classList.remove('btn-error');
                modalFavoriteBtn.innerHTML = '🤍 Add to Favorites';
            }

            console.log('🔄 Updated modal favorite state for venue:', venueId, isFavorite);
        }
    },

    // Update favorite button appearance
    updateFavoriteButton(button, isFavorite) {
        const heartIcon = button.querySelector('.heart-icon');

        if (isFavorite) {
            button.classList.add('active');
            if (heartIcon) heartIcon.textContent = '❤️';
            button.title = 'Remove from favorites';
            if (button.id === 'modal-favorite-btn') {
                button.innerHTML = '❤️ Remove from Favorites';
            }
        } else {
            button.classList.remove('active');
            if (heartIcon) heartIcon.textContent = '🤍';
            button.title = 'Add to favorites';
            if (button.id === 'modal-favorite-btn') {
                button.innerHTML = '🤍 Add to Favorites';
            }
        }
    },

    async loadUserFavorites() {
        if (!Storage.Auth.isAuthenticated()) {
            console.log('📋 User not authenticated, favorites will be stored locally');
            return;
        }

        const token = Storage.Auth.getToken();

        try {
            const response = await fetch(`${CONFIG.API.BASE_URL}/favorites`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();

                if (result.success && result.data) {
                    // ИЗМЕНЕНО: Очищаем текущее избранное пользователя перед загрузкой с сервера
                    Storage.Favorites.clear();

                    // Загружаем избранное с сервера
                    result.data.forEach(favorite => {
                        Storage.Favorites.add(favorite.venue_id, {
                            name: favorite.name,
                            type: favorite.type,
                            district: favorite.district
                        });
                    });

                    // Обновляем UI для всех карточек
                    result.data.forEach(favorite => {
                        const buttons = document.querySelectorAll(`[data-venue-id="${favorite.venue_id}"]`);
                        buttons.forEach(btn => {
                            if (btn.classList.contains('favorite-btn') || btn.classList.contains('event-favorite-btn')) {
                                this.updateFavoriteButton(btn, true);
                            }
                        });
                    });

                    console.log('✅ User favorites loaded from server:', result.data.length, 'items');
                }
            }
        } catch (error) {
            console.error('❌ Failed to load user favorites from server:', error);
            console.log('📋 Will use local favorites instead');
        }
    },

    refreshFavoritesUI() {
        // Получаем текущее избранное пользователя
        const currentFavorites = Storage.Favorites.get();
        const favoriteIds = currentFavorites.map(fav => fav.venueId);

        // Обновляем все кнопки избранного на странице
        const allFavoriteButtons = document.querySelectorAll('.favorite-btn, .event-favorite-btn');
        allFavoriteButtons.forEach(btn => {
            const venueId = btn.dataset.venueId;
            if (venueId) {
                const isFavorite = favoriteIds.includes(venueId);
                this.updateFavoriteButton(btn, isFavorite);
            }
        });

        // Обновляем модальные окна, если открыты
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        if (modalFavoriteBtn) {
            const venueId = modalFavoriteBtn.dataset.venueId;
            if (venueId) {
                const isFavorite = favoriteIds.includes(venueId);
                modalFavoriteBtn.dataset.isFavorite = isFavorite.toString();

                if (isFavorite) {
                    modalFavoriteBtn.classList.add('btn-error');
                    modalFavoriteBtn.innerHTML = '❤️ Remove from Favorites';
                } else {
                    modalFavoriteBtn.classList.remove('btn-error');
                    modalFavoriteBtn.innerHTML = '🤍 Add to Favorites';
                }
            }
        }

        console.log('🔄 Favorites UI refreshed for current user');
    },

    isFavorite(venueId) {
        // Проверяем в local storage (синхронизируется с сервером)
        return Storage.Favorites.isFavorite(venueId);
    },

    // Share venue
    shareVenue(venueId) {
        if (navigator.share) {
            navigator.share({
                title: 'Check out this venue!',
                text: 'Found this amazing place on BarcelonaLocal',
                url: `${window.location.origin}#venue=${venueId}`
            });
        } else {
            // Fallback: copy to clipboard
            const url = `${window.location.origin}#venue=${venueId}`;
            navigator.clipboard.writeText(url).then(() => {
                Helpers.UI.showToast('Link copied to clipboard!', CONSTANTS.TOAST_TYPES.SUCCESS);
            });
        }
    }
};

// Make VenueCard globally available
window.VenueCard = VenueCard;
