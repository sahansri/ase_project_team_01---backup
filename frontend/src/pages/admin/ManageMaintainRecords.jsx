import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import api from '../../config';


export const ManageMaintainRecords = () => {
  const {busNumber} = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');



  useEffect(() => {
    fetchLogs();
  }, [busNumber]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');

      console.log(busNumber);

      let response;
      
      if(busNumber){
        response = await api.get(`/maintenance/manage/viewRecords/${busNumber}`,{
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      }
      else{
          response = await api.get('/maintenance/manage/viewRecords', {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
        }
          console.log("API Response:", response.data, Array.isArray(response.data));
          
          if (Array.isArray(response.data)) {
            setLogs(response.data);
          } else {
            setError("Unexpected data format from server");
            console.error("Expected array but got:", typeof response.data, response.data);
          }
      
    } catch (err) {
        console.error("Error fetching logs:", err);
        
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 204) {
            // No Content - empty list
            setLogs([]);
          } else {
            setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          // Network error
          setError("Network error: Unable to connect to backend server. Make sure your Spring Boot app is running on port 5050.");
        } else {
          // Other error
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatCost = (cost) => {
    if (!cost && cost !== 0) return 'N/A';
    return `$${parseFloat(cost).toFixed(2)}`;
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-success';
      case 'pending':
      case 'in progress':
        return 'bg-warning';
      case 'cancelled':
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-info';
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
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item">
          <Link to="/maintain/manage">Manage Maintenance</Link> </li>
        <li className="breadcrumb-item active">
          {busNumber ? `Records of ${busNumber}` : "All records"}
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
            {busNumber ? `Records for bus ${busNumber}` : "All Records"}
          </div>
          <Link to="/maintain/add" className="btn btn-success btn-sm">
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
              <Link to="/maintain/add" className="btn btn-primary">
                <i className="fas fa-plus me-1"></i>
                Add Maintenance Record
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th width="5%">#</th>
                    <th width="10%">Bus Number</th>
                    <th width="15%">Type</th>
                    <th width="15%">Date</th>
                    <th width="10%">Cost</th>
                    <th width="10%">Status</th>
                    <th width="25%">Notes</th>
                    <th width="10%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id || index}>
                      <td className="align-middle">{index + 1}</td>
                      <td className="align-middle">{log.busNumber || 'N/A'}</td>
                      <td className="align-middle">
                        <span className="badge bg-info">
                          {log.maintenanceType || 'N/A'}
                        </span>
                      </td>
                      <td className="align-middle">
                        {formatDate(log.maintenanceDate)}
                      </td>
                      <td className="align-middle">
                        {formatCost(log.cost)}
                      </td>
                      <td className="align-middle">
                        <span className={`badge ${getStatusBadgeClass(log.maintenanceStatus)}`}>
                          {log.maintenanceStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="align-middle">
                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={log.notes}>
                          {log.notes || 'No notes'}
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="btn-group" role="group">
                          <Link 
                            to={`/maintain/edit/${log.id}`} 
                            className="btn btn-primary btn-sm"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(log.id)}
                            title="Delete"
                          >
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