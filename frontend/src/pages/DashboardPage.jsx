import React from "react";
import { useDashboard } from "../context/DashboardContext";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

// --- Internal CSS Style Objects ---
const styles = {
  container: {
    padding: "1rem",
    fontFamily: "sans-serif"
  },
  header: {
    marginBottom: "40px"
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 500,
    color: "#4776edff",
    margin: 0
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px"
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: "30px",
    borderRadius: "8px",
    border: "1px solid #4fc3f1ff",
    textAlign: "center"
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#f5efb6ff",
    fontWeight: 400
  },
  cardValue: {
    margin: 0,
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#e0e0e0"
  },
  statusPlaced: {
    color: "#4caf50",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0
  },
  statusNotPlaced: {
    color: "#ff9800",
    fontSize: "2rem",
    fontWeight: "bold",
    margin: 0
  }
};

// --- Reusable Components ---

const DashboardCard = ({ title, value, style }) => (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>{title}</h3>
    <p style={{ ...styles.cardValue, ...style }}>{value}</p>
  </div>
);

// --- Individual Dashboard Components ---

const StudentDashboard = ({ user, data }) => (
  <div style={styles.container}>
    <div style={styles.header}>
      <h1 style={styles.title}>Welcome, {data.user?.name || "Student"} 👋</h1>
    </div>
    <div style={styles.cardGrid}>
      <DashboardCard title="Applied Jobs" value={data?.appliedJobs?.length || 0} />
      <DashboardCard title="Upcoming Tests" value={data?.upcomingExams?.length || 0} />
      <DashboardCard 
        title="Placement Status" 
        value={data?.placementStatus || "Not Placed"}
        style={data?.placementStatus === "Placed" ? styles.statusPlaced : styles.statusNotPlaced}
      />
    </div>
  </div>
);

const CompanyDashboard = ({ user, data }) => (
  <div style={styles.container}>
    <div style={styles.header}>
      <h1 style={styles.title}>Welcome, {data.user?.name || "Company"} 👋</h1>
    </div>
    <div style={styles.cardGrid}>
      <DashboardCard title="Posted Jobs" value={data?.postedJobs?.length || 0} />
      <DashboardCard title="Total Applicants" value={data?.totalApplicants || 0} />
    </div>
  </div>
);

const TPODashboard = ({ user, data }) => (
  <div style={styles.container}>
    <div style={styles.header}>
      <h1 style={styles.title}>Welcome, {data.user?.name || "TPO"} 👋</h1>
    </div>
    <div style={styles.cardGrid}>
      <DashboardCard title="Registered Companies" value={data?.totalCompanies || 0} />
      <DashboardCard title="Total Students" value={data?.totalStudents || 0} />
      <DashboardCard title="Placed Students" value={data?.placedStudents || 0} />
    </div>
  </div>
);


// --- Main Page Component (The Router) ---

const DashboardPage = () => {
  const { dashboardData, isLoading, error } = useDashboard();
  const { user } = useAuth();

  // Handle loading and error states first
  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading dashboard...</div>;
  }
  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
  }
  
  // If user data is somehow missing after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // A map to easily select the correct component based on the role
  const dashboardComponents = {
    student: StudentDashboard,
    company: CompanyDashboard,
    tpo: TPODashboard
  };

  const DashboardComponent = dashboardComponents[user.user.role];
  
  // If the role is invalid or doesn't exist, show an error or redirect
  if (!DashboardComponent) {
     return (
        <div style={{ color: 'red', border: '1px solid red', padding: '20px', margin: '20px' }}>
            <h2>Invalid User Role</h2>
            <p>Current role: {user.user.role || 'No role assigned'}</p>
            <p>Please contact the administrator to fix your role assignment.</p>
        </div>
      );
  }

  // Render the selected component, passing user and dashboard data as props
  return <DashboardComponent user={user} data={dashboardData} />;
};

export default DashboardPage;