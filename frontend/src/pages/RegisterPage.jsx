import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api'; // Import your central API instance
import '../components/AuthForm.css'; 

const RegisterPage = () => {
  // --- NEW: State to manage the registration step ---
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '', // Added OTP field to formData
  });
  
  const [roleSpecificFields, setRoleSpecificFields] = useState({
    enrollmentNumber: '',
    branch: '',
    graduationYear: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const { isAuthenticated, isLoading, error, clearError, register } = useAuth(); // register from context is for the final step
  const navigate = useNavigate();
  const [clientError, setClientError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    // Reset fields to match the selected role
    if (newRole === 'student') {
      setRoleSpecificFields({ enrollmentNumber: '', branch: '', graduationYear: '' });
    } else if (newRole === 'company') {
      setRoleSpecificFields({ hrName: '', contactNumber: '' });
    } else if (newRole === 'tpo') {
      setRoleSpecificFields({ instituteName: '', contactNumber: '' });
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const onRoleFieldChange = (e) => {
    setRoleSpecificFields({ ...roleSpecificFields, [e.target.name]: e.target.value });
  };

  // --- NEW: Function to handle the first step (sending OTP) ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setClientError('Passwords do not match');
      return;
    }
    setClientError('');
    setSuccessMessage('');

    // We can use the 'isLoading' from the auth context or create a new one.
    // Let's use the context one for simplicity.
    clearError(); // Clear previous server errors

    try {
        await api.post('/auth/send-otp', { email: formData.email });
        setSuccessMessage('OTP sent successfully to your email.');
        setStep('otp'); // Proceed to the next step
    } catch (err) {
        setClientError(err.response?.data?.msg || 'Failed to send OTP.');
    }
  };

  // --- UPDATED: handleSubmit is now for the final registration ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');
    
    const fullRegistrationData = {
      ...formData,
      ...roleSpecificFields,
      role,
    };
    
    register(fullRegistrationData); // Call the register function from AuthContext
  };
  
  const renderRoleSpecificFields = () => {
    // ... This function remains exactly the same, no changes needed ...
    switch (role) {
      case 'student':
        return (
          <>
            <input type="text" name="enrollmentNumber" placeholder="Enter roll number" className="input-field" value={roleSpecificFields.enrollmentNumber} onChange={onRoleFieldChange} required />
            <input type="text" name="branch" placeholder="Enter branch" className="input-field" value={roleSpecificFields.branch} onChange={onRoleFieldChange} required />
            <input type="number" name="graduationYear" placeholder="Enter graduation year" className="input-field" value={roleSpecificFields.graduationYear} onChange={onRoleFieldChange} required />
          </>
        );
      case 'company':
        return (
          <>
            <input type="text" name="hrName" placeholder="Enter HR name" className="input-field" value={roleSpecificFields.hrName} onChange={onRoleFieldChange} required />
            <input type="text" name="contactNumber" placeholder="Enter contact number" className="input-field" value={roleSpecificFields.contactNumber} onChange={onRoleFieldChange} required />
          </>
        );
      case 'tpo':
        return (
          <>
            <input type="text" name="instituteName" placeholder="Enter institute name" className="input-field" value={roleSpecificFields.instituteName} onChange={onRoleFieldChange} required />
            <input type="text" name="contactNumber" placeholder="Enter contact number" className="input-field" value={roleSpecificFields.contactNumber} onChange={onRoleFieldChange} required />
          </>
        );
      default:
        return null;
    }
  };


  return (
    <div className="auth-container">
      <div className="form-box">
        <h1>Create Your Account</h1>

        {/* Display all types of errors and success messages */}
        {(error || clientError) && <p className="error-message">{error || clientError}</p>}
        {successMessage && <p style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</p>}
        
        {step === 'details' ? (
          // --- FORM 1: User Details ---
          <form onSubmit={handleSendOtp}>
            <div className="role-selector">
                <input type="radio" id="student" name="role" value="student" checked={role === 'student'} onChange={handleRoleChange} />
                <label htmlFor="student">Student</label>
                <input type="radio" id="company" name="role" value="company" checked={role === 'company'} onChange={handleRoleChange} />
                <label htmlFor="company">Company</label>
                <input type="radio" id="tpo" name="role" value="tpo" checked={role === 'tpo'} onChange={handleRoleChange} />
                <label htmlFor="tpo">TPO</label>
            </div>
            
            <div className="input-group">
                <input type="text" name="name" placeholder="Enter full name" className="input-field" value={formData.name} onChange={onChange} required />
                <input type="email" name="email" placeholder="Enter email" className="input-field" value={formData.email} onChange={onChange} required />
                <input type="password" name="password" placeholder="Enter password" className="input-field" value={formData.password} onChange={onChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                {renderRoleSpecificFields()}
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Get Verification Code'}
            </button>
          </form>
        ) : (
          // --- FORM 2: OTP Verification ---
          <form onSubmit={handleSubmit}>
            <p style={{ marginBottom: '20px' }}>Enter the 6-digit code sent to <strong>{formData.email}</strong>.</p>
            <div className="input-group">
                <input 
                    type="text" 
                    name="otp" 
                    placeholder="Enter OTP" 
                    className="input-field" 
                    value={formData.otp} 
                    onChange={onChange} 
                    required 
                    maxLength="6"
                />
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button 
                type="button" 
                onClick={() => setStep('details')} 
                style={{ marginTop: '10px', background: 'none', border: '1px solid #555', color: '#aaa', width: '100%', padding: '10px', borderRadius: '4px', cursor: 'pointer'}}
            >
                Back
            </button>
          </form>
        )}
        
        <p className="form-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;