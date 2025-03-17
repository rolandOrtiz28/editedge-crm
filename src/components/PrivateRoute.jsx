// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from './utils/auth';

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState({ isAuthenticated: null, user: null });

  useEffect(() => {
    const verifyAuth = async () => {
      const result = await checkAuth();
      setAuth(result);
    };
    verifyAuth();
  }, []);

  if (auth.isAuthenticated === null) {
    return <div>Loading...</div>; // Simple loading state
  }

  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;