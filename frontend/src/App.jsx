import { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { SuccessPayment, CancelPayment } from './components/Success';
import axios from 'axios';
import Home from './Home';
import Signup from './components/Signup';
import Login from './components/Login';
import ProductDisplay from './components/ProductDisplay';
import Admin from './components/Admin';
import AddProduct from './components/AddProducts';
import User from './components/User';
import Profile from './components/Profile';
import EditProduct from './components/EditProduct';
import AllProducts from './components/AllProducts';
import AdminOrdersPage from './components/AdminOrdersPage';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './components/Checkout';
import Analytics from './components/Analytics';
import WhatsAppButton from './components/WhatsappBtn';
import NotificationPopup from './components/Notification';
import AddNotification from './components/AddNotification';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { getCurrentUser } from './lib/auth.js';

/* Wrap public pages with the Prada Navbar + Footer */
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const App = () => {
  const [user, setUser] = useState(() => getCurrentUser());
  const role = user?.role || null;

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const updateVisitCount = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/updateGlobalVisitCount`,
      );
    } catch (error) {
      console.error('Error updating visit count:', error);
    }
  };

  useEffect(() => {
    updateVisitCount();
  }, []);

  return (
    <div className='overflow-hidden'>
      {/* Show these components only for non-admin users */}
      {role !== "admin" && (
        <>
          <WhatsAppButton />
          <NotificationPopup />
        </>
      )}

      <Routes>
        {/* Public routes with Navbar + Footer layout */}
        <Route path='/' element={<PublicLayout><Home isLayout={false} /></PublicLayout>} />
        <Route path='/signup' element={<PublicLayout><Signup /></PublicLayout>} />
        <Route path='/login' element={<PublicLayout><Login /></PublicLayout>} />
        <Route path='/product/:id' element={<PublicLayout><ProductDisplay /></PublicLayout>} />
        <Route path='/profile' element={<PublicLayout><Profile /></PublicLayout>} />
        <Route path='/all-products' element={<PublicLayout><AllProducts /></PublicLayout>} />
        <Route path="/products/:category" element={<PublicLayout><AllProducts /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/payment/success" element={<PublicLayout><SuccessPayment /></PublicLayout>} />
        <Route path="/payment/cancel" element={<PublicLayout><CancelPayment /></PublicLayout>} />

        {/* Admin Routes (no Navbar/Footer layout) */}
        <Route path='/admin' element={<ProtectedRoute role={role} requiredRole="admin"><Admin /></ProtectedRoute>} />
        <Route path='/add-product' element={<ProtectedRoute role={role} requiredRole="admin"><AddProduct /></ProtectedRoute>} />
        <Route path='/add-users' element={<ProtectedRoute role={role} requiredRole="admin"><User /></ProtectedRoute>} />
        <Route path='/edit-product/:id' element={<ProtectedRoute role={role} requiredRole="admin"><EditProduct /></ProtectedRoute>} />
        <Route path='/orders' element={<ProtectedRoute role={role} requiredRole="admin"><AdminOrdersPage /></ProtectedRoute>} />
        <Route path='/analytics' element={<ProtectedRoute role={role} requiredRole="admin"><Analytics /></ProtectedRoute>} />
        <Route path='/notification' element={<ProtectedRoute role={role} requiredRole="admin"><AddNotification /></ProtectedRoute>} />
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App;
