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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#ff077f] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return auth.isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;