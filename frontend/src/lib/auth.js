export const getAuthToken = () => {
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;

    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?.token || null;
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
