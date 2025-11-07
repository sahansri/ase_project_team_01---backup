//EditRoute.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api  from '../../config';

export const EditRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    routeName: '',
    startingPoint: '',
    endingPoint: '',
    distance: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoute();
  }, [id]);

  const fetchRoute = async () => {
    try {
      const response = await api.get(`/routes/get-route/${id}`);
      setFormData(response.data);
    } catch (error) {
      setError('Error fetching route details');
    }
  };

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
      await api.put(`/routes/${id}`, formData);
      alert('Route updated successfully!');
      navigate('/routes/manage');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Edit Routes</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item"><a href="/routes/manage">Manage Routes</a></li>
        <li className="breadcrumb-item active">Edit Routes</li>
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
              <label className="form-label">Distance (km)</label>
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
              {loading ? 'Updating...' : 'Update Route'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
