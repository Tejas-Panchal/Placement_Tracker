import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode'; // You need this library: npm install jwt-decode

// Helper function (no changes)
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// --- CHANGE #1: A function to get the initial state from localStorage ---
const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const user = jwtDecode(token);
      // Optional but recommended: check if token is expired
      if (user.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return { token: null, isAuthenticated: false, user: null, isLoading: false, error: null };
      }
      // If token is valid, return the state with user data
      return { token, isAuthenticated: true, user, isLoading: false, error: null };
    } catch (error) {
      // If token is malformed
      localStorage.removeItem('token');
    }
  }
  // Default state if no token
  return { token: null, isAuthenticated: false, user: null, isLoading: false, error: null };
};

const initialState = getInitialState();

const AuthContext = createContext(initialState);
export const useAuth = () => useContext(AuthContext);

// --- CHANGE #2: Update the reducer to handle the user object ---
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS': { // Use block scope for clarity
      const token = action.payload.token;
      const user = jwtDecode(token); // Decode the token to get user info
      console.log('DECODED USER FROM TOKEN:', user);
      localStorage.setItem('token', token);
      return {
        ...state,
        token: token,
        user: user, // <-- STORE THE USER OBJECT IN THE STATE
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    }
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


// --- Provider Component (No other changes needed below this line) ---
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

  const contextValue = { ...state, register, login, logout, clearError };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};