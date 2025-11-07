import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../config';

export const AddSchedule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    date: '',
    status: 'upcoming',
  });
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, []);

  const formatDateForInput = (dateInput) => {
    if (!dateInput) return '';
    try {
      const date = new Date(dateInput);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateInput;
    }
  };

  const fetchBuses = async () => {
    try {
      setError('');
      //Changed get-all-buses api to get-available-buses api
      //to filter available buses Oshan (10/17)
      const busesResponse = await api.get('/buses/get-available-buses');

      if (busesResponse.status === 200 && busesResponse.data) {
        const busesData = busesResponse.data;
        
        
        if(busesData) {
          console.log('Buses data:', busesData);
          setBuses(busesData || []);
        }else{
          console.log('No data found in response:', busesData);
          setBuses([]);
        }
      } else {
        setError('Failed to fetch buses');
        setBuses([]);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  const fetchRoutes = async () => {
    try {
      setError('');
      const routesResponse = await api.get('/routes/get-all-routes');

      if (routesResponse.data && routesResponse.status === 200) {
        // Access the nested data structure
        const routesData = routesResponse.data;
        console.log('Routes data extracted:', routesData);

        if (routesData && Array.isArray(routesData)) {
          setRoutes(routesData);
          console.log('Routes set successfully:', routesData);
        } else if (Array.isArray(routesData)) {
          setRoutes(routesData);
          console.log('Routes set as direct array:', routesData);
        } else {
          console.log('No valid dataList found in routes response:', routesData);
          setRoutes([]);
        }
      } else {
        console.log('Routes API response code not 200 or no data');
        setError('Failed to fetch routes');
        setRoutes([]);
      }

    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Error fetching routes: ' + error.message);
      setRoutes([]);
    }
  }
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError('');

      const response = await api.post('/schedule/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Add Schedule response:', response.data);  
      if (response.data && (response.status === 200 || response.status === 201)) {
        alert('Schedule added successfully!');
        navigate('/schedule/manage');
      } else {
        setError('Failed to add schedule');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      setError('Error adding schedule: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Add Schedule</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Add Schedule</li>
      </ol>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">Bus</label>
              <select 
                className="form-select" 
                name='busId'
                value={formData.busId}
                onChange={handleChange}
                required>
                <option value="">Select Bus</option>
                {Array.isArray(buses) && buses.length > 0 ? 
                buses.map(bus => (
                  <option key={bus._id || bus.id} value={bus._id || bus.id}>
                    {bus.busNumber}
                  </option>
                )) : (
                  <option disabled>No buses available</option>
                )}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Route</label>
              <select 
                className="form-select" 
                name='routeId'
                value={formData.routeId}
                onChange={handleChange}
                required
              >
                <option value="">Select Route</option>
                {Array.isArray(routes) && routes.length > 0 ? (
                  routes.map(route => (
                    <option key={route.id || route._id} value={route.id || route._id}>
                      {route.routeName || route.name || `Route ${route.id}`}
                    </option>
                  ))
                ) : (
                  <option disabled>No routes available</option>
                )}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Departure Time</label>
              <input 
                type="time" 
                className="form-control" 
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Arrival Time</label>
              <input 
                type="time" 
                className="form-control" 
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-control" 
                name="date"
                value={formatDateForInput(formData.date)}
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Schedule'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
