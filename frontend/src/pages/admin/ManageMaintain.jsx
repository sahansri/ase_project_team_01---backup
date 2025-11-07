import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import api from '../../config';

export const ManageMaintain = () =>{
    const [buses,setBuses] = useState([]); 
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState('');

    useEffect(()=>{
        fetchBuses();
    },[]);


    const fetchBuses = async () =>{
        try{
            setLoading(true);
            setError('');

            const response = await api.get('/buses/get-all-buses',{
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if(Array.isArray(response.data)){
                setBuses(response.data);
                console.log(response.data);
            }
            else{
                setError('Unexpected Data Type from The Server!');
                console.error("Expected array but got:", typeof response.data, response.data);
            }
        }catch (err){
            console.error(`Error Fetching Buses: ${err}`);
        }finally{
            setLoading(false);
        }
    };

    const handleStatusChange = async (busId, currentStatus) => {
    const newStatus = currentStatus === "Unavailable" ? "Available" : "Unavailable";

    if (!window.confirm(`Are you sure you want to mark this bus as ${newStatus}?`)) {
      return;
    }

    try {
      await api.put(`/maintenance/manage/bus-status/${busId}`, { status: newStatus }); 
      // Adjust API endpoint to match your Spring Boot controller
      // Example backend: @PutMapping("/buses/status/{id}")
      
      // Refresh bus list after status update
      await fetchBuses();  
    } catch (err) {
      console.error("Error updating bus status:", err);
      setError("Failed to update bus status");
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

    const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary';
    
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-success';
      case 'unknown':
        return 'bg-warning';
      case 'unavailable':
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
          <p className="mt-2">Loading Buses...</p>
        </div>
      </div>
    );
    }

    return(
        <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
            <h1 className="mt-4">Manage  Bus Maintenance </h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item">
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Manage Maintenance</li>
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
                        Bus Status
                    </div>
                    <Link to="/maintain/viewRecords" className="btn btn-success btn-sm">
                        <i className="fas fa-eye me-1"></i>
                        View All Records
                    </Link>
                </div>
            </div>

            <div className="card-body">
                {buses.length === 0 ? (
                    <div className="text-center py-4">
                        <i className="fas fa-tools fa-3x text-muted mb-3"></i>
                        <h5>No buses found!</h5>
                        <p className="text-muted">Start by adding your first bus.</p>
                        <Link to="/buses/add" className="btn btn-primary">
                            <i className="fas fa-plus me-1"></i>
                            Add Buses
                        </Link>
                    </div>
                    ) : (
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover table-striped">
                            <thead className="table-dark">
                              <tr>
                                <th width="5%">#</th>
                                <th width="20%">Bus Number</th>
                                <th width="15%">Model</th>
                                <th width="20%">Last Service</th>
                                <th width="20%">Status</th>
                                <th width="20%">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {buses.map((bus, index) => (
                                <tr key={bus.id || index}>
                                  <td className="align-middle">{index + 1}</td>
                                  <td className="align-middle">{bus.busNumber || 'N/A'}</td>
                                  <td className="align-middle">{bus.model || 'N/A'}</td>
                                  <td className="align-middle">
                                    {formatDate(bus.lastService)}
                                  </td>
                                  <td className="align-middle">
                                    <span className={`badge ${getStatusBadgeClass(bus.status)}`}>
                                      {bus.status || 'Unknown'}
                                    </span>
                                  </td>
                                  <td className="align-middle">
                                    <div className="btn-group" role="group">
                                        {/* View Records button */}
                                        <Link 
                                        to={`/maintain/viewRecords/${bus.busNumber}`} 
                                        className="btn btn-info btn-sm"
                                        title="View Records"
                                        >
                                        <i className="fas fa-eye"></i>
                                        </Link>

                                        {/* Change Status button */}
                                        <button 
                                          className={`btn btn-${bus.status === "Unavailable" ? "secondary" : "warning"} btn-sm`}
                                          title="Change Status"
                                          onClick={() => handleStatusChange(bus.id, bus.status)}
                                        >
                                          <i className="fas fa-exchange-alt"></i>
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
    );
};