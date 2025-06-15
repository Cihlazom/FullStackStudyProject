const CONSTANTS = {
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    },

    STORAGE_KEYS: CONFIG.STORAGE,

    API_STATUS: {
        SUCCESS: 'success',
        ERROR: 'error',
        LOADING: 'loading'
    },

    TOAST_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    MODAL_TYPES: {
        VENUE_DETAILS: 'venue-details',
        AUTH: 'auth',
        PROFILE: 'profile',
        CONFIRM: 'confirm'
    },

    VIEW_TYPES: {
        GRID: 'grid',
        LIST: 'list',
        MAP: 'map'
    },

    FILTER_TYPES: {
        TYPE: 'type',
        DISTRICT: 'district',
        PRICE: 'price',
        RATING: 'rating',
        DISTANCE: 'distance'
    },

    SORT_OPTIONS: {
        RELEVANCE: 'relevance',
        RATING: 'rating',
        PRICE_LOW: 'price_low',
        PRICE_HIGH: 'price_high',
        DISTANCE: 'distance',
    },

    USER_ROLES: {
        STUDENT: 'student',
        EXPAT: 'expat',
    },

    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PASSWORD_MIN_LENGTH: 6,
        NAME_MIN_LENGTH: 2,
    },

    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: CONFIG.APP.PAGINATION.DEFAULT_LIMIT,
        MAX_LIMIT: CONFIG.APP.PAGINATION.MAX_LIMIT
    },

    RATING: {
        MIN: 1,
        MAX: 5,
        DEFAULT: 0
    },

    IMAGE: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        PLACEHOLDER: 'assets/images/placeholder.jpg'
    },

    // ms
    ANIMATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
    },

    BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
        XXL: 1536
    },

    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        UNAUTHORIZED: 'Please log in to continue.',
        FORBIDDEN: 'You don\'t have permission to perform this action.',
        NOT_FOUND: 'The requested resource was not found.',
        SERVER_ERROR: 'Server error. Please try again later.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        GENERIC_ERROR: 'Something went wrong. Please try again.'
    },

    SUCCESS_MESSAGES: {
        LOGIN: 'Welcome back!',
        REGISTER: 'Account created successfully!',
        LOGOUT: 'Logged out successfully!',
        PROFILE_UPDATED: 'Profile updated successfully!',
        FAVORITE_ADDED: 'Added to favorites!',
        FAVORITE_REMOVED: 'Removed from favorites!'
    }
};

window.CONSTANTS = CONSTANTS;
