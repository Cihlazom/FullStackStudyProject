const CONFIG = {
    // TODO: подогнать все запросы под этот конфиг, а не хардкодом как там сейчас
    API: {
        BASE_URL: 'http://localhost/FullStackStudyProject/backend/api',
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
                DETAILS: (id) =>  `/venues/${id}`,
                SEARCH: '/venues/search',
                REVIEWS: '/venues/:id/reviews',
                FAVORITES: '/venues/favorites'
            },
            USERS: {
                PROFILE: '/users/profile',
                MATCHES: '/users/matches',
                MATCH_REQUEST: '/users/match-request'
            }
        }
    },

    APP: {
        // NAME: 'BarcelonaLocal',
        VERSION: '1.0.0',
        // LOCALE: 'en',
        // TIMEZONE: 'Europe/Madrid',
        PAGINATION: {
            DEFAULT_LIMIT: 12,
            MAX_LIMIT: 50
        },
        DEBOUNCE_DELAY: 300, // ms for search input
        TOAST_DURATION: 5000 // ms
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
    // VENUE_TYPES: {
    //     RESTAURANT: 'restaurant',
    //     BAR: 'bar',
    //     CAFE: 'cafe',
    //     CLUB: 'club',
    //     COWORKING: 'coworking',
    //     CULTURAL: 'cultural',
    //     OUTDOOR: 'outdoor'
    // },

    // Price Ranges
    // PRICE_RANGES: {
    //     BUDGET: { min: 0, max: 15, label: '€' },
    //     MODERATE: { min: 15, max: 30, label: '€€' },
    //     EXPENSIVE: { min: 30, max: 50, label: '€€€' },
    //     LUXURY: { min: 50, max: 999, label: '€€€€' }
    // },

    // Barcelona Districts
    // DISTRICTS: [
    //     'Ciutat Vella',
    //     'Eixample',
    //     'Sants-Montjuïc',
    //     'Les Corts',
    //     'Sarrià-Sant Gervasi',
    //     'Gràcia',
    //     'Horta-Guinardó',
    //     'Nou Barris',
    //     'Sant Andreu',
    //     'Sant Martí'
    // ],

    // AGE_RANGES: [
    //     { value: '18-22', label: '18-22' },
    //     { value: '23-26', label: '23-26' },
    //     { value: '27-30', label: '27-30' }
    // ],

    // INTERESTS: [
    //     'nightlife',
    //     'food',
    //     'culture',
    //     'sports',
    //     'music',
    //     'art',
    //     'networking',
    //     'outdoor',
    //     'tech',
    //     'startup'
    // ]
};

window.CONFIG = CONFIG;
