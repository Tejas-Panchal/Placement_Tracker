import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useDashboard } from "../../context/DashboardContext";

// Styles
const pageStyle = {
  fontFamily: "Arial, sans-serif",
  color: "#e0e0e0",
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "20px",
};

const headerStyle = {
  fontSize: "2rem",
  marginBottom: "1.5rem",
  borderBottom: "1px solid #444",
  paddingBottom: "0.5rem",
};

const formContainerStyle = {
  backgroundColor: "#1e1e1e",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #444",
};

const sectionStyle = {
  marginBottom: "2rem",
};

const sectionTitleStyle = {
  fontSize: "1.2rem",
  marginBottom: "1rem",
  color: "#fff",
  fontWeight: "500",
};

const formGroupStyle = {
  marginBottom: "1.2rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontSize: "0.9rem",
  fontWeight: "500",
  color: "#bbb",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: "4px",
  color: "#e0e0e0",
  fontSize: "0.9rem",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const selectStyle = {
  ...inputStyle,
};

const rowStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "1.2rem",
};

const colStyle = {
  flex: 1,
};

const checkboxContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "10px",
  marginTop: "0.5rem",
};

const checkboxStyle = {
  marginRight: "8px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "flex-start",
  gap: "15px",
  marginTop: "2rem",
};

const buttonStyle = {
  padding: "12px 20px",
  fontSize: "0.9rem",
  fontWeight: "500",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#555",
};

const errorStyle = {
  color: "#ff6b6b",
  fontSize: "0.8rem",
  marginTop: "0.3rem",
};

const alertStyle = {
  padding: "12px 20px",
  marginBottom: "20px",
  borderRadius: "4px",
  fontSize: "0.9rem",
};

const successAlertStyle = {
  ...alertStyle,
  backgroundColor: "#4caf50",
  color: "white",
};

const errorAlertStyle = {
  ...alertStyle,
  backgroundColor: "#f44336",
  color: "white",
};

const selectionRoundStyle = {
  padding: "15px",
  marginBottom: "15px",
  border: "1px solid #444",
  borderRadius: "4px",
  backgroundColor: "#2a2a2a",
};

const PostJobPage = () => {
  const navigate = useNavigate();
  const { refetch: refetchDashboard } = useDashboard();
  
  // State for form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    positions: 1,
    eligibilityCriteria: {
      branches: [],
      minCGPA: 6.0,
      graduationYear: new Date().getFullYear() + 1,
      otherRequirements: "",
    },
    package: {
      baseSalary: 0,
      bonuses: 0,
      stockOptions: 0,
      benefits: "",
      totalCTC: 0,
    },
    applicationDeadline: "",
    selectionProcess: {
      rounds: [{ name: "", description: "" }],
    },
    isFeatured: false,
  });

  // State for form validation
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Available branches for eligibility criteria
  const branches = [
    "Computer Science",
    "Information Technology", 
    "Electronics",
    "Electrical",
    "Mechanical",
    "Civil",
    "Chemical",
    "Biotechnology",
    "Others"
  ];

  // Handle input change for simple fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox change for branches
  const handleBranchChange = (branch) => {
    const currentBranches = [...formData.eligibilityCriteria.branches];
    
    if (currentBranches.includes(branch)) {
      // Remove branch if already selected
      const updatedBranches = currentBranches.filter(b => b !== branch);
      setFormData({
        ...formData,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          branches: updatedBranches,
        }
      });
    } else {
      // Add branch if not selected
      setFormData({
        ...formData,
        eligibilityCriteria: {
          ...formData.eligibilityCriteria,
          branches: [...currentBranches, branch],
        }
      });
    }
  };

  // Handle nested fields change (for eligibilityCriteria and package)
  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      }
    });
  };

  // Add new selection round
  const addSelectionRound = () => {
    const updatedRounds = [
      ...formData.selectionProcess.rounds,
      { name: "", description: "" }
    ];
    
    setFormData({
      ...formData,
      selectionProcess: {
        ...formData.selectionProcess,
        rounds: updatedRounds
      }
    });
  };

  // Remove selection round
  const removeSelectionRound = (index) => {
    if (formData.selectionProcess.rounds.length === 1) {
      return; // Keep at least one round
    }
    
    const updatedRounds = formData.selectionProcess.rounds.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      selectionProcess: {
        ...formData.selectionProcess,
        rounds: updatedRounds
      }
    });
  };

  // Update selection round data
  const updateRound = (index, field, value) => {
    const updatedRounds = [...formData.selectionProcess.rounds];
    updatedRounds[index][field] = value;
    
    setFormData({
      ...formData,
      selectionProcess: {
        ...formData.selectionProcess,
        rounds: updatedRounds
      }
    });
  };

  // Calculate total CTC when any package component changes
  React.useEffect(() => {
    const { baseSalary, bonuses, stockOptions } = formData.package;
    const totalCTC = Number(baseSalary || 0) + Number(bonuses || 0) + Number(stockOptions || 0);
    
    handleNestedChange("package", "totalCTC", totalCTC);
  }, [formData.package.baseSalary, formData.package.bonuses, formData.package.stockOptions]);

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.positions <= 0) newErrors.positions = "Number of positions must be at least 1";
    
    // Package validation
    if (formData.package.totalCTC <= 0) {
      newErrors.totalCTC = "Total CTC must be greater than 0";
    }
    
    // Application deadline validation
    if (!formData.applicationDeadline) {
      newErrors.applicationDeadline = "Application deadline is required";
    } else {
      const deadlineDate = new Date(formData.applicationDeadline);
      const today = new Date();
      if (deadlineDate < today) {
        newErrors.applicationDeadline = "Application deadline cannot be in the past";
      }
    }
    
    // Selection process validation
    formData.selectionProcess.rounds.forEach((round, index) => {
      if (!round.name.trim()) {
        newErrors[`round_${index}_name`] = "Round name is required";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError("");
    
    try {
      // Send data to backend
      const response = await api.post("/api/company/jobs", formData);
      
      setSubmitSuccess(true);
      
      // Refresh dashboard data to update posted jobs count
      refetchDashboard();
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate("/company/manage-jobs");
      }, 2000);
    } catch (error) {
      console.error("Error creating job:", error);
      setSubmitError(
        error.response?.data?.msg || 
        "Failed to create job. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All your changes will be lost.")) {
      navigate("/company/manage-jobs");
    }
  };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Post a New Job</h1>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div style={successAlertStyle}>
          Job created successfully! Redirecting to manage jobs page...
        </div>
      )}
      
      {submitError && (
        <div style={errorAlertStyle}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={formContainerStyle}>
          {/* Basic Job Information */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Basic Job Information</h2>
            
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="title">Job Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Software Engineer, Data Scientist"
              />
              {errors.title && <div style={errorStyle}>{errors.title}</div>}
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="description">Job Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={textareaStyle}
                placeholder="Describe the job role, responsibilities, requirements, etc."
              />
              {errors.description && <div style={errorStyle}>{errors.description}</div>}
            </div>
            
            <div style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="location">Location*</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g., Bangalore, Remote"
                />
                {errors.location && <div style={errorStyle}>{errors.location}</div>}
              </div>
              
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="jobType">Job Type*</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="positions">Number of Positions*</label>
                <input
                  type="number"
                  id="positions"
                  name="positions"
                  value={formData.positions}
                  onChange={handleChange}
                  style={inputStyle}
                  min="1"
                />
                {errors.positions && <div style={errorStyle}>{errors.positions}</div>}
              </div>
            </div>
          </div>
          
          {/* Eligibility Criteria */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Eligibility Criteria</h2>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Eligible Branches</label>
              <div style={checkboxContainerStyle}>
                {branches.map((branch) => (
                  <div key={branch}>
                    <input
                      type="checkbox"
                      id={`branch-${branch}`}
                      checked={formData.eligibilityCriteria.branches.includes(branch)}
                      onChange={() => handleBranchChange(branch)}
                      style={checkboxStyle}
                    />
                    <label htmlFor={`branch-${branch}`}>{branch}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="minCGPA">Minimum CGPA</label>
                <input
                  type="number"
                  id="minCGPA"
                  value={formData.eligibilityCriteria.minCGPA}
                  onChange={(e) => 
                    handleNestedChange("eligibilityCriteria", "minCGPA", parseFloat(e.target.value))
                  }
                  style={inputStyle}
                  step="0.1"
                  min="0"
                  max="10"
                />
              </div>
              
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="graduationYear">Graduation Year</label>
                <input
                  type="number"
                  id="graduationYear"
                  value={formData.eligibilityCriteria.graduationYear}
                  onChange={(e) => 
                    handleNestedChange("eligibilityCriteria", "graduationYear", parseInt(e.target.value))
                  }
                  style={inputStyle}
                  min={new Date().getFullYear()}
                />
              </div>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="otherRequirements">Other Requirements</label>
              <textarea
                id="otherRequirements"
                value={formData.eligibilityCriteria.otherRequirements}
                onChange={(e) => 
                  handleNestedChange("eligibilityCriteria", "otherRequirements", e.target.value)
                }
                style={textareaStyle}
                placeholder="Any additional eligibility requirements"
              />
            </div>
          </div>
          
          {/* Package Details */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Package Details</h2>
            
            <div style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="baseSalary">Base Salary (LPA)*</label>
                <input
                  type="number"
                  id="baseSalary"
                  value={formData.package.baseSalary}
                  onChange={(e) => 
                    handleNestedChange("package", "baseSalary", parseFloat(e.target.value))
                  }
                  style={inputStyle}
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="bonuses">Bonuses (LPA)</label>
                <input
                  type="number"
                  id="bonuses"
                  value={formData.package.bonuses}
                  onChange={(e) => 
                    handleNestedChange("package", "bonuses", parseFloat(e.target.value))
                  }
                  style={inputStyle}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
            
            <div style={rowStyle}>
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="stockOptions">Stock Options (LPA equivalent)</label>
                <input
                  type="number"
                  id="stockOptions"
                  value={formData.package.stockOptions}
                  onChange={(e) => 
                    handleNestedChange("package", "stockOptions", parseFloat(e.target.value))
                  }
                  style={inputStyle}
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div style={colStyle}>
                <label style={labelStyle} htmlFor="totalCTC">Total CTC (LPA)</label>
                <input
                  type="number"
                  id="totalCTC"
                  value={formData.package.totalCTC.toFixed(2)}
                  readOnly
                  style={{...inputStyle, backgroundColor: "#333", cursor: "not-allowed"}}
                />
                {errors.totalCTC && <div style={errorStyle}>{errors.totalCTC}</div>}
              </div>
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="benefits">Benefits & Perks</label>
              <textarea
                id="benefits"
                value={formData.package.benefits}
                onChange={(e) => 
                  handleNestedChange("package", "benefits", e.target.value)
                }
                style={textareaStyle}
                placeholder="e.g., Health insurance, flexible work hours, free meals"
              />
            </div>
          </div>
          
          {/* Application & Selection Process */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Application & Selection Process</h2>
            
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="applicationDeadline">Application Deadline*</label>
              <input
                type="date"
                id="applicationDeadline"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                style={inputStyle}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.applicationDeadline && (
                <div style={errorStyle}>{errors.applicationDeadline}</div>
              )}
            </div>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Selection Rounds</label>
              
              {formData.selectionProcess.rounds.map((round, index) => (
                <div key={index} style={selectionRoundStyle}>
                  <div style={rowStyle}>
                    <div style={{...colStyle, flex: 3}}>
                      <label style={labelStyle} htmlFor={`roundName-${index}`}>
                        Round {index + 1} Name*
                      </label>
                      <input
                        type="text"
                        id={`roundName-${index}`}
                        value={round.name}
                        onChange={(e) => updateRound(index, "name", e.target.value)}
                        style={inputStyle}
                        placeholder="e.g., Technical Interview, HR Round"
                      />
                      {errors[`round_${index}_name`] && (
                        <div style={errorStyle}>{errors[`round_${index}_name`]}</div>
                      )}
                    </div>
                    
                    {index > 0 && (
                      <div style={{alignSelf: "flex-end", marginBottom: "1.2rem"}}>
                        <button
                          type="button"
                          onClick={() => removeSelectionRound(index)}
                          style={{...buttonStyle, backgroundColor: "#f44336"}}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div style={formGroupStyle}>
                    <label style={labelStyle} htmlFor={`roundDescription-${index}`}>
                      Round Description
                    </label>
                    <textarea
                      id={`roundDescription-${index}`}
                      value={round.description}
                      onChange={(e) => updateRound(index, "description", e.target.value)}
                      style={{...textareaStyle, minHeight: "80px"}}
                      placeholder="Describe what this round will include"
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addSelectionRound}
                style={{...buttonStyle, backgroundColor: "#4caf50", marginTop: "10px"}}
              >
                Add Selection Round
              </button>
            </div>
            
            <div style={formGroupStyle}>
              <div>
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  style={checkboxStyle}
                />
                <label htmlFor="isFeatured">
                  Feature this job (will appear at the top of job listings)
                </label>
              </div>
            </div>
          </div>
          
          {/* Form Submission */}
          <div style={buttonContainerStyle}>
            <button
              type="submit"
              style={buttonStyle}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Job"}
            </button>
            
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostJobPage;
