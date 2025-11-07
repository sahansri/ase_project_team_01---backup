//EditBus.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config';

export const EditBus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    busNumber: '',
    capacity: '',
    model: '',
    driverId: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('useEffect triggered with id:', id);
    if (id) {
      fetchBus(id);
      fetchDrivers();
    } else {
      console.log('No id found in useParams');
    }
  }, [id]);

  const fetchBus = async (busId) => {
    try {
      console.log('Fetching bus with ID:', busId);
      setLoading(true);
      setError('');
      const response = await api.get(`/buses/get-bus/${busId}`);
      console.log('Bus API response:', response);
      console.log('Bus data received:', response.data);
      
      if (response.data && response.data.code === 200) {
        const busData = response.data.data;
        console.log('Bus data to set:', busData);
        setFormData({
          busNumber: busData.busNumber || '',
          capacity: busData.capacity || '',
          model: busData.model || '',
          driverId: busData.driverId || ''
        });
      } else if (response.data) {
        // Handle direct data response (without code wrapper)
        console.log('Direct response data:', response.data);
        setFormData({
          busNumber: response.data.busNumber || '',
          capacity: response.data.capacity || '',
          model: response.data.model || '',
          driverId: response.data.driverId || ''
        });
      } else {
        console.log('Unexpected response structure:', response);
        setError('Failed to fetch bus data');
      }
    } catch (err) {
      console.error('Failed to fetch bus:', err);
      console.error('Error details:', err.response?.data);
      setError('Error fetching bus data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      console.log('Fetching drivers...');
      const response = await api.get('/user/search-user', {
        params: {
          searchText: 'DRIVER',
          page: 0,
          size: 50
        }
      });

      console.log('Drivers API response:', response.data);

      if (response.data && response.data.code === 200) {
        const userData = response.data.data;
        if (userData && userData.dataList) {
          console.log('Drivers found:', userData.dataList);
          setDrivers(userData.dataList || []);
        } else {
          console.log('No dataList found in drivers response');
          setDrivers([]);
        }
      } else {
        console.log('Unexpected drivers response structure');
        setDrivers([]);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setDrivers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      
      const response = await api.put(`/buses/update-bus/${id}`, formData);
      
      if (response.data && (response.status === 200 || response.status === 201)) {
        alert('Bus updated successfully!');
        navigate('/buses/manage');
      } else {
        setError('Failed to update bus');
      }
    } catch (err) {
      console.error('Failed to update bus:', err);
      setError('Error updating bus. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Edit Bus</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item"><a href="/buses/manage">Manage Buses</a></li>
        <li className="breadcrumb-item active">Edit Bus</li>
      </ol>

      {error && <div className="alert alert-danger">{error}</div>}

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
              <p className="mt-2">Loading bus data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Bus Number</label>
                <input
                  type="text"
                  name="busNumber"
                  className="form-control"
                  placeholder="Enter bus number"
                  value={formData.busNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  className="form-control"
                  placeholder="Enter capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  className="form-control"
                  placeholder="Enter model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Driver</label>
                <select 
                  name="driverId"
                  className="form-select"
                  value={formData.driverId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Driver</option>
                  {Array.isArray(drivers) && drivers.length > 0 ? (
                    drivers.map(driver => (
                      <option key={driver.id || driver._id} value={driver.id || driver._id}>
                        {driver.name || driver.username || driver.fullName || 'Unknown Driver'}
                      </option>
                    ))
                  ) : (
                    <option disabled>No drivers available</option>
                  )}
                </select>
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
                    'Update Bus'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => navigate('/buses/manage')}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};