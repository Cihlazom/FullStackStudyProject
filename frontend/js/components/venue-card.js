// Venue Card Component for Barcelona Local Platform
const VenueCard = {
    // Create a venue card HTML
    create(venue) {
        const isFavorite = Storage.Favorites.isFavorite(venue.id);
        const priceSymbol = this.getPriceSymbol(venue.priceRange);
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
              <span class="price-label">${Helpers.String.capitalize(venue.priceRange)}</span>
            </div>
          </div>
          
          <p class="venue-description">${Helpers.String.truncate(venue.description, 80)}</p>
          
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
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
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

    // Show venue details modal
    async showVenueDetails(venueId) {
        try {
            // Mock venue details for now
            const venue = {
                id: venueId,
                name: 'Sample Venue',
                type: 'bar',
                district: 'Eixample',
                rating: 4.5,
                priceRange: 'moderate',
                image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600',
                description: 'Amazing venue with great atmosphere and excellent service. Perfect for students and young professionals.',
                address: 'Carrer de la Diputació, 123, Barcelona',
                phone: '+34 93 123 4567',
                website: 'https://example.com',
                hours: {
                    monday: '18:00-02:00',
                    tuesday: '18:00-02:00',
                    wednesday: '18:00-02:00',
                    thursday: '18:00-03:00',
                    friday: '18:00-03:00',
                    saturday: '18:00-03:00',
                    sunday: 'Closed'
                },
                features: ['WiFi', 'Outdoor seating', 'Live music', 'Happy hour']
            };

            this.renderVenueModal(venue);
        } catch (error) {
            console.error('Error loading venue details:', error);
            Helpers.UI.showToast('Failed to load venue details', CONSTANTS.TOAST_TYPES.ERROR);
        }
    },

    // Render venue details in modal
    renderVenueModal(venue) {
        const modal = Helpers.DOM.get('venue-modal');
        const modalBody = Helpers.DOM.get('modal-body');

        if (!modal || !modalBody) return;

        const isFavorite = Storage.Favorites.isFavorite(venue.id);
        const priceSymbol = this.getPriceSymbol(venue.priceRange);

        modalBody.innerHTML = `
      <div class="venue-details">
        <div class="venue-hero">
          <img src="${venue.image}" alt="${venue.name}" class="venue-hero-image">
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
            <p>${venue.description}</p>
            
            <h3>Features</h3>
            <div class="features-list">
              ${venue.features.map(feature =>
            `<span class="feature-tag">${feature}</span>`
        ).join('')}
            </div>
            
            <h3>Opening Hours</h3>
            <div class="hours-list">
              ${Object.entries(venue.hours).map(([day, hours]) =>
            `<div class="hours-item">
                  <span class="day">${Helpers.String.capitalize(day)}</span>
                  <span class="hours">${hours}</span>
                </div>`
        ).join('')}
            </div>
          </div>
          
          <div class="venue-contact-info">
            <h3>Contact & Location</h3>
            <div class="contact-item">
              <span class="icon">📍</span>
              <span>${venue.address}</span>
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
              <button class="btn btn-primary" id="modal-favorite-btn" data-venue-id="${venue.id}">
                ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
              </button>
              <button class="btn btn-secondary" id="modal-share-btn" data-venue-id="${venue.id}">
                Share Venue
              </button>
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
            modalFavoriteBtn.addEventListener('click', () => {
                this.toggleFavorite(venue.id, modalFavoriteBtn);
            });
        }

        if (modalShareBtn) {
            modalShareBtn.addEventListener('click', () => {
                this.shareVenue(venue.id);
            });
        }
    },

    // Toggle favorite status
    toggleFavorite(venueId, button) {
        const isFavorite = Storage.Favorites.isFavorite(venueId);

        if (isFavorite) {
            Storage.Favorites.remove(venueId);
            Helpers.UI.showToast(CONSTANTS.SUCCESS_MESSAGES.FAVORITE_REMOVED, CONSTANTS.TOAST_TYPES.SUCCESS);
        } else {
            Storage.Favorites.add(venueId, { name: 'Venue Name' }); // Add basic venue data
            Helpers.UI.showToast(CONSTANTS.SUCCESS_MESSAGES.FAVORITE_ADDED, CONSTANTS.TOAST_TYPES.SUCCESS);
        }

        // Update button appearance
        this.updateFavoriteButton(button, !isFavorite);

        // Update all favorite buttons for this venue
        const allFavoriteButtons = document.querySelectorAll(`[data-venue-id="${venueId}"]`);
        allFavoriteButtons.forEach(btn => {
            if (btn.classList.contains('favorite-btn')) {
                this.updateFavoriteButton(btn, !isFavorite);
            }
        });
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
