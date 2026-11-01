import { Navigate } from 'react-router-dom';
import { getCurrentUser, getAuthToken } from '../lib/auth.js';

const ProtectedRoute = ({ children, role, requiredRole }) => {
    const currentRole = role || getCurrentUser()?.role || null;
    const token = getAuthToken();

    if (!currentRole || currentRole !== requiredRole || !token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
