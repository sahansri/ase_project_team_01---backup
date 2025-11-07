import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../config";

export const BusInfo = () => {
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusDetails();
  }, []);

  // Helper function to convert array date to JavaScript Date
  const convertArrayToDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return null;
    // dateArray format: [year, month, day, hour, minute, second, nanosecond]
    const [year, month, day, hour, minute, second] = dateArray;
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const username = localStorage.getItem("username");
      const token = localStorage.getItem('token');
      
      if (!username) {
        throw new Error("User not authenticated");
      }

      const response = await api.get(`/buses/driver/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("Bus Data:", response.data);
        
        // Convert date arrays to Date objects
        const busData = {
          ...response.data,
          createdAt: convertArrayToDate(response.data.createdAt),
          updatedAt: convertArrayToDate(response.data.updatedAt),
        };
        
        setBus(busData);
      } else {
        throw new Error("No data received");
      }
    } catch (err) {
      console.error("Error fetching bus details:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch bus details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
        <h1 className="mt-4">Bus Information</h1>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/driver-dashboard" className="text-decoration-none">
              Driver Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item active">Bus Info</li>
        </ol>
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading bus information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
        <h1 className="mt-4">Bus Information</h1>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/driver-dashboard" className="text-decoration-none">
              Driver Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item active">Bus Info</li>
        </ol>
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={fetchBusDetails}>
          <i className="fas fa-sync-alt me-2"></i>
          Retry
        </button>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
        <h1 className="mt-4">Bus Information</h1>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/driver-dashboard" className="text-decoration-none">
              Driver Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item active">Bus Info</li>
        </ol>
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          No bus assigned to your account.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
      <h1 className="mt-4">Bus Information</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/driver-dashboard" className="text-decoration-none">
            Driver Dashboard
          </Link>
        </li>
        <li className="breadcrumb-item active">Bus Info</li>
      </ol>

      <div
        className="card shadow-lg border-0"
        style={{
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <div
          className="card-header text-white d-flex align-items-center justify-content-between"
          style={{
            background: "linear-gradient(90deg, #007bff, #0056b3)",
          }}
        >
          <h4 className="mb-0">
            <i className="fas fa-bus me-2"></i> {bus.busNumber}
          </h4>
        </div>

        <div className="card-body bg-light">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-3 bg-white rounded shadow-sm h-100">
                <h6 className="text-muted mb-1">
                  <i className="fas fa-bus-alt me-2 text-primary"></i>Model
                </h6>
                <h5>{bus.model || 'N/A'}</h5>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-white rounded shadow-sm h-100">
                <h6 className="text-muted mb-1">
                  <i className="fas fa-chair me-2 text-primary"></i>Total Seats
                </h6>
                <h5>{bus.capacity || 'N/A'}</h5>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-white rounded shadow-sm h-100">
                <h6 className="text-muted mb-1">
                  <i className="fas fa-user-tie me-2 text-primary"></i>Driver
                </h6>
                <h5>{bus.driverName || "Not Assigned"}</h5>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-white rounded shadow-sm h-100">
                <h6 className="text-muted mb-1">
                  <i className="fas fa-calendar me-2 text-primary"></i>Last Updated
                </h6>
                <h5>{bus.updatedAt ? new Date(bus.updatedAt).toLocaleString() : 'N/A'}</h5>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-white rounded shadow-sm h-100">
                <h6 className="text-muted mb-1">
                  <i className="fas fa-calendar-plus me-2 text-primary"></i>Registered At
                </h6>
                <h5>{bus.createdAt ? new Date(bus.createdAt).toLocaleString() : 'N/A'}</h5>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-white rounded shadow-sm h-100">
                <h6 className="text-muted mb-1">
                  <i className="fas fa-calendar-check me-2 text-primary"></i>Current Status
                </h6>
                <span
                  className={`badge ${
                    bus.status?.toLowerCase() === 'available' || bus.status === null
                      ? 'bg-success'
                      : 'bg-danger'
                  }`}
                >
                  {bus.status ? bus.status.toUpperCase() : 'AVAILABLE'}
                </span>

                {/* Show paragraph only if unavailable */}
                {!(bus.status?.toLowerCase() === 'available' || bus.status === null) && (
                  <p className="mt-2 text-">Your bus is under maintenance</p>
                )}
              </div>
            </div>

          </div>

          <div className="mt-4">
            <button 
              className="btn btn-primary"
              onClick={fetchBusDetails}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};