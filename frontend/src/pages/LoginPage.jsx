import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import '../components/AuthForm.css';

const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    if (error) {
      clearError();
    }
  }, [isAuthenticated, navigate, error, clearError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password, role }); 
  };

  return (
    <div className="auth-container">
      <div className="form-box">
        <h1>Login to Placement Tracker</h1>
        <form onSubmit={handleSubmit}>
          <div className="role-selector">
            <input type="radio" id="student" name="role" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="student">Student</label>
            <input type="radio" id="company" name="role" value="company" checked={role === 'company'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="company">Company</label>
            <input type="radio" id="tpo" name="role" value="tpo" checked={role === 'tpo'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="tpo">TPO</label>
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <div className="input-group">
            <input type="email" name="email" placeholder="Enter email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" name="password" placeholder="Enter password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>
        <p className="form-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;