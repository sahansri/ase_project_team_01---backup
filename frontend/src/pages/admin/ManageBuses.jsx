//ManageBuses.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config';

export const ManageBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, bus: null });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async (searchQuery = '', currentPage = 0, pageSize = 10) => {
    try {
      const response = await api.get('/buses/search', {
        params: {
          searchTerm: searchQuery,
          page: currentPage,
          size: pageSize
        }
      });
      
      // Handle different response structures
      if (response.data && response.data.code === 200) {
        const busData = response.data.data;
        
        if (busData && busData.dataList && Array.isArray(busData.dataList)) {
          setBuses(busData.dataList);
        } else if (Array.isArray(busData)) {
          setBuses(busData);
        } else {
          console.warn('Unexpected buses response structure:', busData);
          setBuses([]);
        }
      } else if (Array.isArray(response.data)) {
        setBuses(response.data);
      } else {
        console.warn('Unexpected response structure:', response.data);
        setBuses([]);
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError('Error fetching buses');
      setBuses([]); // Ensure buses is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (busId) => {
    try {
      await api.delete(`/buses/delete-bus/${busId}`);
      setBuses(buses.filter(bus => bus.id !== busId));
      setDeleteModal({ show: false, bus: null });
      alert('Bus deleted successfully!');
    } catch (err) {
      console.error('Error deleting bus:', err);
      alert('Error deleting bus');
    }
  };

  const openDeleteModal = (bus) => {
    setDeleteModal({ show: true, bus });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, bus: null });
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Manage Buses</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
        <li className="breadcrumb-item active">Manage Buses</li>
      </ol>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <Link to="/buses/add" className="btn btn-success">
          <i className="fas fa-plus me-1"></i>Add New Bus
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-bus me-1"></i>
          Buses Data
        </div>

        <div className="card-body table-responsive">
          <table className="table table-bordered table-hover table-striped">
            <thead>
              <tr>
                <th width="5%">#</th>
                <th width="15%">Bus Number</th>
                <th width="10%">Model</th>
                <th width="10%">Capacity</th>
                <th width="15%">Driver</th>
                <th width="20%">Action</th>
              </tr>
            </thead>

            <tbody>
              {!Array.isArray(buses) || buses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No buses found</td>
                </tr>
              ) : (
                buses.map((bus, index) => (
                  <tr key={bus.id || index}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle">{bus.busNumber || 'N/A'}</td>
                    <td className="align-middle">{bus.model || 'N/A'}</td>
                    <td className="align-middle">{bus.capacity || 'N/A'}</td>
                    <td className="align-middle">{bus.driverName || 'N/A'}</td>
                    <td className="align-middle">
                      <Link to={`/buses/edit/${bus.id}`} className="btn btn-primary me-2 mb-2">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button 
                        className="btn btn-danger mb-2" 
                        onClick={() => openDeleteModal(bus)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Remove Bus</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                Do you want to delete <strong>{deleteModal.bus?.busNumber}</strong>?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteModal.bus.id)}
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
