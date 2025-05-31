// Application Constants
const CONSTANTS = {
    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    },

    // Local Storage Keys (using CONFIG values)
    STORAGE_KEYS: CONFIG.STORAGE,

    // API Response Status
    API_STATUS: {
        SUCCESS: 'success',
        ERROR: 'error',
        LOADING: 'loading'
    },

    // Toast Types
    TOAST_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    // Modal Types
    MODAL_TYPES: {
        VENUE_DETAILS: 'venue-details',
        AUTH: 'auth',
        PROFILE: 'profile',
        CONFIRM: 'confirm'
    },

    // View Types
    VIEW_TYPES: {
        GRID: 'grid',
        LIST: 'list',
        MAP: 'map'
    },

    // Filter Types
    FILTER_TYPES: {
        TYPE: 'type',
        DISTRICT: 'district',
        PRICE: 'price',
        RATING: 'rating',
        DISTANCE: 'distance'
    },

    // Sort Options
    SORT_OPTIONS: {
        RELEVANCE: 'relevance',
        RATING: 'rating',
        PRICE_LOW: 'price_low',
        PRICE_HIGH: 'price_high',
        DISTANCE: 'distance',
        NEWEST: 'newest'
    },

    // User Roles
    USER_ROLES: {
        STUDENT: 'student',
        EXPAT: 'expat',
        DIGITAL_NOMAD: 'digital_nomad',
        LOCAL: 'local'
    },

    // Validation Rules
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PASSWORD_MIN_LENGTH: 6,
        NAME_MIN_LENGTH: 2,
        REVIEW_MIN_LENGTH: 10,
        REVIEW_MAX_LENGTH: 500
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: CONFIG.APP.PAGINATION.DEFAULT_LIMIT,
        MAX_LIMIT: CONFIG.APP.PAGINATION.MAX_LIMIT
    },

    // Map Settings
    MAP_SETTINGS: {
        DEFAULT_CENTER: CONFIG.MAP.DEFAULT_CENTER,
        DEFAULT_ZOOM: CONFIG.MAP.DEFAULT_ZOOM,
        MAX_ZOOM: 18,
        MIN_ZOOM: 10
    },

    // Rating Scale
    RATING: {
        MIN: 1,
        MAX: 5,
        DEFAULT: 0
    },

    // Image Settings
    IMAGE: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        PLACEHOLDER: 'assets/images/placeholder.jpg'
    },

    // Animation Durations (in ms)
    ANIMATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500
    },

    // Breakpoints (must match CSS)
    BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
        XXL: 1536
    },

    // Error Messages
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        UNAUTHORIZED: 'Please log in to continue.',
        FORBIDDEN: 'You don\'t have permission to perform this action.',
        NOT_FOUND: 'The requested resource was not found.',
        SERVER_ERROR: 'Server error. Please try again later.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        GENERIC_ERROR: 'Something went wrong. Please try again.'
    },

    // Success Messages
    SUCCESS_MESSAGES: {
        LOGIN: 'Welcome back!',
        REGISTER: 'Account created successfully!',
        LOGOUT: 'Logged out successfully!',
        PROFILE_UPDATED: 'Profile updated successfully!',
        REVIEW_SUBMITTED: 'Review submitted successfully!',
        FAVORITE_ADDED: 'Added to favorites!',
        FAVORITE_REMOVED: 'Removed from favorites!'
    }
};

// Make constants globally available
window.CONSTANTS = CONSTANTS;
