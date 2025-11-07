//AddBus.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../config';

export const AddBus = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    busNumber: '',
    capacity: '',
    model: '',
    driverId: ''
  });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async (searchQuery = 'DRIVER', currentPage = 0, pageSize = 10) => {
    try {
      setError('');
      
      const driversResponse = await api.get('/user/search-user', {
        params: {
          searchText: searchQuery,
          page: currentPage,
          size: pageSize
        }
      });

      if (driversResponse.data && driversResponse.data.code === 200) {
        const userData = driversResponse.data.data;
        console.log('API Response userData:', userData);
        
        // Handle your API structure with count and dataList
        if (userData && userData.dataList) {
          setDrivers(userData.dataList || []);
          console.log('Drivers set:', userData.dataList);
        } else {
          console.log('No dataList found in response:', userData);
          setDrivers([]);
        }
      } else {
        setError('Failed to fetch drivers');
        setDrivers([]);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Error fetching drivers. Please try again.');
      setDrivers([]);
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
      const token = localStorage.getItem('token');
      const res = await api.post('/buses/create-bus', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Bus added successfully:', res.data);
      alert('Bus added successfully!');
      navigate('/buses/manage');
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Add Buses</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Add Buses</li>
      </ol>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Bus'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
