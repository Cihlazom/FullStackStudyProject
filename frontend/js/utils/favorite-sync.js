// Добавьте в frontend/js/utils/helpers.js или создайте новый файл
// Глобальная система синхронизации состояния избранного

const FavoriteSync = {
    // Инициализация системы синхронизации
    init() {
        // Создаем кастомные события для синхронизации
        this.setupEventListeners();
        console.log('🔄 Favorite sync system initialized');
    },

    // Настройка слушателей событий
    setupEventListeners() {
        // Слушаем изменения в localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === CONSTANTS.STORAGE_KEYS.FAVORITES) {
                this.onFavoritesChanged();
            }
        });

        // Создаем кастомное событие для внутренних изменений
        document.addEventListener('favoritesChanged', (e) => {
            this.syncAllFavoriteButtons(e.detail.venueId, e.detail.isFavorite);
        });
    },

    // Уведомляем о изменении избранного
    notifyFavoriteChanged(venueId, isFavorite) {
        const event = new CustomEvent('favoritesChanged', {
            detail: { venueId, isFavorite }
        });
        document.dispatchEvent(event);
    },

    // Синхронизируем все кнопки для venue
    syncAllFavoriteButtons(venueId, isFavorite) {
        // Обновляем обычные кнопки избранного
        const favoriteButtons = document.querySelectorAll(`[data-venue-id="${venueId}"]`);
        favoriteButtons.forEach(btn => {
            if (btn.classList.contains('favorite-btn') || btn.classList.contains('event-favorite-btn')) {
                if (window.VenueCard) {
                    VenueCard.updateFavoriteButton(btn, isFavorite);
                }
            }
        });

        // Обновляем модальные кнопки
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

    // Обработка изменений в localStorage (между вкладками)
    onFavoritesChanged() {
        if (window.VenueCard) {
            VenueCard.loadUserFavorites();
        }
        console.log('🔄 Favorites changed in localStorage, reloading');
    }
};

// Инициализируем при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    FavoriteSync.init();
});

// Делаем доступным глобально
window.FavoriteSync = FavoriteSync;
