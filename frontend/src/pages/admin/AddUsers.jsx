import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config.js';

export const AddUsers = () => {
  const [formData, setFormData] = useState({
    roles: '',
    name: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate form data
    if (!formData.roles || !formData.name || !formData.username || !formData.email || !formData.mobile || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate username format (alphanumeric and underscore only, 3-20 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
      return;
    }

    // Validate mobile number (basic validation)
    if (formData.mobile.length < 10) {
      setError('Please enter a valid mobile number (at least 10 digits)');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const userData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        roles: [formData.roles]
      };

      const res = await axios.post("/user/create-user", userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('User created successfully:', res.data);
      setSuccess('User added successfully!');
      
      // Reset form
      setFormData({
        roles: '',
        name: '',
        username: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
      });
      
      // Optionally redirect after success
      setTimeout(() => navigate('/users/manage'), 2000);
      
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Error: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        console.log('No response received:', error.request);
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Add Users</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Add Users</li>
      </ol>

      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select 
                name="roles"
                value={formData.roles}
                onChange={handleInputChange}
                className="form-select" 
                required
              >
                <option value="">Select Role</option>
                <option value="DRIVER">DRIVER</option>
                <option value="CONDUCTOR">CONDUCTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Enter full name"  
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Enter email" 
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Mobile No</label>
              <input 
                type="text" 
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Enter mobile no" 
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Enter username"  
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Enter password" 
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Confirm password" 
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding User...
                </>
              ) : (
                'Add User'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
