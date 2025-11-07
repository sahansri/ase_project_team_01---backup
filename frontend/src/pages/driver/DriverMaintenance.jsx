import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config';

export const DriverMaintenance = () => {
  const [logs, setLogs] = useState([]);
  const [busNumber,setBusNumber] = useState("Your bus");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    let result;
    try {
      setLoading(true);
      setError('');

      result = await api.get('maintenance/driver/get-logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(result.data)) {
        setLogs(result.data);
        if(result.data.length>0){
        setBusNumber(result.data[0].busNumber);
        console.log(busNumber);
        }
      } else {
        setError("Unexpected data format from server");
        console.error("Expected array but got:", typeof response.data, response.data);
      }

    } catch (err) {
      console.error("Error fetching logs:", err);

      if (err.response) {
        if (err.response.status === 204) {
          setLogs([]);
        } else if(result.data.length === 0){
            setError("No logs found");
        } else {
          setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError("Network error: Unable to connect to backend server. Make sure your Spring Boot app is running on port 5050.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCost = (cost) => {
    if (cost == null) return 'N/A';
    return `Rs. ${cost.toLocaleString()}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'in-progress':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const handleDelete = async (logId) => {
      if (window.confirm('Are you sure you want to delete this maintenance record?')) {
        try {
          await api.delete(`/maintenance/manage/delete/${logId}`);
          // Refresh the logs after deletion
          await fetchLogs();
        } catch (err) {
          console.error("Error deleting log:", err);
          setError("Error deleting maintenance record");
        }
      }
    };

  if (loading) {
    return (
      <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
        <div className="text-center mt-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading maintenance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">View Maintenance Records</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/driver-dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item">
          <Link to="/driver-dashboard/driverMaintenance">Maintenance</Link>
        </li>
        <li className="breadcrumb-item active">
          {`Records of ${busNumber}`}
        </li>
      </ol>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <i className="fas fa-bus me-1"></i>
            {`Records for bus ${busNumber}`}
          </div>
          <Link to={`/driver-dashboard/Maintenance/add/${busNumber}`} className="btn btn-success btn-sm">
            <i className="fas fa-plus me-1"></i>
            Add New
          </Link>
        </div>

        <div className="card-body">
          {logs.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-tools fa-3x text-muted mb-3"></i>
              <h5>No maintenance records found</h5>
              <p className="text-muted">Start by adding your first maintenance record.</p>
              <Link to={`/driver-dashboard/Maintenance/add/${busNumber}`} className="btn btn-primary">
                <i className="fas fa-plus me-1"></i>
                Add Maintenance Record
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Bus Number</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id || index}>
                      <td>{index + 1}</td>
                      <td>{log.busNumber || 'N/A'}</td>
                      <td><span className="badge bg-info">{log.maintenanceType || 'N/A'}</span></td>
                      <td>{formatDate(log.maintenanceDate)}</td>
                      <td>{formatCost(log.cost)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(log.maintenanceStatus)}`}>
                          {log.maintenanceStatus || 'Unknown'}
                        </span>
                      </td>
                      <td title={log.notes}>{log.notes || 'No notes'}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/driver-dashboard/Maintenance/edit/${log.id}`} className="btn btn-primary btn-sm" title="Edit">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(log.id)} title="Delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
