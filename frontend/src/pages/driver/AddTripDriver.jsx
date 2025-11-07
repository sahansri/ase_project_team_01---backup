import React, { useState, useEffect } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import axios from '../../config.js';

export const AddTripDriver = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    scheduleId: '',
    date: '',
    actualDepartureTime: '',
    actualArrivalTime: '',
    passengerCount: '',
    income: ''
  });

  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const navigate = useNavigate();

  // Helper function to convert array date to string format
  const formatDateArrayToString = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) return '';
    const [year, month, day] = dateArray;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Helper function to convert string date to array format for backend
  const formatDateStringToArray = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return [parseInt(year), parseInt(month), parseInt(day)];
  };

  // Helper function to convert time array to string format
  const formatTimeArrayToString = (timeArray) => {
    if (!Array.isArray(timeArray) || timeArray.length < 2) return '';
    const [hour, minute] = timeArray;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Helper function to convert string time to array format for backend
  const formatTimeStringToArray = (timeString) => {
    if (!timeString) return null;
    const [hour, minute] = timeString.split(':');
    return [parseInt(hour), parseInt(minute)];
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!id) return;
      
      setLoadingSchedule(true);
      try {
        const response = await axios.get(`/schedule/getone/${id}`);
        console.log('Fetched schedule:', response.data);
        if (response.data) {
          setSchedule(response.data);
          // Auto-set the scheduleId and convert date to proper format
          setFormData(prev => ({
            ...prev,
            scheduleId: response.data.id,
            date: formatDateArrayToString(response.data.date)
          }));
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to load schedule');
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [id]);

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

    if (!formData.scheduleId || !formData.date || !formData.actualDepartureTime || 
        !formData.actualArrivalTime || !formData.passengerCount || !formData.income) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.passengerCount <= 0) {
      setError('Passenger count must be greater than 0');
      return;
    }

    if (formData.income <= 0) {
      setError('Income must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const tripData = {
        scheduleId: formData.scheduleId,
        date: formData.date, // Convert back to array format
        actualDepartureTime: formData.actualDepartureTime, // Convert to array format
        actualArrivalTime: formData.actualArrivalTime, // Convert to array format
        passengerCount: formData.passengerCount,
        income: formData.income
      };

      console.log('Sending trip data:', tripData); // Debug log

      const res = await axios.post("/trip/save", tripData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Trip added successfully:', res.data);
      setSuccess('Trip added successfully!');

      setFormData({
        scheduleId: '',
        date: '',
        actualDepartureTime: '',
        actualArrivalTime: '',
        passengerCount: '',
        income: ''
      });

      setTimeout(() => navigate('/driver-dashboard/trip-history'), 2000);

    } catch (error) {
      console.error('Error adding trip:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Failed to add trip');
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Add Trip</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Add Trip</li>
      </ol>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="alert">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Schedule</label>

              {loadingSchedule ? (
                <div className="form-control d-flex align-items-center">
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Loading schedule...
                </div>
              ) : schedule ? (
                <div className="card bg-light border-0">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Schedule ID:</strong> {schedule.id || 'N/A'}</p>
                        <p><strong>Route:</strong> {schedule.routeName || 'N/A'}</p>
                        <p><strong>Bus:</strong> {schedule.busNumber || schedule.bus?.busNumber || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Date:</strong> {formatDateArrayToString(schedule.date) || 'N/A'}</p>
                        <p><strong>Scheduled Departure:</strong> {formatTimeArrayToString(schedule.departureTime) || 'N/A'}</p>
                        <p><strong>Scheduled Arrival:</strong> {formatTimeArrayToString(schedule.arrivalTime) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-control text-danger">
                  Schedule not found
                </div>
              )}

              <input type="hidden" name="scheduleId" value={formData.scheduleId} />
            </div>

            <div className="mb-3">
              <label className="form-label">Date</label>
              <input  type="date" name="date" value={formData.date} onChange={handleInputChange} className="form-control" required/>
            </div>

            <div className="mb-3">
              <label className="form-label">Actual Departure Time</label>
              <input  type="time" name="actualDepartureTime" value={formData.actualDepartureTime} onChange={handleInputChange} className="form-control" required/>
            </div>

            <div className="mb-3">
              <label className="form-label">Actual Arrival Time</label>
              <input  type="time" name="actualArrivalTime" value={formData.actualArrivalTime} onChange={handleInputChange} className="form-control" required/>
            </div>

            <div className="mb-3">
              <label className="form-label">Total Passengers</label>
              <input  type="number" name="passengerCount" value={formData.passengerCount} onChange={handleInputChange} className="form-control" placeholder="Enter passenger count" required/>
            </div>

            <div className="mb-3">
              <label className="form-label">Income</label>
              <input  type="number" step="0.01" name="income" value={formData.income} onChange={handleInputChange} className="form-control" placeholder="Enter income" required/>
            </div>

            <button  type="submit"  className="btn btn-primary" disabled={loading || loadingSchedule || !schedule}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding Trip...
                </>
              ) : (
                'Add Trip'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};