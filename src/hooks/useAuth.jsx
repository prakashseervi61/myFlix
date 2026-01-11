import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('myflix_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('myflix_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const userData = { id: user.id, email: user.email, name: user.name };
        setUser(userData);
        localStorage.setItem('myflix_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: 'An error occurred during login.' };
    }
  }, []);

  const signup = useCallback((name, email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('myflix_users') || '[]');
      if (users.some(u => u.email === email)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newUser = { id: Date.now().toString(), name, email, password };
      users.push(newUser);
      localStorage.setItem('myflix_users', JSON.stringify(users));

      const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
      setUser(userData);
      localStorage.setItem('myflix_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'An error occurred during signup.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('myflix_user');
  }, []);

  const value = { user, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};