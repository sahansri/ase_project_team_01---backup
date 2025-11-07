import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import api from '../../config'

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

// Get current date and time for comparison
const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: [now.getFullYear(), now.getMonth() + 1, now.getDate()],
    time: [now.getHours(), now.getMinutes()]
  };
};

// Compare schedule datetime with current datetime
const isScheduleUpcoming = (scheduleDate, scheduleTime) => {
  const current = getCurrentDateTime();
  
  // Compare dates first
  const currentDateStr = `${current.date[0]}-${current.date[1].toString().padStart(2, '0')}-${current.date[2].toString().padStart(2, '0')}`;
  const scheduleDateStr = formatDate(scheduleDate);
  
  if (scheduleDateStr > currentDateStr) {
    return true; // Future date
  } else if (scheduleDateStr === currentDateStr) {
    // Same date, compare times
    const currentTimeMinutes = current.time[0] * 60 + current.time[1];
    const scheduleTimeMinutes = scheduleTime[0] * 60 + scheduleTime[1];
    return scheduleTimeMinutes > currentTimeMinutes;
  }
  return false; // Past date/time
};

export const DriverDashboard = () => {
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [nextSchedule, setNextSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const fetchUpcomingSchedules = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await api.get("/schedule/driver/upcoming", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched upcoming schedules:", response.data);
        const schedules = response.data || [];
        setUpcomingSchedules(schedules);
        
        // Find the next schedule (closest to current time)
        if (schedules.length > 0) {
          const sortedSchedules = schedules
            .filter(schedule => isScheduleUpcoming(schedule.date, schedule.departureTime))
            .sort((a, b) => {
              const aDateTime = new Date(formatDate(a.date) + 'T' + formatTime(a.departureTime));
              const bDateTime = new Date(formatDate(b.date) + 'T' + formatTime(b.departureTime));
              return aDateTime - bDateTime;
            });
          
          setNextSchedule(sortedSchedules[0] || null);
        }
        
      } catch (error) {
        console.error("Error fetching upcoming schedules:", error);
        setError("Failed to load schedules");
        setUpcomingSchedules([]);
        setNextSchedule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingSchedules();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchUpcomingSchedules, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
          <h1 className="mt-4">Driver Dashboard</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item active">Driver Dashboard</li>
          </ol>

          <div className="alert alert-info alert-dismissible fade show fs-5" role="alert">
            Welcome <strong>{username}</strong>!
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>

          <div className="row">
            {/* Upcoming Schedules Count */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-primary text-white mb-4">
                <div className="card-body">
                  <h1>{loading ? '...' : upcomingSchedules.length}</h1>
                  <h6>Upcoming Schedules</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/driver/schedule">View Details</Link>
                  <div className="small text-white"><span className="fas fa-angle-right"></span></div>
                </div>
              </div>
            </div>

            {/* Next Schedule */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success text-white mb-4">
                <div className="card-body">
                  <h5>Next Schedule</h5>
                  {loading ? (
                    <p className="mb-0">Loading...</p>
                  ) : nextSchedule ? (
                    <div>
                      <medium className="d-block">{nextSchedule.routeName || 'N/A'}</medium>
                      <medium className="d-block">{formatDate(nextSchedule.date)} at {formatTime(nextSchedule.departureTime)}</medium>
                    </div>
                  ) : (
                    <medium>No upcoming schedules</medium>
                  )}
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/driver-dashboard/schedule">View Schedule</Link>
                  <div className="small text-white"><span className="fas fa-angle-right"></span></div>
                </div>
              </div>
            </div>

            {/* Trip History */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-warning text-white mb-4">
                <div className="card-body">
                  <h1>-</h1>
                  <h6>Trip History</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/driver-dashboard/trip-history">View History</Link>
                  <div className="small text-white"><span className="fas fa-angle-right"></span></div>
                </div>
              </div>
            </div>

            {/* Bus Information */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-danger text-white mb-4">
                <div className="card-body">
                  <h1>-</h1>
                  <h6>Bus Information</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/driver-dashboard/bus-info">View Details</Link>
                  <div className="small text-white"><span className="fas fa-angle-right"></span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <strong>Notice:</strong> {error}
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          {/* Next Schedule Details */}
          {!loading && nextSchedule && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0"><span className="fas fa-clock"></span> Next Upcoming Schedule</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <strong>Route:</strong>
                        <p>{nextSchedule.routeName || 'N/A'}</p>
                      </div>
                      <div className="col-md-3">
                        <strong>Date:</strong>
                        <p>{formatDate(nextSchedule.date)}</p>
                      </div>
                      <div className="col-md-3">
                        <strong>Departure Time:</strong>
                        <p>{formatTime(nextSchedule.departureTime)}</p>
                      </div>
                      <div className="col-md-3">
                        <strong>Bus:</strong>
                        <p>{nextSchedule.busNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <strong>From:</strong>
                        <p>{nextSchedule.route?.startLocation || 'N/A'}</p>
                      </div>
                      <div className="col-md-6">
                        <strong>To:</strong>
                        <p>{nextSchedule.route?.endLocation || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
  )
}
