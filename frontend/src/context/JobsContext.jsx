import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';

const initialState = {
  jobs: [],
  myApplications: [],
  filters: {
    search: '',
    domain: '',
    packageRange: '',
    location: '',
  },
  isLoading: true,
  error: null,
};

const JobsContext = createContext(initialState);

export const useJobs = () => {
  return useContext(JobsContext);
};

const jobsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        jobs: action.payload.jobs,
        myApplications: action.payload.myApplications,
      };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.name]: action.payload.value },
      };
    default:
      return state;
  }
};

export const JobsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobsReducer, initialState);

  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      const [jobsRes, myAppsRes] = await Promise.all([
        api.get('/jobs'), 
        api.get('/applications/me'), 
      ]);
      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { jobs: jobsRes.data, myApplications: myAppsRes.data },
      });
    } catch (err) {
      dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to fetch job data.' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilter = useCallback((name, value) => {
    dispatch({ type: 'SET_FILTER', payload: { name, value } });
  }, []);
  
  const contextValue = { ...state, setFilter, refetchData: fetchData };

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  );
};