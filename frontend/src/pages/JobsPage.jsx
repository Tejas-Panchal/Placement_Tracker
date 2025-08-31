import React from "react";
import { useJobs } from "../context/JobsContext";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../context/DashboardContext";

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
    case "Applied":
      return "#e0e0e0";
    case "Shortlisted":
      return "#ffeb3b";
    case "Interview Scheduled":
    case "In Progress":
      return "#ff9800";
    case "Offer Received":
    case "Selected":
      return "#4caf50";
    case "Rejected":
      return "#ff5555";
    default:
      return "#e0e0e0";
  }
};

// Modal overlay styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

// Breadcrumbs styles
const breadcrumbsContainerStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "15px",
  padding: "8px 0",
  borderRadius: "4px",
};

const breadcrumbItemStyle = {
  color: "#aaa",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 0.2s",
};

const breadcrumbSeparatorStyle = {
  margin: "0 10px",
  color: "#666",
};

const breadcrumbActiveStyle = {
  color: "#fff",
  fontWeight: "500",
  cursor: "default",
};

const modalContentStyle = {
  backgroundColor: "#2a2a2a",
  borderRadius: "8px",
  padding: "30px",
  maxWidth: "800px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
};

const modalCloseButtonStyle = {
  position: "absolute",
  top: "15px",
  right: "15px",
  backgroundColor: "transparent",
  border: "none",
  fontSize: "24px",
  color: "#aaa",
  cursor: "pointer",
};

const modalSectionStyle = {
  marginBottom: "20px",
  paddingBottom: "15px",
  borderBottom: "1px solid #444",
};

const JobsPage = () => {
  const {
    filteredJobs,
    myApplications,
    filters,
    setFilter,
    isLoading,
    error,
    refetchData,
  } = useJobs();
  const { dashboardData } = useDashboard();
  // const { user } = useAuth();
  const [applyingJobId, setApplyingJobId] = React.useState(null);
  const [applyStatus, setApplyStatus] = React.useState({
    loading: false,
    error: null,
    success: false,
  });
  const [selectedJob, setSelectedJob] = React.useState(null); // State to track which job to show details for
  const [hoveredBreadcrumb, setHoveredBreadcrumb] = React.useState(null); // State to track hovered breadcrumb

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    setApplyStatus({ loading: true, error: null, success: false });

    try {
      await api.post(`/api/profile/apply/${jobId}`);
      setApplyStatus({ loading: false, error: null, success: true });

      // Refetch data to update the applications list
      setTimeout(() => {
        refetchData();
        setApplyStatus({ loading: false, error: null, success: false });
      }, 1500);
    } catch (err) {
      setApplyStatus({
        loading: false,
        error: err.response?.data?.message || "Failed to apply for the job",
        success: false,
      });
    }
  };

  // Check if user has already applied for a job
  const hasApplied = (jobId) => {
    return (
      Array.isArray(myApplications) &&
      myApplications.some((app) => {
        // Check if job is a string ID or an object with _id
        const appJobId = typeof app.job === "string" ? app.job : app.job?._id;
        return appJobId === jobId;
      })
    );
  };

  // Function to handle view details button click
  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedJob(null);
    setHoveredBreadcrumb(null);
  };

  // Function to handle breadcrumb navigation
  const handleBreadcrumbClick = (path) => {
    // Close the current modal
    setSelectedJob(null);
    setHoveredBreadcrumb(null);
  };

  // Handle ESC key press to close the modal
  React.useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && selectedJob) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [selectedJob]);

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
        <select
          style={inputStyle}
          value={filters.domain || ""}
          onChange={(e) => setFilter("domain", e.target.value)}
        >
          <option value="">All Domains</option>
          <option value="Software Development">Software Development</option>
          <option value="Data Science">Data Science</option>
          <option value="Web Development">Web Development</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Cloud Computing">Cloud Computing</option>
        </select>
        <select
          style={inputStyle}
          value={filters.packageRange || ""}
          onChange={(e) => setFilter("packageRange", e.target.value)}
        >
          <option value="">All Packages</option>
          <option value="0-5">0-5 LPA</option>
          <option value="5-10">5-10 LPA</option>
          <option value="10-15">10-15 LPA</option>
          <option value="15-20">15-20 LPA</option>
          <option value="20+">20+ LPA</option>
        </select>
        <select
          style={inputStyle}
          value={filters.location || ""}
          onChange={(e) => setFilter("location", e.target.value)}
        >
          <option value="">All Locations</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Pune">Pune</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {applyStatus.error && (
        <div
          style={{
            backgroundColor: "#ff5555",
            color: "white",
            padding: "10px 20px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          Error: {applyStatus.error}
        </div>
      )}

      <div style={jobsGridStyle}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job._id} style={jobCardStyle}>
              <h3 style={jobCardTitleStyle}>
                {job.title} - {job.company.companyName || "A Company"}
              </h3>
              <p style={jobCardInfoStyle}>
                {job.location || "Location N/A"} |{" "}
                {job.package?.baseSalary || "Package N/A"} LPA
              </p>
              <p style={jobCardInfoStyle}>Domain: {job.domain || "N/A"}</p>
              <p style={jobCardInfoStyle}>
                Eligibility: Min {job.eligibilityCriteria?.minCGPA || "N/A"}{" "}
                CGPA,{" "}
                {job.eligibilityCriteria?.branches?.join(", ") ||
                  "All Branches"}
              </p>
              <div style={jobCardButtonsStyle}>
                {hasApplied(job._id) ? (
                  <button
                    style={{
                      ...applyBtnStyle,
                      backgroundColor: "#4caf50",
                      cursor: "default",
                    }}
                    disabled
                  >
                    Applied
                  </button>
                ) : (
                  <button
                    style={applyBtnStyle}
                    onClick={() => handleApply(job._id)}
                    disabled={applyingJobId === job._id && applyStatus.loading}
                  >
                    {applyingJobId === job._id && applyStatus.loading
                      ? "Applying..."
                      : applyingJobId === job._id && applyStatus.success
                      ? "Applied!"
                      : "Apply"}
                  </button>
                )}
                <button
                  style={detailsBtnStyle}
                  onClick={() => handleViewDetails(job)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              gridColumn: "1 / -1",
              padding: "20px",
            }}
          >
            <h3>No jobs match your filter criteria</h3>
            <p>Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>

      <h1 style={sectionTitleStyle}>My Applications</h1>
      <table style={myAppsTableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>COMPANY</th>
            <th style={thStyle}>ROLE</th>
            <th style={thStyle}>APPLIED DATE</th>
            <th style={thStyle}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(myApplications) && myApplications.length > 0 ? (
            myApplications.map((app) => (
              <tr key={app._id}>
                <td style={tdStyle}>
                  {app?.job?.company?.companyName || "A Default Company Name"}
                </td>
                {console.log(dashboardData)}
                <td style={tdStyle}>{app?.job?.title || "Software Engineer"}</td>
                <td style={tdStyle}>
                  {app?.appliedDate
                    ? new Date(app.appliedDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      ...statusStyle,
                      backgroundColor: getStatusColor(app.status),
                    }}
                  >
                    {app.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={tdStyle}>
                No applications found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Job Details Modal */}
      {selectedJob && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div
            style={{ ...modalContentStyle, position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button style={modalCloseButtonStyle} onClick={closeModal}>
              &times;
            </button>

            {/* Breadcrumbs */}
            <div style={breadcrumbsContainerStyle}>
              <span
                style={{
                  ...breadcrumbItemStyle,
                  color: hoveredBreadcrumb === "home" ? "#007bff" : "#aaa",
                  textDecoration:
                    hoveredBreadcrumb === "home" ? "underline" : "none",
                }}
                onClick={() => handleBreadcrumbClick("dashboard")}
                onMouseEnter={() => setHoveredBreadcrumb("home")}
                onMouseLeave={() => setHoveredBreadcrumb(null)}
              >
                Home
              </span>
              <span style={breadcrumbSeparatorStyle}>&gt;</span>
              <span
                style={{
                  ...breadcrumbItemStyle,
                  color: hoveredBreadcrumb === "jobs" ? "#007bff" : "#aaa",
                  textDecoration:
                    hoveredBreadcrumb === "jobs" ? "underline" : "none",
                }}
                onClick={() => handleBreadcrumbClick("jobs")}
                onMouseEnter={() => setHoveredBreadcrumb("jobs")}
                onMouseLeave={() => setHoveredBreadcrumb(null)}
              >
                Jobs
              </span>
              <span style={breadcrumbSeparatorStyle}>&gt;</span>
              <span style={breadcrumbActiveStyle}>
                {selectedJob.title}@
                {selectedJob.company?.companyName || "Company"}
              </span>
            </div>

            <div style={modalSectionStyle}>
              <h2 style={{ marginTop: 0, color: "#fff" }}>
                {selectedJob.title}
              </h2>
              <p style={{ fontSize: "1.2rem", color: "#aaa" }}>
                {selectedJob.company?.companyName || "Company"}
              </p>
            </div>

            <div style={modalSectionStyle}>
              <h3>Job Details</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Location:</strong> {selectedJob.location || "N/A"}
                  </p>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Package:</strong>{" "}
                    {selectedJob.package?.baseSalary || "N/A"} LPA
                  </p>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Domain:</strong> {selectedJob.domain || "N/A"}
                  </p>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Job Type:</strong>{" "}
                    {selectedJob.jobType || "Full Time"}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Posted On:</strong>{" "}
                    {new Date(selectedJob.createdAt).toLocaleDateString() ||
                      "N/A"}
                  </p>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Last Date to Apply:</strong>{" "}
                    {selectedJob.lastDateToApply
                      ? new Date(
                          selectedJob.lastDateToApply
                        ).toLocaleDateString()
                      : "Open"}
                  </p>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Experience:</strong>{" "}
                    {selectedJob.experienceRequired || "0-1 years"}
                  </p>
                  <p style={{ margin: "8px 0", color: "#bbb" }}>
                    <strong>Vacancies:</strong>{" "}
                    {selectedJob.vacancies || "Multiple"}
                  </p>
                </div>
              </div>
            </div>

            <div style={modalSectionStyle}>
              <h3>Description</h3>
              <p
                style={{
                  lineHeight: "1.6",
                  color: "#bbb",
                  whiteSpace: "pre-line",
                }}
              >
                {selectedJob.description || "No description available."}
              </p>
            </div>

            <div style={modalSectionStyle}>
              <h3>Requirements</h3>
              <ul style={{ paddingLeft: "20px", color: "#bbb" }}>
                {selectedJob.requirements ? (
                  selectedJob.requirements.split("\n").map((req, i) => (
                    <li key={i} style={{ margin: "8px 0" }}>
                      {req}
                    </li>
                  ))
                ) : (
                  <li>No specific requirements listed</li>
                )}
              </ul>
            </div>

            <div style={modalSectionStyle}>
              <h3>Eligibility Criteria</h3>
              <p style={{ margin: "8px 0", color: "#bbb" }}>
                <strong>Minimum CGPA:</strong>{" "}
                {selectedJob.eligibilityCriteria?.minCGPA || "N/A"}
              </p>
              <p style={{ margin: "8px 0", color: "#bbb" }}>
                <strong>Eligible Branches:</strong>{" "}
                {selectedJob.eligibilityCriteria?.branches?.join(", ") ||
                  "All Branches"}
              </p>
              <p style={{ margin: "8px 0", color: "#bbb" }}>
                <strong>Additional Requirements:</strong>{" "}
                {selectedJob.eligibilityCriteria?.additionalRequirements ||
                  "None"}
              </p>
            </div>

            <div style={{ marginTop: "30px", textAlign: "center" }}>
              {hasApplied(selectedJob._id) ? (
                <button
                  style={{
                    ...applyBtnStyle,
                    backgroundColor: "#4caf50",
                    padding: "12px 30px",
                    fontSize: "1.1rem",
                    cursor: "default",
                  }}
                  disabled
                >
                  Already Applied
                </button>
              ) : (
                <button
                  style={{
                    ...applyBtnStyle,
                    padding: "12px 30px",
                    fontSize: "1.1rem",
                  }}
                  onClick={() => {
                    handleApply(selectedJob._id);
                    closeModal();
                  }}
                  disabled={
                    applyingJobId === selectedJob._id && applyStatus.loading
                  }
                >
                  Apply for this Position
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
