import React from "react";
import { useJobs } from "../context/JobsContext";


const pageStyle = { fontFamily: "sans-serif", color: "#e0e0e0" };
const sectionTitleStyle = {
  fontSize: "2rem",
  fontWeight: 500,
  marginBottom: "20px",
  borderBottom: "1px solid #444",
  paddingBottom: "10px",
};
const filtersContainerStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "30px",
};
const inputStyle = {
  padding: "10px",
  backgroundColor: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: "4px",
  color: "#e0e0e0",
  flex: 1,
};
const jobsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginBottom: "50px",
};
const jobCardStyle = {
  backgroundColor: "#1e1e1e",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #555",
};
const jobCardTitleStyle = { margin: "0 0 10px 0", fontSize: "1.2rem" };
const jobCardInfoStyle = { margin: "5px 0", color: "#aaa", fontSize: "0.9rem" };
const jobCardButtonsStyle = { marginTop: "15px", display: "flex", gap: "10px" };
const applyBtnStyle = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
};
const detailsBtnStyle = {
  ...applyBtnStyle,
  backgroundColor: "#333",
  border: "1px solid #555",
};
const myAppsTableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = {
  padding: "12px",
  backgroundColor: "#007bff",
  color: "white",
  textAlign: "left",
  borderBottom: "1px solid #333",
};
const tdStyle = { padding: "12px", borderBottom: "1px solid #333" };
const statusStyle = {
  padding: "5px 10px",
  borderRadius: "12px",
  color: "#1e1e1e",
  fontWeight: "bold",
};

const getStatusColor = (status) => {
  switch (status) {
    case "Shortlisted":
      return "#ffeb3b"; 
    case "Interview Scheduled":
      return "#ff9800"; 
    case "Offer Received":
      return "#4caf50"; 
    default:
      return "#e0e0e0"; 
  }
};



const JobsPage = () => {
  const { jobs, myApplications, filters, setFilter, isLoading, error } =
    useJobs();

  const filteredJobs = jobs.filter((job) => {
    return (
      job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      (filters.location ? job.location === filters.location : true)
    );
  });

  if (isLoading) return <div>Loading jobs...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={pageStyle}>
      <h1 style={sectionTitleStyle}>Job Applications</h1>
      <div style={filtersContainerStyle}>
        <input
          type="text"
          placeholder="Search jobs..."
          style={inputStyle}
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
        />
        <input
          type="text"
          placeholder="Domain"
          style={inputStyle}
          value={filters.domain}
          onChange={(e) => setFilter("domain", e.target.value)}
        />
        <input
          type="text"
          placeholder="Package"
          style={inputStyle}
          value={filters.packageRange}
          onChange={(e) => setFilter("packageRange", e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          style={inputStyle}
          value={filters.location}
          onChange={(e) => setFilter("location", e.target.value)}
        />
      </div>

      <div style={jobsGridStyle}>
        {filteredJobs.map((job) => (
          <div key={job._id} style={jobCardStyle}>
            <h3 style={jobCardTitleStyle}>
              {job.title} - {job.companyName || "A Company"}
            </h3>
            <p style={jobCardInfoStyle}>Bangalore | {job.package} LPA</p>
            <p style={jobCardInfoStyle}>
              Eligibility: Min {job.eligibility?.cgpa || "N/A"} CGPA, CS/IT
            </p>
            <div style={jobCardButtonsStyle}>
              <button style={applyBtnStyle}>Apply</button>
              <button style={detailsBtnStyle}>View Details</button>
            </div>
          </div>
        ))}
      </div>

      <h1 style={sectionTitleStyle}>My Applications</h1>
      <table style={myAppsTableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>COMPANY</th>
            <th style={thStyle}>ROLE</th>
            <th style={thStyle}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {myApplications.map((app) => (
            <tr key={app._id}>
              <td style={tdStyle}>{app.job?.companyName || "A Company"}</td>
              <td style={tdStyle}>{app.job?.title || "A Role"}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    ...statusStyle,
                    backgroundColor: getStatusColor(app.status),
                  }}
                >
                  {app.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobsPage;
