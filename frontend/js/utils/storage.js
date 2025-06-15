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

        removeData() {
            return Storage.remove(CONSTANTS.STORAGE_KEYS.USER_DATA);
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
    },
};

window.Storage = Storage;
