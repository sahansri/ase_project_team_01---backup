import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config';

export const ManageSchedule = () => {
  const [upcomingSchedules, setUpcomingSchedules] = useState([]); 
  const [ongoingSchedules, setOngoingSchedules] = useState([]); 
  const [completedSchedules, setCompletedSchedules] = useState([]); 
  const [reassignmentSchedules, setReassignmentSchedules] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, schedule: null });
  const [activeTab, setActiveTab] = useState('upcoming'); // Tab state

  // Normalize API responses to an array regardless of payload shape
  const extractList = (data) => {
    try {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.list)) return data.list;
      if (Array.isArray(data?.result)) return data.result;
      if (data && typeof data === 'object') {
        const firstArray = Object.values(data).find(Array.isArray);
        if (Array.isArray(firstArray)) return firstArray;
      }
      return [];
    } catch {
      return [];
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch {
      return dateString; // Return original if formatting fails
    }
  };

  // Format time function for array input
  const formatTime = (timeInput) => {
    if (!timeInput) return 'N/A';
    
    try {
      let timeString;
      
      // Handle array type input
      if (Array.isArray(timeInput)) {
        if (timeInput.length >= 2) {
          // Array format like [14, 30] or [14, 30, 0]
          const hours = timeInput[0];
          const minutes = timeInput[1];
          const period = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
          return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
        } else {
          return 'Invalid time format';
        }
      } else if (typeof timeInput === 'string') {
        timeString = timeInput;
        
        // Handle different string time formats
        if (timeString.includes('T')) {
          // ISO datetime format
          const date = new Date(timeString);
          return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
        } else if (timeString.includes(':')) {
          // Time format like "14:30" or "14:30:00"
          const [hours, minutes] = timeString.split(':');
          const hour24 = parseInt(hours);
          const minute = parseInt(minutes);
          const period = hour24 >= 12 ? 'PM' : 'AM';
          const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
          return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
        } else {
          return timeString;
        }
      } else {
        return String(timeInput);
      }
    } catch {
      return Array.isArray(timeInput) ? timeInput.join(':') : String(timeInput);
    }
  }; 

  // Function to render status as colored labels
  const renderStatusLabel = (status) => {
    if (!status) return <span className="badge bg-secondary">N/A</span>;
    
    const statusLower = status.toLowerCase();
    let badgeClass = 'badge ';
    let statusText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    switch (statusLower) {
      case 'active':
      case 'scheduled':
      case 'confirmed':
      case 'ongoing':
        badgeClass += 'bg-success';
        break;
      case 'cancelled':
      case 'canceled':
      case 'needs_reassignment':
        badgeClass += 'bg-danger';
        break;
      case 'delayed':
      case 'late':
        badgeClass += 'bg-warning text-dark';
        break;
      case 'completed':
      case 'finished':
        badgeClass += 'bg-info';
        break;
      case 'pending':
      case 'waiting':
        badgeClass += 'bg-warning text-dark';
        break;
      case 'in-progress':
      case 'running':
      case 'upcoming':
        badgeClass += 'bg-primary';
        break;
      default:
        badgeClass += 'bg-secondary';
        break;
    }
    
    return <span className={badgeClass}>{statusText}</span>;
  };

  // Fetch schedules on component mount
  useEffect(() => {
    const fetchAllSchedules = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming schedules
        const upcomingRes = await api.get('/schedule/status/upcoming', {
          params: { page: 0, size: 100 }
        });
  const upcoming = extractList(upcomingRes?.data);
  console.log('Fetched upcoming schedules (normalized):', upcoming);
  setUpcomingSchedules(upcoming);
        // Fetch ongoing schedules
        const ongoingRes = await api.get('/schedule/status/ongoing', {
          params: { page: 0, size: 100 }
        });
  const ongoing = extractList(ongoingRes?.data);
  console.log('Fetched ongoing schedules (normalized):', ongoing);
  setOngoingSchedules(ongoing);
        
        // Fetch completed schedules
        const completedRes = await api.get('/schedule/status/completed', {
          params: { page: 0, size: 100 }
        });
  const completed = extractList(completedRes?.data);
  console.log('Fetched completed schedules (normalized):', completed);
  setCompletedSchedules(completed);
        
        // Fetch needs reassignment schedules
        const reassignmentRes = await api.get('/schedule/status/needs_reassignment', {
          params: { page: 0, size: 100 }
        });
        const reassignment = extractList(reassignmentRes?.data);
        console.log('Fetched needs reassignment schedules (normalized):', reassignment);
        setReassignmentSchedules(reassignment);
        
      } catch (err) {
        console.error('Failed to fetch schedules:', err);
        setError('Failed to fetch schedules');
      } finally {
        setLoading(false);
      }
    };
    fetchAllSchedules();
  }, []);

  // Handle delete (only for upcoming and reassignment schedules)
  const handleDelete = async (scheduleId) => {
    try {
      await api.delete(`/schedule/delete/${scheduleId}`);
      // Remove from both upcoming and reassignment schedules
      setUpcomingSchedules(upcomingSchedules.filter((s) => s.id !== scheduleId));
      setReassignmentSchedules(reassignmentSchedules.filter((s) => s.id !== scheduleId));
      setDeleteModal({ show: false, schedule: null });
      alert('Schedule deleted successfully!');
    } catch {
      setError('Failed to delete schedule');
    }
  };

  const openDeleteModal = (schedule) => {
    setDeleteModal({ show: true, schedule });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, schedule: null });
  };



  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Manage Schedule</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Manage Schedule</li>
      </ol>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'reassignment' ? 'active' : ''}`}
            onClick={() => setActiveTab('reassignment')}
            type="button"
          >
            <i className="fas fa-exclamation-triangle me-2"></i>
            Needs Reassignment ({reassignmentSchedules.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
            type="button"
          >
            <i className="fas fa-clock me-2"></i>
            Upcoming Schedules ({upcomingSchedules.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
            type="button"
          >
            <i className="fas fa-play-circle me-2"></i>
            Ongoing Schedules ({ongoingSchedules.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
            type="button"
          >
            <i className="fas fa-check-circle me-2"></i>
            Completed Schedules ({completedSchedules.length})
          </button>
        </li>
      </ul>

      {/* Needs Reassignment Schedules Table */}
      {activeTab === 'reassignment' && (
        <div className="card mb-4 border-danger">
          <div className="card-header bg-danger text-white">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Needs Reassignment - Requires Immediate Action
          </div>
          <div className="card-body table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-danger">
                <tr>
                  <th width="5%">#</th>
                  <th width="15%">Bus Number</th>
                  <th width="25%">Route</th>
                  <th width="12%">Departure Time</th>
                  <th width="12%">Arrival Time</th>
                  <th width="13%">Date</th>
                  <th width="10%">Status</th>
                  <th width="13%">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 mb-0">Loading schedules...</p>
                    </td>
                  </tr>
                ) : reassignmentSchedules.length > 0 ? (
                  reassignmentSchedules.map((schedule, index) => (
                    <tr key={schedule.id} className="table-warning">
                      <td className="align-middle">{index + 1}</td>
                      <td className="align-middle">{schedule.busNumber || 'N/A'}</td>
                      <td className="align-middle">{schedule.routeName || 'N/A'}</td>
                      <td className="align-middle">{formatTime(schedule.departureTime)}</td>
                      <td className="align-middle">{formatTime(schedule.arrivalTime)}</td>
                      <td className="align-middle">{formatDate(schedule.date)}</td>
                      <td className="align-middle">{renderStatusLabel(schedule.status)}</td>
                      <td className="align-middle">
                        <Link 
                          to={`/schedule/edit/${schedule.id}`} 
                          className="btn btn-warning btn-sm me-2 mb-1"
                          title="Reassign Schedule"
                        >
                          <i className="fas fa-edit me-1"></i>Reassign
                        </Link>
                        <button
                          className="btn btn-danger btn-sm mb-1"
                          onClick={() => openDeleteModal(schedule)}
                          title="Delete Schedule"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <i className="fas fa-check-circle fa-2x text-success mb-2 d-block"></i>
                      <p className="mb-0 text-success"><strong>No schedules need reassignment</strong></p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Schedules Table */}
      {activeTab === 'upcoming' && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <i className="fas fa-clock me-2"></i>
            Upcoming Schedules
          </div>
          <div className="card-body table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="15%">Bus Number</th>
                  <th width="25%">Route</th>
                  <th width="12%">Departure Time</th>
                  <th width="12%">Arrival Time</th>
                  <th width="13%">Date</th>
                  <th width="10%">Status</th>
                  <th width="13%">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 mb-0">Loading schedules...</p>
                    </td>
                  </tr>
                ) : upcomingSchedules.length > 0 ? (
                  upcomingSchedules.map((schedule, index) => (
                    <tr key={schedule.id}>
                      <td className="align-middle">{index + 1}</td>
                      <td className="align-middle">{schedule.busNumber || 'N/A'}</td>
                      <td className="align-middle">{schedule.routeName || 'N/A'}</td>
                      <td className="align-middle">{formatTime(schedule.departureTime)}</td>
                      <td className="align-middle">{formatTime(schedule.arrivalTime)}</td>
                      <td className="align-middle">{formatDate(schedule.date)}</td>
                      <td className="align-middle">{renderStatusLabel(schedule.status)}</td>
                      <td className="align-middle">
                        <Link 
                          to={`/schedule/edit/${schedule.id}`} 
                          className="btn btn-primary btn-sm me-2 mb-1"
                          title="Edit Schedule"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="btn btn-danger btn-sm mb-1"
                          onClick={() => openDeleteModal(schedule)}
                          title="Delete Schedule"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <i className="fas fa-calendar-times fa-2x text-muted mb-2 d-block"></i>
                      <p className="mb-0">No upcoming schedules found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ongoing Schedules Table */}
      {activeTab === 'ongoing' && (
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            <i className="fas fa-play-circle me-2"></i>
            Ongoing Schedules
          </div>
          <div className="card-body table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="15%">Bus Number</th>
                  <th width="30%">Route</th>
                  <th width="12%">Departure Time</th>
                  <th width="12%">Arrival Time</th>
                  <th width="13%">Date</th>
                  <th width="13%">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 mb-0">Loading schedules...</p>
                    </td>
                  </tr>
                ) : ongoingSchedules.length > 0 ? (
                  ongoingSchedules.map((schedule, index) => (
                    <tr key={schedule.id}>
                      <td className="align-middle">{index + 1}</td>
                      <td className="align-middle">{schedule.busNumber || 'N/A'}</td>
                      <td className="align-middle">{schedule.routeName || 'N/A'}</td>
                      <td className="align-middle">{formatTime(schedule.departureTime)}</td>
                      <td className="align-middle">{formatTime(schedule.arrivalTime)}</td>
                      <td className="align-middle">{formatDate(schedule.date)}</td>
                      <td className="align-middle">{renderStatusLabel(schedule.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <i className="fas fa-calendar-times fa-2x text-muted mb-2 d-block"></i>
                      <p className="mb-0">No ongoing schedules found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Schedules Table */}
      {activeTab === 'completed' && (
        <div className="card mb-4">
          <div className="card-header bg-info text-white">
            <i className="fas fa-check-circle me-2"></i>
            Completed Schedules
          </div>
          <div className="card-body table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="15%">Bus Number</th>
                  <th width="30%">Route</th>
                  <th width="12%">Departure Time</th>
                  <th width="12%">Arrival Time</th>
                  <th width="13%">Date</th>
                  <th width="13%">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="spinner-border text-info" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 mb-0">Loading schedules...</p>
                    </td>
                  </tr>
                ) : completedSchedules.length > 0 ? (
                  completedSchedules.map((schedule, index) => (
                    <tr key={schedule.id}>
                      <td className="align-middle">{index + 1}</td>
                      <td className="align-middle">{schedule.busNumber || 'N/A'}</td>
                      <td className="align-middle">{schedule.routeName || 'N/A'}</td>
                      <td className="align-middle">{formatTime(schedule.departureTime)}</td>
                      <td className="align-middle">{formatTime(schedule.arrivalTime)}</td>
                      <td className="align-middle">{formatDate(schedule.date)}</td>
                      <td className="align-middle">{renderStatusLabel(schedule.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <i className="fas fa-calendar-times fa-2x text-muted mb-2 d-block"></i>
                      <p className="mb-0">No completed schedules found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remove Schedule</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                Do you want to delete the schedule for <strong>{deleteModal.schedule?.busNumber}</strong> on <strong>{formatDate(deleteModal.schedule?.date)}</strong>?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteModal.schedule.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

