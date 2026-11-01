export const getAuthToken = () => {
    const directToken = localStorage.getItem('token');
    if (directToken) {
        return directToken.trim().replace(/^Bearer\s+/i, '') || null;
    }

    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userToken = user?.token;
        if (userToken) {
            return String(userToken).trim().replace(/^Bearer\s+/i, '') || null;
        }
        return null;
    } catch {
        return null;
    }
};

export const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
        return null;
    }
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
};
