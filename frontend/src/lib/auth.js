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

export const logoutUser = async (navigate = null) => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (backendUrl) {
            await fetch(`${backendUrl}/user/logout`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include'
            }).catch(() => {});
        }
    } catch (err) {
        console.error('Error during backend logout:', err);
    } finally {
        clearAuth();
        if (typeof navigate === 'function') {
            navigate('/login');
        }
    }
};
