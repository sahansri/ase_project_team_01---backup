import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import api from "../../config";

// AddTripModal Component
const AddTripModal = ({ show, onClose, schedule, updateScheduleStatus, setOngoingSchedules }) => {
  const [formData, setFormData] = useState({
    scheduleId: '',
    date: '',
    actualDepartureTime: '',
    actualArrivalTime: '',
    passengerCount: '',
    income: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to convert array date to string format
  const formatDateArrayToString = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) return '';
    const [year, month, day] = dateArray;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  // Helper function to convert time array to string format
  const formatTimeArrayToString = (timeArray) => {
    if (!Array.isArray(timeArray) || timeArray.length < 2) return '';
    const [hour, minute] = timeArray;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Update form data when schedule changes
  React.useEffect(() => {
    if (schedule) {
      setFormData(prev => ({
        ...prev,
        scheduleId: schedule.id,
        date: formatDateArrayToString(schedule.date)
      }));
    }
  }, [schedule]);

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
        date: formData.date,
        actualDepartureTime: formData.actualDepartureTime,
        actualArrivalTime: formData.actualArrivalTime,
        passengerCount: formData.passengerCount,
        income: formData.income
      };

      const res = await api.post("/trip/save", tripData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Trip added successfully:', res.data);
      
      // Update schedule status to completed and remove from ongoing schedules
      if (schedule && updateScheduleStatus && setOngoingSchedules) {
        await updateScheduleStatus(schedule, "completed");
        setOngoingSchedules(prev => 
          prev.filter(s => (s.id || s.scheduleId) !== (schedule.id || schedule.scheduleId))
        );
      }

      setSuccess('Trip added successfully!');

      // Reset form
      setFormData({
        scheduleId: '',
        date: '',
        actualDepartureTime: '',
        actualArrivalTime: '',
        passengerCount: '',
        income: ''
      });

      // Close modal after success
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1000);

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

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Trip</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && <div className="alert alert-success" role="alert">{success}</div>}

            {schedule && (
              <div className="card bg-light border-0 mb-3">
                <div className="card-body">
                  <h6 className="card-title">Schedule Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Schedule ID:</strong> {schedule.id || 'N/A'}</p>
                      <p><strong>Route:</strong> {schedule.route?.routeName || schedule.routeName || 'N/A'}</p>
                      <p><strong>Bus:</strong> {schedule.bus?.plateNumber || schedule.busNumber || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Date:</strong> {formatDateArrayToString(schedule.date) || 'N/A'}</p>
                      <p><strong>Scheduled Departure:</strong> {formatTimeArrayToString(schedule.departureTime) || 'N/A'}</p>
                      <p><strong>Scheduled Arrival:</strong> {formatTimeArrayToString(schedule.arrivalTime) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleInputChange} 
                      className="form-control" 
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Total Passengers</label>
                    <input 
                      type="number" 
                      name="passengerCount" 
                      value={formData.passengerCount} 
                      onChange={handleInputChange} 
                      className="form-control" 
                      placeholder="Enter passenger count" 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Actual Departure Time</label>
                    <input 
                      type="time" 
                      name="actualDepartureTime" 
                      value={formData.actualDepartureTime} 
                      onChange={handleInputChange} 
                      className="form-control" 
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Actual Arrival Time</label>
                    <input 
                      type="time" 
                      name="actualArrivalTime" 
                      value={formData.actualArrivalTime} 
                      onChange={handleInputChange} 
                      className="form-control" 
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Income</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="income" 
                  value={formData.income} 
                  onChange={handleInputChange} 
                  className="form-control" 
                  placeholder="Enter income" 
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding Trip...
                    </>
                  ) : (
                    'Add Trip'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Schedule = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [ongoingSchedules, setOngoingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedScheduleForTrip, setSelectedScheduleForTrip] = useState(null);

  // Helper function to format time from array [hour, minute] to string
  const formatTime = (timeArray) => {
    if (!Array.isArray(timeArray) || timeArray.length < 2) return "N/A";
    const [hour, minute] = timeArray;
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${formattedHour}:${formattedMinute} ${period}`;
  };

  // Helper function to format date from array [year, month, day] to string
  const formatDate = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 3) return "N/A";
    const [year, month, day] = dateArray;
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  };

  const updateScheduleStatus = async (schedule, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      // Prepare the complete schedule data
      const updateData = {
        busId: schedule.busId,
        routeId: schedule.routeId,
        departureTime: schedule.departureTime, // Keep original array format or convert if needed
        arrivalTime: schedule.arrivalTime,     // Keep original array format or convert if needed
        date: schedule.date,                   // Keep original array format or convert if needed
        status: newStatus
      };
      
      console.log("Updating schedule with data:", updateData);
      
      const response = await api.put(`/schedule/update/${schedule.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      console.log("Schedule updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  };

  // Add these handler functions after the updateScheduleStatus function
  const handleStartTrip = async (schedule) => {
    try {
      setLoading(true);
      
      // Update the complete schedule with new status
      await updateScheduleStatus(schedule, "ongoing");
      
      // Move schedule from upcoming to ongoing locally
      setUpcomingSchedules(prev => 
        prev.filter(s => (s.id || s.scheduleId) !== (schedule.id || schedule.scheduleId))
      );
      
      // Add to ongoing schedules with updated status
      const updatedSchedule = { ...schedule, status: "ongoing" };
      setOngoingSchedules(prev => [...prev, updatedSchedule]);
      
      // Close the selected card
      setSelectedCard(null);

      
    } catch (error) {
      console.error("Failed to start trip:", error);
      alert("Failed to start trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = (schedule) => {
    try {
      setLoading(true);

      // Close the selected card
      setSelectedCard(null);
       
      // Open Add Trip modal after ending the trip
      setSelectedScheduleForTrip(schedule);
      setShowTripModal(true);

    } catch (error) {
      console.error("Failed to end trip:", error);
      alert("Failed to end trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInService = async (schedule) => {
    // Enhanced confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to mark this bus as "In Service" for maintenance?\n\n` +
    `Bus: ${schedule.busNumber || 'N/A'}\n` +
    `Route: ${schedule.routeName || 'N/A'}\n` +
    `This will make the bus unavailable for future schedules.`
  );
  if (!confirmed) return;
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    await api.put(`/maintenance/manage/bus-status/${schedule.busId}`, 
      { status: "Unavailable" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    // Refresh the page after successful API call
    window.location.reload();
    
  } catch (error) {
    console.error("Failed to update service status:", error);
    alert("Failed to mark bus as in service. Please try again.");
  } finally {
    setLoading(false);
  }
  };



  const getUpComingSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/schedule/driver/upcoming", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Upcoming schedules:", response.data);
      setUpcomingSchedules(response.data || []);
    } catch (error) {
      console.error("Error fetching upcoming schedules:", error);
      setUpcomingSchedules([]);
    }
  };

  const getOngoingSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/schedule/driver/ongoing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Ongoing schedules:", response.data);
      setOngoingSchedules(response.data || []);
    } catch (error) {
      console.error("Error fetching ongoing schedules:", error);
      setOngoingSchedules([]);
    }
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      await Promise.all([getUpComingSchedules(), getOngoingSchedules()]);
      setLoading(false);
    };
    fetchSchedules();
  }, []);

  const handleCardClick = (id, type) => {
    const cardId = `${type}-${id}`;
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  // Render schedule cards
  const renderScheduleCards = (schedules, type, title, emptyMessage) => {
    return (
      <div className="mb-5">
        <div className="d-flex align-items-center mb-4">
          <h3 className="mb-0 me-3">{title}</h3>
          <div 
            className="badge fs-6 px-3 py-2"
            style={{
              backgroundColor: type === 'ongoing' ? '#28a745' : '#007bff',
              color: 'white'
            }}
          >
            {schedules.length} {type === 'ongoing' ? 'Active' : 'Scheduled'}
          </div>
        </div>
        
        {schedules.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-body text-center py-5">
                <i className={`fas ${type === 'ongoing' ? 'fa-clock' : 'fa-calendar-alt'} fa-3x text-muted mb-3`}></i>
                <h5 className="text-muted">{emptyMessage}</h5>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {schedules.map((schedule) => {
              const cardId = `${type}-${schedule.scheduleId || schedule.id}`;
              return (
                <div key={cardId} className="col-xl-3 col-md-6 mb-4">
                  <div
                    className={`card shadow-sm border-0 ${
                      selectedCard === cardId ? "border-primary shadow-lg" : ""
                    }`}
                    style={{
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      transform:
                        selectedCard === cardId ? "translateY(-4px)" : "translateY(0)",
                    }}
                    onClick={() => handleCardClick(schedule.scheduleId || schedule.id, type)}
                  >
                    <div
                      className="card-header text-white"
                      style={{
                        background: type === 'ongoing' 
                          ? "linear-gradient(90deg, #28a745, #20c997)"
                          : "linear-gradient(90deg, #007bff, #0056b3)",
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                      }}
                    >
                      <h6 className="mb-0">
                        <i className={`fas ${type === 'ongoing' ? 'fa-play-circle' : 'fa-route'} me-2`}></i>
                        {schedule.route?.routeName || schedule.routeName || "Route not specified"}
                      </h6>
                    </div>

                    <div className="card-body">
                      <p className="mb-2">
                        <strong>Date:</strong> {formatDate(schedule.date)}
                      </p>
                      <p className="mb-2">
                        <strong>Departure:</strong> {formatTime(schedule.departureTime)}
                      </p>
                      <p className="mb-2">
                        <strong>Arrival:</strong> {formatTime(schedule.arrivalTime)}
                      </p>
                      {schedule.bus && (
                        <p className="mb-2">
                          <strong>Bus:</strong> {schedule.bus.plateNumber || schedule.bus.busNumber || "N/A"}
                        </p>
                      )}

                      {/* Animated Button Section */}
                      <div
                        className="transition-buttons"
                        style={{
                          maxHeight: selectedCard === cardId ? "100px" : "0",
                          overflow: "hidden",
                          transition: "all 0.3s ease-in-out",
                        }}
                      >
                        {selectedCard === cardId && (
                          <div className="d-flex justify-content-center mt-3 flex-wrap gap-2">
                            {type === 'upcoming' ? (
                              <button 
                                className="btn btn-success btn-sm px-3"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  handleStartTrip(schedule);
                                }}
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Starting...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-play me-2"></i>
                                    Start Trip
                                  </>
                                )}
                              </button>
                            ) : (
                              <>
                                <button 
                                  className="btn btn-warning btn-sm px-3"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    handleInService(schedule);
                                  }}
                                  disabled={loading}
                                >
                                  <i className="fas fa-tools me-2"></i>
                                  In Service
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm px-3 text-white"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click
                                    handleEndTrip(schedule);
                                  }}
                                  disabled={loading}
                                >
                                  <i className="fas fa-stop me-2"></i>
                                  End Trip
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading your schedules...</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
      <h1 className="mt-4">Bus Schedule</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/driver-dashboard" className="text-decoration-none">
            Driver Dashboard
          </Link>
        </li>
        <li className="breadcrumb-item active">Schedule</li>
      </ol>

      {/* Ongoing Schedules Section */}
      {renderScheduleCards(
        ongoingSchedules,
        'ongoing',
        '🔄 Ongoing Schedules',
        'No ongoing trips at the moment'
      )}

      {/* Upcoming Schedules Section */}
      {renderScheduleCards(
        upcomingSchedules,
        'upcoming',
        '📅 Upcoming Schedules',
        'No upcoming schedules found'
      )}

      {/* Add Trip Modal */}
      <AddTripModal 
        show={showTripModal}
        onClose={() => {
          setShowTripModal(false);
          setSelectedScheduleForTrip(null);
        }}
        schedule={selectedScheduleForTrip}
        updateScheduleStatus={updateScheduleStatus}
        setOngoingSchedules={setOngoingSchedules}
      />
    </div>
  );
};
