import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { DashboardProvider } from "../context/DashboardContext";
import { JobsProvider } from "../context/JobsContext";

const mainLayoutStyle = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#121212",
  color: "#e0e0e0",
  minHeight: "100vh",
  fontFamily: "sans-serif",
};

const navbarStyle = {
  display: "flex",
  alignItems: "center",
  padding: "15px 30px",
  backgroundColor: "#1e1e1e",
  borderBottom: "1px solid #333",
};

const navbarLogoStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#fff",
  marginRight: "auto",
};

const navbarLinksContainerStyle = {
  display: "flex",
  gap: "25px",
};

const getNavLinkStyle = ({ isActive }) => {
  return {
    color: isActive ? "#fff" : "#aaa",
    textDecoration: "none",
    padding: "5px 0",
    borderBottom: isActive ? "2px solid #00aaff" : "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  };
};

const userProfileStyle = {
  display: "flex",
  alignItems: "center",
  marginLeft: "30px",
  gap: "10px",
  color: "#e0e0e0",
};

const logoutBtnStyle = {
  background: "none",
  border: "1px solid #ff4d4d",
  color: "#ff4d4d",
  padding: "5px 10px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
};

const pageContentStyle = {
  padding: "30px",
};

const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={mainLayoutStyle}>
      <nav style={navbarStyle}>
        <div style={navbarLogoStyle}>Placement Tracker Portal</div>

        <div style={navbarLinksContainerStyle}>
          <NavLink to="/dashboard" style={getNavLinkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/jobs" style={getNavLinkStyle}>
            Jobs
          </NavLink>
          <NavLink to="/practice" style={getNavLinkStyle}>
            Practice & Exam
          </NavLink>
          <NavLink to="/resumebuilder" style={getNavLinkStyle}>
            Resume Builder
          </NavLink>
          <NavLink to="/history" style={getNavLinkStyle}>
            History
          </NavLink>
          <NavLink to="/leaderboard" style={getNavLinkStyle}>
            Leaderboard
          </NavLink>
        </div>

        <div style={userProfileStyle}>
          <span>{user ? user.name : "User"}</span>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            Logout
          </button>
        </div>
      </nav>


      <DashboardProvider>
        <JobsProvider>
          <main style={pageContentStyle}>
            <Outlet /> 
          </main>
        </JobsProvider>
      </DashboardProvider>
    </div>
  );
};

export default MainLayout;
