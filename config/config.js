// Configuration file for Barcelona Local Platform
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:8000/api', // Change for production
        ENDPOINTS: {
            AUTH: {
                LOGIN: '/auth/login',
                REGISTER: '/auth/register',
                LOGOUT: '/auth/logout',
                PROFILE: '/auth/profile',
                REFRESH: '/auth/refresh'
            },
            VENUES: {
                LIST: '/venues',
                DETAILS: '/venues/:id',
                SEARCH: '/venues/search',
                REVIEWS: '/venues/:id/reviews',
                FAVORITES: '/venues/favorites'
            },
            EVENTS: {
                LIST: '/events',
                DETAILS: '/events/:id',
                SEARCH: '/events/search',
                UPCOMING: '/events/upcoming'
            },
            USERS: {
                PROFILE: '/users/profile',
                MATCHES: '/users/matches',
                MATCH_REQUEST: '/users/match-request'
            }
        }
    },

    // App Settings
    APP: {
        NAME: 'BarcelonaLocal',
        VERSION: '1.0.0',
        LOCALE: 'en',
        TIMEZONE: 'Europe/Madrid',
        PAGINATION: {
            DEFAULT_LIMIT: 12,
            MAX_LIMIT: 50
        },
        DEBOUNCE_DELAY: 300, // ms for search input
        TOAST_DURATION: 5000 // ms
    },

    // Map Configuration (Google Maps)
    MAP: {
        DEFAULT_CENTER: {
            lat: 41.3851,
            lng: 2.1734 // Barcelona coordinates
        },
        DEFAULT_ZOOM: 13,
        STYLES: [
            // Custom map styles can be added here
        ]
    },

    // Storage Keys
    STORAGE: {
        AUTH_TOKEN: 'barcelona_auth_token',
        USER_DATA: 'barcelona_user_data',
        PREFERENCES: 'barcelona_preferences',
        SEARCH_HISTORY: 'barcelona_search_history',
        FAVORITES: 'barcelona_favorites'
    },

    // Venue Types
    VENUE_TYPES: {
        RESTAURANT: 'restaurant',
        BAR: 'bar',
        CAFE: 'cafe',
        CLUB: 'club',
        COWORKING: 'coworking',
        CULTURAL: 'cultural',
        OUTDOOR: 'outdoor'
    },

    // Event Types
    EVENT_TYPES: {
        NIGHTLIFE: 'nightlife',
        CULTURAL: 'cultural',
        SPORTS: 'sports',
        NETWORKING: 'networking',
        FOOD: 'food',
        MUSIC: 'music',
        ART: 'art'
    },

    // Price Ranges
    PRICE_RANGES: {
        BUDGET: { min: 0, max: 15, label: '€' },
        MODERATE: { min: 15, max: 30, label: '€€' },
        EXPENSIVE: { min: 30, max: 50, label: '€€€' },
        LUXURY: { min: 50, max: 999, label: '€€€€' }
    },

    // Barcelona Districts
    DISTRICTS: [
        'Ciutat Vella',
        'Eixample',
        'Sants-Montjuïc',
        'Les Corts',
        'Sarrià-Sant Gervasi',
        'Gràcia',
        'Horta-Guinardó',
        'Nou Barris',
        'Sant Andreu',
        'Sant Martí'
    ],

    // Age Ranges
    AGE_RANGES: [
        { value: '18-22', label: '18-22' },
        { value: '23-26', label: '23-26' },
        { value: '27-30', label: '27-30' }
    ],

    // User Interests
    INTERESTS: [
        'nightlife',
        'food',
        'culture',
        'sports',
        'music',
        'art',
        'networking',
        'outdoor',
        'tech',
        'startup'
    ]
};

// Make config globally available
window.CONFIG = CONFIG;
