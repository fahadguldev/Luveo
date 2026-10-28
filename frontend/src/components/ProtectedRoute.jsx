import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth.js';

const ProtectedRoute = ({ children, role, requiredRole }) => {
    const currentRole = role || getCurrentUser()?.role || null;
    if (!currentRole || currentRole !== requiredRole) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
