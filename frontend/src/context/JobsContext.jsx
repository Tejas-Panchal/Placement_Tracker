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
      console.log('Fetching jobs and applications data...');
      const [jobsRes, myAppsRes] = await Promise.all([
        api.get('/api/profile/jobs'), 
        api.get('/api/profile/me'), 
      ]);
      
      console.log('Jobs data received:', jobsRes.data);
      console.log('Profile data received:', myAppsRes.data);
      
      const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data?.jobs || []);
      
      // Extract applied jobs from the student profile
      const applicationsData = myAppsRes.data?.appliedJobs || [];
      console.log("jobs", myAppsRes);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { 
          jobs: jobsData, 
          myApplications: applicationsData 
        },
      });
    } catch (err) {
      console.error('Error fetching job data:', err);
      dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to fetch job data: ' + (err.message || err) });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setFilter = useCallback((name, value) => {
    dispatch({ type: 'SET_FILTER', payload: { name, value } });
  }, []);
  
  const getFilteredJobs = useCallback(() => {
    if (!Array.isArray(state.jobs)) return [];
    
    return state.jobs.filter(job => {
      if (!job) return false;
      
      const matchesSearch = !state.filters.search || 
        job.title?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        job.company?.companyName?.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        job.description?.toLowerCase().includes(state.filters.search.toLowerCase());

      const matchesDomain = !state.filters.domain || 
        job.domain?.toLowerCase() === state.filters.domain.toLowerCase();

      const matchesLocation = !state.filters.location || 
        job.location?.toLowerCase().includes(state.filters.location.toLowerCase());

      const matchesPackage = !state.filters.packageRange || (() => {
        if (!state.filters.packageRange.includes('-')) {
          if (state.filters.packageRange === '20+') {
            const jobPackage = Number(job.package?.baseSalary) || 0;
            return jobPackage >= 20;
          }
          return true;
        }
        const [min, max] = state.filters.packageRange.split('-').map(Number);
        const jobPackage = Number(job.package?.baseSalary) || 0;
        return (!min || jobPackage >= min) && (!max || jobPackage <= max);
      })();

      return matchesSearch && matchesDomain && matchesLocation && matchesPackage;
    });
  }, [state.jobs, state.filters]);

  const contextValue = { 
    ...state, 
    setFilter, 
    refetchData: fetchData,
    filteredJobs: getFilteredJobs()
  };

  return (
    <JobsContext.Provider value={contextValue}>
      {children}
    </JobsContext.Provider>
  );
};