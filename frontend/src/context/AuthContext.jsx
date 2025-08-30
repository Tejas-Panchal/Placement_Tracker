// 1. Import 'useCallback' from React
import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// Helper function (no changes)
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Initial state and Reducer (no changes)
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  user: null,
  error: null,
};

const AuthContext = createContext(initialState);
export const useAuth = () => useContext(AuthContext);

const authReducer = (state, action) => {
  // ... (this reducer logic is correct, no changes needed)
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return { ...state, ...action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'AUTH_FAILURE':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, token: null, isAuthenticated: false, isLoading: false, user: null, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};


// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  

  const register = useCallback(async (formData) => {
    dispatch({ type: 'AUTH_REQUEST' });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_FAILURE', payload: err.response.data.msg || 'Registration failed.' });
    }
  }, []); 



  const login = useCallback(async (formData) => {
    dispatch({ type: 'AUTH_REQUEST' });
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'AUTH_FAILURE', payload: err.response.data.msg || 'Invalid credentials.' });
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Now the context value provides stable functions
  const contextValue = { ...state, register, login, logout, clearError };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};