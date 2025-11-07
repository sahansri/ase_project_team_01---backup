import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "../../config.js";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744466.png", // Bus icon
  iconSize: [35, 35],
});

const onlineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744466.png", // Green bus for online
  iconSize: [35, 35],
  className: 'online-bus'
});

const offlineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744466.png", // Gray bus for offline
  iconSize: [35, 35],
  className: 'offline-bus'
});

export const LiveTracking = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch real driver locations from backend
  const fetchDriverLocations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/location/admin/driver-locations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      
      // Handle different response structures
      let driverData = [];
      if (response.data) {
        // Check if it's wrapped in an ApiResponse object
        if (response.data.data && Array.isArray(response.data.data)) {
          driverData = response.data.data;
        } else if (Array.isArray(response.data)) {
          driverData = response.data;
        }
      }
      console.log('Processed driver data:', driverData);

      // Transform backend response to match frontend expectations
      const formattedDrivers = driverData.map(driver => ({
        id: driver.id || driver.driverUsername,
        username: driver.driverUsername,
        busNumber: driver.busNumber || 'Not Assigned',
        route: 'Route not specified', // You can enhance this later
        latitude: driver.latitude,
        longitude: driver.longitude,
        lastUpdate: driver.updatedAt || driver.timestamp,
        status: driver.status,
        accuracy: driver.accuracy || 0
      }));
      
      setDrivers(formattedDrivers);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching driver locations:', err);
      setError('Failed to fetch driver locations');
      // Fallback to mock data for development
      setDrivers([
        {
          id: "D001",
          username: "john_driver",
          busNumber: "NB-1234",
          route: "Colombo - Galle",
          latitude: 6.9271,
          longitude: 79.8612,
          lastUpdate: new Date(),
          status: "online",
          accuracy: 15
        },
        {
          id: "D002",
          username: "mike_driver",
          busNumber: "NB-5678",
          route: "Matara - Colombo",
          latitude: 6.0535,
          longitude: 80.2210,
          lastUpdate: new Date(Date.now() - 300000), // 5 minutes ago
          status: "active",
          accuracy: 20
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverLocations();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchDriverLocations, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getDriverStatus = (status, lastUpdate) => {
    const now = new Date();
    const updateTime = new Date(lastUpdate);
    const minutesAgo = (now - updateTime) / (1000 * 60 * 60);
    console.log(minutesAgo);
    if (status === 'online' && minutesAgo < 7) {
      return { status: 'Online', class: 'text-success', icon: onlineIcon };
    } else if (status === 'Active' && minutesAgo < 10) {
      return { status: 'Active', class: 'text-primary', icon: busIcon };
    } else {
      return { status: 'Offline', class: 'text-secondary', icon: offlineIcon };
    }
  };

  const formatLastSeen = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mt-4">Live Driver Tracking</h1>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">Live Tracking</li>
          </ol>
        </div>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">
            {lastRefresh && `Last updated: ${lastRefresh.toLocaleTimeString()}`}
          </small>
          <button 
            className="btn btn-primary btn-sm"
            onClick={fetchDriverLocations}
            disabled={loading}
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin me-1"></i>
            ) : (
              <i className="fas fa-sync-alt me-1"></i>
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error} - Showing sample data for demonstration
        </div>
      )}

      <div className="row">
        {/* Map Section */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                Driver Locations Map
              </h5>
            </div>
            <div className="card-body p-0">
              {loading && (!Array.isArray(drivers) || drivers.length === 0) ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "500px" }}>
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
                    <p className="text-muted">Loading driver locations...</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={Array.isArray(drivers) && drivers.length > 0 ? [drivers[0].latitude, drivers[0].longitude] : [6.9271, 79.8612]}
                  zoom={8}
                  style={{ height: "500px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {Array.isArray(drivers) && drivers.map((driver) => {
                    const driverStatus = getDriverStatus(driver.status, driver.lastUpdate);
                    return (
                      <Marker
                        key={driver.id}
                        position={[driver.latitude, driver.longitude]}
                        icon={driverStatus.icon}
                      >
                        <Popup>
                          <div className="text-center">
                            <h6 className="mb-2">
                              <i className="fas fa-bus me-1"></i>
                              {driver.busNumber || 'No Bus Assigned'}
                            </h6>
                            <p className="mb-1">
                              <strong>Driver:</strong> {driver.username}
                            </p>
                            <p className="mb-1">
                              <strong>Route:</strong> {driver.route || 'No route assigned'}
                            </p>
                            <p className="mb-1">
                              <strong>Status:</strong> 
                              <span className={`ms-1 fw-bold ${driverStatus.class}`}>
                                {driverStatus.status}
                              </span>
                            </p>
                            <p className="mb-1">
                              <strong>Accuracy:</strong> ±{Math.round(driver.accuracy || 0)}m
                            </p>
                            <small className="text-muted">
                              Updated: {formatLastSeen(driver.lastUpdate)}
                            </small>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-users me-2 text-success"></i>
                Active Drivers ({Array.isArray(drivers) ? drivers.length : 0})
              </h5>
            </div>
            <div className="card-body">
              {!Array.isArray(drivers) || drivers.length === 0 ? (
                <div className="text-center py-4">
                  {/* <i className="fas fa-bus fa-3x text-muted mb-3"></i> */}
                  <p className="text-muted mb-0">No active drivers</p>
                  <small className="text-muted">Drivers will appear when they log in</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Driver</th>
                        <th>Status</th>
                        <th>Bus</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(drivers) && drivers.map((driver) => {
                        const driverStatus = getDriverStatus(driver.status, driver.lastUpdate);
                        return (
                          <tr key={driver.id}>
                            <td>
                              <div>
                                <div className="fw-medium">{driver.username}</div>
                                <small className="text-muted">
                                  {formatLastSeen(driver.lastUpdate)}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                driverStatus.status === 'Online' ? 'bg-success' :
                                driverStatus.status === 'Active' ? 'bg-primary' : 'bg-secondary'
                              }`}>
                                {driverStatus.status}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {driver.busNumber || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(
                                  `https://maps.google.com/?q=${driver.latitude},${driver.longitude}`, 
                                  '_blank'
                                )}
                                title="View on Google Maps"
                              >
                                <i className="fas fa-external-link-alt"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for map markers */}
      <style>{`
        .online-bus {
          filter: hue-rotate(120deg) saturate(1.5);
        }
        .offline-bus {
          filter: grayscale(100%) opacity(0.6);
        }
      `}</style>
    </div>
  );
};
