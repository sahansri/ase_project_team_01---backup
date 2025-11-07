import React, { use, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../config.js';

export const EditUsers = () => {
  const { userId } = useParams(); // This will get the ID from the URL
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    roles: []
  });

  const[passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Use the userId to fetch user details and populate the form
  useEffect(() => {
    // Fetch user data using the userId
    const fetchUserById = async (id) => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/user/find-user/${id}`);
        console.log('User data received:', response.data);
        
        if (response.data && response.data.code === 200) {
          const userData = response.data.data;
          setFormData({
            name: userData.name || '',
            username: userData.username || '',
            email: userData.email || '',
            mobile: userData.mobile || '',
            roles: userData.roles || [],
          });
           // Keep passwordData untouched (password fields should stay empty)
          setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
         });
        } else {
          setError('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Error fetching user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserById(userId);
    }
  }, [userId]);

            // Handle form input changes
            const handleInputChange = (e) => {
              const { name, value } = e.target;
              setFormData(prev => ({
                ...prev,
                [name]: value
              }));
            };
            //Password update handler
            const handlePasswordUpdate = async (e) => {
            e.preventDefault();

            if (passwordData.newPassword !== passwordData.confirmPassword) {
              setError('Passwords do not match');
              return;
            }

            try {
              const token = localStorage.getItem('token');
              setUpdating(true);
              setError('');

              const response = await axios.put(`/user/change-password/${userId}`, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
              }, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.data.code === 200 || response.data.code === 201) {
                alert('Password updated successfully!');
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
              } else {
                setError('Failed to update password');
              }
            } catch (err) {
              console.error('Error updating password:',err);
              setError('Error updating password. Please try again.');
            } finally {
              setUpdating(false);
            }
          };

            // Handle form submission
            const handleSubmit = async (e) => {
              e.preventDefault();

              if (formData.password && formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
              }
              
              try {
                const token = localStorage.getItem('token');
                setUpdating(true);
                setError('');
                
                const updateData = {
                  name: formData.name,
                  username: formData.username,
                  email: formData.email,
                  mobile: formData.mobile,
                  roles: formData.roles
                };
                
                // Only include password if it's non-empty and not just spaces
                if (formData.password && formData.password.trim() !== '') {
                  updateData.password = formData.password;
                }

                const response = await axios.put(`/user/update-user/${userId}`, updateData, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log('Update response:', response.data);
                if (response.data && response.data.code === 201) {
                  alert('User updated successfully!');
                  navigate('/users/manage');
                } else {
                  setError('Failed to update user');
                }
              } catch (error) {
                console.error('Failed to update user:', error);
                setError('Error updating user. Please try again.');
              } finally {
                setUpdating(false);
              }
            };


            return (
              <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
                <h1 className="mt-4">Edit Users</h1>
                <ol className="breadcrumb mb-4">
                  <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
                  <li className="breadcrumb-item"><a href="/users/manage">Manage users</a></li>
                  <li className="breadcrumb-item active">Edit User</li>
                </ol>

                <div className="card">
                  <div className="card-body">
                    {/* Error Message */}
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    )}

                    {/* Loading Spinner */}
                    {loading ? (
                      <div className="text-center my-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading user data...</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Role</label>
                          <select 
                            className="form-select" 
                            name="roles"
                            value={formData.roles[0] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, roles: [e.target.value] }))}
                            required
                          >
                            <option value="">Select Role</option>
                            <option value="DRIVER">Driver</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </div>

              <div className="mb-3">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"  
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">User Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter full name"  
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email" 
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Mobile No</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile no" 
                  required
                />
              </div>

              
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/users/manage')}
                >
                  Cancel
                </button>
              </div>
            </form>
       )}
       <div className="container mt-4">
        <div className="alert alert-info alert-dismissible fade show" role="alert">
           Leave the password fields empty if you don't want to change your password.
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>   
        </div>
        <div className="card">
    <div className="card-body">
      <form onSubmit={handlePasswordUpdate}>
        <div className="mb-3">
          <label htmlFor="oldPassword" className="form-label">Old Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="oldPassword" 
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="newPassword" 
            name="newPassword"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
          />
        </div>
         <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="confirmPassword" 
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
          />
        </div>
       <button type="submit" className="btn btn-primary shadow-none me-2">
                Update Password
              </button>
              <button type="reset" className="btn btn-secondary shadow-none">
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
};
