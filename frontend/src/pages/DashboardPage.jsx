import React from "react";
import { useDashboard } from "../context/DashboardContext";
const dashboardContainerStyle = { padding: "1rem", fontFamily: "sans-serif" };
const headerStyle = { marginBottom: "40px" };
const cardValueStyle = {
  margin: 0,
  fontSize: "3rem",
  fontWeight: "bold",
  color: "#e0e0e0",
};
const statusNotPlacedStyle = { ...cardValueStyle, color: "#ff4d4d" };
const statusPlacedStyle = { ...cardValueStyle, color: "#6087f0ff" };

const DashboardPage = () => {
  const { dashboardData, isLoading, error } = useDashboard();

  const appliedJobsCount = () => {
    if (dashboardData && dashboardData.appliedJobs) {
      return dashboardData.appliedJobs.length;
    }
    return 0;
  };
  const upcomingExamsCount = () => {
    if (dashboardData && dashboardData.upcomingExams) {
      return dashboardData.upcomingExams.length;
    }
    return 0;
  };

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading Dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: "red", padding: "20px" }}>{error}</div>;
  }

  return (
    <div style={dashboardContainerStyle}>
      <div style={headerStyle}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 500,
            color: "#4776edff",
            margin: 0,
          }}
        >
          Welcome, {dashboardData?.user.name || "Student"} 👋
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "8px",
            border: "1px solid #4fc3f1ff",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#f5efb6ff",
              fontWeight: 400,
            }}
          >
            Applied Jobs
          </h3>
          <p style={cardValueStyle}>{appliedJobsCount() || 0}</p>
        </div>

        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "8px",
            border: "1px solid #4fc3f1ff",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#f5efb6ff",
              fontWeight: 400,
            }}
          >
            Upcoming Exams
          </h3>
          <p style={cardValueStyle}>{upcomingExamsCount() || 0}</p>
        </div>

        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "8px",
            border: "1px solid #4fc3f1ff",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#f5efb6ff",
              fontWeight: 400,
            }}
          >
            Placement Status
          </h3>
          <p
            style={
              dashboardData?.placementStatus === "Placed"
                ? statusPlacedStyle
                : statusNotPlacedStyle
            }
          >
            {dashboardData?.placementStatus || "Not Placed"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
