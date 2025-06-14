const Storage = {
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    },

    // Set item in localStorage
    set(key, value) {
        if (!this.isAvailable()) {
            console.warn('localStorage is not available');
            return false;
        }

        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // Get item from localStorage
    get(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    // Remove item from localStorage
    remove(key) {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all items
    clear() {
        if (!this.isAvailable()) {
            return false;
        }

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    getAllKeys() {
        if (!this.isAvailable()) {
            return [];
        }

        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('Error getting localStorage keys:', error);
            return [];
        }
    },

    Auth: {
        setToken(token) {
            return Storage.set(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
        },

        getToken() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        },

        removeToken() {
            return Storage.remove(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        },

        isAuthenticated() {
            const token = this.getToken();
            return token !== null && token !== undefined;
        }
    },

    User: {
        setData(userData) {
            return Storage.set(CONSTANTS.STORAGE_KEYS.USER_DATA, userData);
        },

        getData() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.USER_DATA, {});
        },

        updateData(updates) {
            const currentData = this.getData();
            const updatedData = { ...currentData, ...updates };
            return Storage.set(CONSTANTS.STORAGE_KEYS.USER_DATA, updatedData);
        },

        removeData() {
            return Storage.remove(CONSTANTS.STORAGE_KEYS.USER_DATA);
        }
    },

    // TODO: удалить скорее всего надо
    Preferences: {
        set(preferences) {
            return Storage.set(CONSTANTS.STORAGE_KEYS.PREFERENCES, preferences);
        },

        get() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.PREFERENCES, {
                theme: 'light',
                language: 'en',
                notifications: true,
                location: true,
                defaultView: 'grid',
                maxDistance: 10, // km
                priceRange: 'moderate'
            });
        },

        update(updates) {
            const current = this.get();
            const updated = { ...current, ...updates };
            return Storage.set(CONSTANTS.STORAGE_KEYS.PREFERENCES, updated);
        },

        getValue(key, defaultValue = null) {
            const preferences = this.get();
            return preferences[key] !== undefined ? preferences[key] : defaultValue;
        },

        setValue(key, value) {
            const preferences = this.get();
            preferences[key] = value;
            return Storage.set(CONSTANTS.STORAGE_KEYS.PREFERENCES, preferences);
        }
    },

    SearchHistory: {
        add(searchQuery) {
            const history = this.get();
            const newEntry = {
                query: searchQuery,
                timestamp: new Date().toISOString(),
                id: Helpers.Utils.generateId()
            };

            const updatedHistory = [newEntry, ...history.filter(item =>
                item.query.toLowerCase() !== searchQuery.toLowerCase()
            )].slice(0, 50);

            return Storage.set(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
        },

        get() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, []);
        },

        clear() {
            return Storage.set(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, []);
        },

        remove(id) {
            const history = this.get();
            const filtered = history.filter(item => item.id !== id);
            return Storage.set(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, filtered);
        },

        getRecent() {
            return this.get().slice(0, 10);
        }
    },

    Favorites: {
        getUserFavoritesKey() {
            const userData = Storage.User.getData();
            if (userData && userData.email) {
                return `${CONSTANTS.STORAGE_KEYS.FAVORITES}_${userData.email}`;
            }
            return `${CONSTANTS.STORAGE_KEYS.FAVORITES}_guest`;
        },

        add(venueId, venueData = {}) {
            const key = this.getUserFavoritesKey();
            const favorites = Storage.get(key, []);
            const newFavorite = {
                venueId,
                ...venueData,
                dateAdded: new Date().toISOString()
            };

            if (!favorites.find(fav => fav.venueId === venueId)) {
                favorites.push(newFavorite);
                Storage.set(key, favorites);
                return true;
            }
            return false;
        },

        remove(venueId) {
            const key = this.getUserFavoritesKey();
            const favorites = Storage.get(key, []);
            const filtered = favorites.filter(fav => fav.venueId !== venueId);
            Storage.set(key, filtered);
            return true;
        },

        get() {
            const key = this.getUserFavoritesKey();
            return Storage.get(key, []);
        },

        isFavorite(venueId) {
            const favorites = this.get();
            return favorites.some(fav => fav.venueId === venueId);
        },

        getCount() {
            return this.get().length;
        },

        clear() {
            const key = this.getUserFavoritesKey();
            return Storage.set(key, []);
        },

        // НОВЫЙ: Очистить избранное гостя при входе пользователя
        // TODO: удалить скорее всего надо
        clearGuestFavorites() {
            const guestKey = `${CONSTANTS.STORAGE_KEYS.FAVORITES}_guest`;
            return Storage.remove(guestKey);
        },

        // НОВЫЙ: Перенести избранное гостя к пользователю при входе
        // TODO: удалить скорее всего надо
        migrateGuestFavorites() {
            const guestKey = `${CONSTANTS.STORAGE_KEYS.FAVORITES}_guest`;
            const guestFavorites = Storage.get(guestKey, []);

            if (guestFavorites.length > 0) {
                const userKey = this.getUserFavoritesKey();
                const userFavorites = Storage.get(userKey, []);

                // Объединяем избранное, избегая дубликатов
                const combined = [...userFavorites];
                guestFavorites.forEach(guestFav => {
                    if (!combined.find(userFav => userFav.venueId === guestFav.venueId)) {
                        combined.push(guestFav);
                    }
                });

                Storage.set(userKey, combined);
                Storage.remove(guestKey); // Удаляем гостевое избранное

                console.log(`📋 Migrated ${guestFavorites.length} guest favorites to user account`);
                return combined.length;
            }

            return 0;
        }
    },

    Session: {
        set(key, value) {
            if (typeof sessionStorage === 'undefined') return false;

            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to sessionStorage:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            if (typeof sessionStorage === 'undefined') return defaultValue;

            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from sessionStorage:', error);
                return defaultValue;
            }
        },

        remove(key) {
            if (typeof sessionStorage === 'undefined') return false;

            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from sessionStorage:', error);
                return false;
            }
        },

        clear() {
            if (typeof sessionStorage === 'undefined') return false;

            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing sessionStorage:', error);
                return false;
            }
        }
    },

    Cache: {
        set(key, data, expirationMinutes = 15) {
            const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
            const cacheData = {
                data,
                expiration: expirationTime
            };
            return Storage.set(`cache_${key}`, cacheData);
        },

        get(key) {
            const cacheData = Storage.get(`cache_${key}`);
            if (!cacheData) return null;

            if (new Date().getTime() > cacheData.expiration) {
                Storage.remove(`cache_${key}`);
                return null;
            }

            return cacheData.data;
        },

        remove(key) {
            return Storage.remove(`cache_${key}`);
        },

        clearAll() {
            const keys = Storage.getAllKeys();
            keys.forEach(key => {
                if (key.startsWith('cache_')) {
                    Storage.remove(key);
                }
            });
        }
    }
};

window.Storage = Storage;
