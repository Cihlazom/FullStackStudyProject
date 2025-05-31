// Local Storage management for Barcelona Local Platform
const Storage = {
    // Check if localStorage is available
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

    // Get all keys
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

    // App-specific methods using CONFIG keys
    Auth: {
        // Save auth token
        setToken(token) {
            return Storage.set(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
        },

        // Get auth token
        getToken() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        },

        // Remove auth token
        removeToken() {
            return Storage.remove(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        },

        // Check if user is authenticated
        isAuthenticated() {
            const token = this.getToken();
            return token !== null && token !== undefined;
        }
    },

    User: {
        // Save user data
        setData(userData) {
            return Storage.set(CONSTANTS.STORAGE_KEYS.USER_DATA, userData);
        },

        // Get user data
        getData() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.USER_DATA, {});
        },

        // Update user data (merge with existing)
        updateData(updates) {
            const currentData = this.getData();
            const updatedData = { ...currentData, ...updates };
            return Storage.set(CONSTANTS.STORAGE_KEYS.USER_DATA, updatedData);
        },

        // Remove user data
        removeData() {
            return Storage.remove(CONSTANTS.STORAGE_KEYS.USER_DATA);
        }
    },

    Preferences: {
        // Save user preferences
        set(preferences) {
            return Storage.set(CONSTANTS.STORAGE_KEYS.PREFERENCES, preferences);
        },

        // Get user preferences
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

        // Update preferences
        update(updates) {
            const current = this.get();
            const updated = { ...current, ...updates };
            return Storage.set(CONSTANTS.STORAGE_KEYS.PREFERENCES, updated);
        },

        // Get specific preference
        getValue(key, defaultValue = null) {
            const preferences = this.get();
            return preferences[key] !== undefined ? preferences[key] : defaultValue;
        },

        // Set specific preference
        setValue(key, value) {
            const preferences = this.get();
            preferences[key] = value;
            return Storage.set(CONSTANTS.STORAGE_KEYS.PREFERENCES, preferences);
        }
    },

    SearchHistory: {
        // Add search to history
        add(searchQuery) {
            const history = this.get();
            const newEntry = {
                query: searchQuery,
                timestamp: new Date().toISOString(),
                id: Helpers.Utils.generateId()
            };

            // Add to beginning and limit to 50 entries
            const updatedHistory = [newEntry, ...history.filter(item =>
                item.query.toLowerCase() !== searchQuery.toLowerCase()
            )].slice(0, 50);

            return Storage.set(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, updatedHistory);
        },

        // Get search history
        get() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, []);
        },

        // Clear search history
        clear() {
            return Storage.set(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, []);
        },

        // Remove specific search
        remove(id) {
            const history = this.get();
            const filtered = history.filter(item => item.id !== id);
            return Storage.set(CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY, filtered);
        },

        // Get recent searches (last 10)
        getRecent() {
            return this.get().slice(0, 10);
        }
    },

    Favorites: {
        // Add to favorites
        add(venueId, venueData = {}) {
            const favorites = this.get();
            const newFavorite = {
                venueId,
                ...venueData,
                dateAdded: new Date().toISOString()
            };

            if (!favorites.find(fav => fav.venueId === venueId)) {
                favorites.push(newFavorite);
                Storage.set(CONSTANTS.STORAGE_KEYS.FAVORITES, favorites);
                return true;
            }
            return false;
        },

        // Remove from favorites
        remove(venueId) {
            const favorites = this.get();
            const filtered = favorites.filter(fav => fav.venueId !== venueId);
            Storage.set(CONSTANTS.STORAGE_KEYS.FAVORITES, filtered);
            return true;
        },

        // Get all favorites
        get() {
            return Storage.get(CONSTANTS.STORAGE_KEYS.FAVORITES, []);
        },

        // Check if venue is favorite
        isFavorite(venueId) {
            const favorites = this.get();
            return favorites.some(fav => fav.venueId === venueId);
        },

        // Get favorites count
        getCount() {
            return this.get().length;
        },

        // Clear all favorites
        clear() {
            return Storage.set(CONSTANTS.STORAGE_KEYS.FAVORITES, []);
        }
    },

    // Session storage for temporary data
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

    // Cache management for API responses
    Cache: {
        // Cache with expiration
        set(key, data, expirationMinutes = 15) {
            const expirationTime = new Date().getTime() + (expirationMinutes * 60 * 1000);
            const cacheData = {
                data,
                expiration: expirationTime
            };
            return Storage.set(`cache_${key}`, cacheData);
        },

        // Get from cache if not expired
        get(key) {
            const cacheData = Storage.get(`cache_${key}`);
            if (!cacheData) return null;

            if (new Date().getTime() > cacheData.expiration) {
                Storage.remove(`cache_${key}`);
                return null;
            }

            return cacheData.data;
        },

        // Remove from cache
        remove(key) {
            return Storage.remove(`cache_${key}`);
        },

        // Clear all cache
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

// Make Storage globally available
window.Storage = Storage;
