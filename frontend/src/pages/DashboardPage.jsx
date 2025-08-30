import React from 'react';
import { useDashboard } from '../context/DashboardContext';
const dashboardContainerStyle = { padding: '1rem', fontFamily: 'sans-serif' };
const headerStyle = { marginBottom: '40px' };
const cardValueStyle = { margin: 0, fontSize: '3rem', fontWeight: 'bold', color: '#e0e0e0' };
const statusNotPlacedStyle = { ...cardValueStyle, color: '#ff4d4d' };
const statusPlacedStyle = { ...cardValueStyle, color: '#4caf50' };

const DashboardPage = () => {
  const { dashboardData, isLoading, error } = useDashboard();

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  }

  return (
    <div style={dashboardContainerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 500, color: '#4caf50', margin: 0 }}>
          Welcome, {dashboardData?.studentName || 'Student'} 👋
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
        <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', border: '1px solid #4caf50', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#ffeb3b', fontWeight: 400 }}>Applied Jobs</h3>
          <p style={cardValueStyle}>{dashboardData?.appliedJobsCount || 0}</p>
        </div>

        <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', border: '1px solid #4caf50', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#ffeb3b', fontWeight: 400 }}>Upcoming Exams</h3>
          <p style={cardValueStyle}>{dashboardData?.upcomingExamsCount || 0}</p>
        </div>

        <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', border: '1px solid #4caf50', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#ffeb3b', fontWeight: 400 }}>Placement Status</h3>
          <p style={dashboardData?.placementStatus === 'Placed' ? statusPlacedStyle : statusNotPlacedStyle}>
            {dashboardData?.placementStatus || 'Not Placed'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;