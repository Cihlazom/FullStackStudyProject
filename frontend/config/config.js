const CONFIG = {
    API: {
        BASE_URL: 'https://g0725.pawa.com.es/backend/api',
        ENDPOINTS: {
            AUTH: {
                LOGIN: '/auth/login',
                REGISTER: '/auth/register',
                LOGOUT: '/auth/logout',
                PROFILE: '/auth/profile',
                VERIFY: '/auth/verify'
            },
            VENUES: {
                LIST: '/venues',
                DETAILS: (id) =>  `/venues/${id}`,
                PARAMS: (params) =>  `/venues?${params}`
            },
            FAVORITES: {
                ADD: '/favorites',
                DELETE: (id) =>  `/favorites/${id}`
            },
            USERS: {
                PROFILE: '/users/profile',
                MATCHES: '/users/matches',
                MATCH_REQUEST: '/users/match-request',
                FAVORITES: '/user/favorites'
            }
        }
    },

    APP: {
        VERSION: '1.0.0',
        PAGINATION: {
            DEFAULT_LIMIT: 12,
            MAX_LIMIT: 50
        },
        DEBOUNCE_DELAY: 300, // ms for search input
        TOAST_DURATION: 5000 // ms
    },

    STORAGE: {
        AUTH_TOKEN: 'barcelona_auth_token',
        USER_DATA: 'barcelona_user_data',
        SEARCH_HISTORY: 'barcelona_search_history',
        FAVORITES: 'barcelona_favorites'
    },
};

window.CONFIG = CONFIG;
