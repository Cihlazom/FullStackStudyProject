const FavoriteSync = {
    init() {
        this.setupEventListeners();
        console.log('🔄 Favorite sync system initialized');
    },

    setupEventListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === CONSTANTS.STORAGE_KEYS.FAVORITES) {
                this.onFavoritesChanged();
            }
        });

        document.addEventListener('favoritesChanged', (e) => {
            this.syncAllFavoriteButtons(e.detail.venueId, e.detail.isFavorite);
        });
    },

    notifyFavoriteChanged(venueId, isFavorite) {
        const event = new CustomEvent('favoritesChanged', {
            detail: { venueId, isFavorite }
        });
        document.dispatchEvent(event);
    },

    syncAllFavoriteButtons(venueId, isFavorite) {
        const favoriteButtons = document.querySelectorAll(`[data-venue-id="${venueId}"]`);
        favoriteButtons.forEach(btn => {
            if (btn.classList.contains('favorite-btn') || btn.classList.contains('event-favorite-btn')) {
                if (window.VenueCard) {
                    VenueCard.updateFavoriteButton(btn, isFavorite);
                }
            }
        });

        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        if (modalFavoriteBtn && modalFavoriteBtn.dataset.venueId === venueId) {
            modalFavoriteBtn.dataset.isFavorite = isFavorite.toString();

            if (isFavorite) {
                modalFavoriteBtn.classList.add('btn-error');
                modalFavoriteBtn.innerHTML = '❤️ Remove from Favorites';
            } else {
                modalFavoriteBtn.classList.remove('btn-error');
                modalFavoriteBtn.innerHTML = '🤍 Add to Favorites';
            }
        }

        console.log('🔄 Synced all favorite buttons for venue:', venueId, isFavorite);
    },

    onFavoritesChanged() {
        if (window.VenueCard) {
            VenueCard.loadUserFavorites();
        }
        console.log('🔄 Favorites changed in localStorage, reloading');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FavoriteSync.init();
});

window.FavoriteSync = FavoriteSync;
