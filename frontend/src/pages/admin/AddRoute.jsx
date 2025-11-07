//AddRoute.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config';

export const AddRoute = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    routeName: '',
    startingPoint: '',
    endingPoint: '',
    distance: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/routes/create-route', formData,{
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API Response:', response);
      alert('Route added successfully!');
      navigate('/routes/manage');
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Add Routes</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Add Routes</li>
      </ol>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Route Name</label>
              <input 
                type="text" 
                name="routeName"
                className="form-control" 
                placeholder="Enter route name"
                value={formData.routeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Starting Point</label>
              <input 
                type="text" 
                name="startingPoint"
                className="form-control" 
                placeholder="Enter starting point"
                value={formData.startingPoint}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ending Point</label>
              <input 
                type="text" 
                name="endingPoint"
                className="form-control" 
                placeholder="Enter ending point"
                value={formData.endingPoint}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Route Distance (km)</label>
              <input 
                type="number" 
                name="distance"
                className="form-control" 
                placeholder="Enter distance"
                value={formData.distance}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Route'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
