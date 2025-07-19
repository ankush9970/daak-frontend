import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    // When app loads: check token in localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    if (token && role && name) {
      setUser({ token, role, name });
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use in any component
export const useAuth = () => useContext(AuthContext);
