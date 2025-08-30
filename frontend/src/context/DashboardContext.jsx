import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api'; // Assuming you have your central api instance

// ... (initialState, createContext, useDashboard, and dashboardReducer are all correct) ...

const initialState = {
  dashboardData: null,
  isLoading: true, 
  error: null,
};
const DashboardContext = createContext(initialState);
export const useDashboard = () => useContext(DashboardContext);

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, dashboardData: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};


// --- Provider Component ---
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const fetchDashboardData = useCallback(async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
        console.log('Fetching dashboard data...');
      const res = await api.get('/api/profile/me');
      console.log('Received dashboard data:', res.data);

      dispatch({ type: 'FETCH_SUCCESS', payload: res.data });
      
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Failed to fetch dashboard data.';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const contextValue = {
    ...state,
    refetch: fetchDashboardData,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};