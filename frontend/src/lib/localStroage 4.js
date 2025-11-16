export const STORAGE_KEYS = {
    USER: 'standup_user',
    AUTH_STATUS: 'standup_auth_status',
    TOKEN: 'standup_token',
};

/**
 * Save data to localStorage with error handling
 */
export const saveToStorage = (key, value) => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
    } catch (err) {
        console.error(`Error saving to localStorage (${key}):`, err);
        return false;
    }
};

/**
 * Load data from localStorage with error handling
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
        console.error(`Error loading from localStorage (${key}):`, err);
        return defaultValue;
    }
};

/**
 * Remove data from localStorage
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (err) {
        console.error(`Error removing from localStorage (${key}):`, err);
        return false;
    }
};

/**
 * Clear all app-related data from localStorage
 */
export const clearAllStorage = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (err) {
        console.error('Error clearing localStorage:', err);
        return false;
    }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = () => {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (err) {
        return false;
    }
};