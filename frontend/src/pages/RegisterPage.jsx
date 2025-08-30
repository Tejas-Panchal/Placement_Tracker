import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/AuthForm.css'; 

const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  // State for fields that change based on role
  const [roleSpecificFields, setRoleSpecificFields] = useState({
    enrollmentNumber: '',
    branch: '',
    graduationYear: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    clearError();
  }, [isAuthenticated, navigate, clearError]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    if (newRole === 'student') {
      setRoleSpecificFields({ rollNumber: '', branch: '', graduationYear: '' });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setClientError('Passwords do not match');
      return;
    }
    setClientError('');

    const fullRegistrationData = {
      ...formData,
      ...roleSpecificFields,
      role,
    };
    
    register(fullRegistrationData);
  };
  
  const renderRoleSpecificFields = () => {
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
        <form onSubmit={handleSubmit}>
          <div className="role-selector">
            <input type="radio" id="student" name="role" value="student" checked={role === 'student'} onChange={handleRoleChange} />
            <label htmlFor="student">Student</label>
            <input type="radio" id="company" name="role" value="company" checked={role === 'company'} onChange={handleRoleChange} />
            <label htmlFor="company">Company</label>
            <input type="radio" id="tpo" name="role" value="tpo" checked={role === 'tpo'} onChange={handleRoleChange} />
            <label htmlFor="tpo">TPO</label>
          </div>

          {(error || clientError) && <p className="error-message">{error || clientError}</p>}
          
          <div className="input-group">
            <input type="text" name="name" placeholder="Enter full name" className="input-field" value={formData.name} onChange={onChange} required />
            <input type="email" name="email" placeholder="Enter email" className="input-field" value={formData.email} onChange={onChange} required />
            <input type="password" name="password" placeholder="Enter password" className="input-field" value={formData.password} onChange={onChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {renderRoleSpecificFields()}
          </div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="form-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;