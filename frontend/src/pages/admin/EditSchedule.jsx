import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config';

export const EditSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    busId: '',
    busNumber: '',
    routeId: '',
    routeName: '',
    departureTime: '',
    arrivalTime: '',
    date: '',
    status: '',

  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Helper function to format time from array to HH:MM string for input fields
  const formatTimeForInput = (timeInput) => {
    if (!timeInput) return '';
    try {
      if (Array.isArray(timeInput) && timeInput.length >= 2) {
        const hours = timeInput[0].toString().padStart(2, '0');
        const minutes = timeInput[1].toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (typeof timeInput === 'string') {
        // If it's already a string like "14:30", return as is
        return timeInput;
      }
      return '';
    } catch {
      return '';
    }
  };

  // Helper function to format date for input field
  const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  try {
    // Handle array format like [2023, 12, 1]
    if (Array.isArray(dateInput) && dateInput.length >= 3) {
      const year = dateInput[0];
      const month = dateInput[1].toString().padStart(2, '0');
      const day = dateInput[2].toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // Handle string dates
    else if (typeof dateInput === 'string') {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }
      // Otherwise, parse and format
      const date = new Date(dateInput);
      return date.toISOString().split('T')[0];
    }
    return '';
  } catch {
    return dateInput || '';
  }
};

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await api.get(`/schedule/getone/${id}`);
      console.log('Fetched schedule data:', response.data);
      
      let scheduleData;
      if (response.data && response.data.code === 200) {
        scheduleData = response.data.data;
      } else {
        scheduleData = response.data;
      }
      
      // Format the data properly for form inputs
      const formattedData = {
        busId: scheduleData.busId || scheduleData.bus || '',
        routeId: scheduleData.routeId || scheduleData.route || '',
        departureTime: formatTimeForInput(scheduleData.departureTime),
        arrivalTime: formatTimeForInput(scheduleData.arrivalTime),
        date: scheduleData.date,
        status: scheduleData.status || ''
      };
      
      setFormData(formattedData);
      console.log('Formatted form data:', formattedData);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Error fetching schedule details');
    }
  }, [id]);

  const fetchBuses = useCallback(async () => {
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
        } else {
          console.log('No data found in response:', busesData);
          setBuses([]);
        }
      } else {
        setError('Failed to fetch buses');
        setBuses([]);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
      setError('Error fetching buses: ' + error.message);
      setBuses([]);
    }
  }, []);

  const fetchRoutes = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSchedule();
    fetchBuses();
    fetchRoutes();
  }, [fetchSchedule, fetchBuses, fetchRoutes]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response2 = await api.put(`/schedule/update/${id}`, formData);
      console.log('Update response:', response2.data);
      alert('Schedule updated successfully!');
      navigate('/schedule/manage'); // Adjust path to your ManageSchedule page
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Edit Schedule</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item"><a href="/schedule/manage">Manage Schedule</a></li>
        <li className="breadcrumb-item active">Edit Schedule</li>
      </ol>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-4">Edit Schedule</h5>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} >
            <div className="mb-3">
              <label className="form-label">Bus</label>
              <select
                name="busId"
                className="form-select"
                value={formData.busId}
                onChange={handleChange}
                required
              >
                <option value="">Select Bus</option>
                {buses && buses.length > 0 && buses.map((bus) => (
                  <option key={bus._id || bus.id} value={bus._id || bus.id}>
                    {bus.busNumber || bus.number || `Bus ${bus._id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Route</label>
              <select
                name="routeId"
                className="form-select"
                value={formData.routeId}
                onChange={handleChange}
                required
              >
                <option value="">Select Route</option>
                {routes && routes.length > 0 && routes.map((route) => (
                  <option key={route._id || route.id} value={route._id || route.id}>
                    {route.routeName || route.name || `${route.startLocation} - ${route.endLocation}` || `Route ${route._id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Departure Time</label>
              <input
                type="time"
                name="departureTime"
                className="form-control"
                value={formData.departureTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Arrival Time</label>
              <input
                type="time"
                name="arrivalTime"
                className="form-control"
                value={formData.arrivalTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                name="date"
                className="form-control" 
                value={formatDateForInput(formData.date)}
                onChange={handleChange}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                'Update Schedule'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
