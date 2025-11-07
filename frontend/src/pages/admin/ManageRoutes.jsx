//ManageRoutes.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config';

export const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, route: null });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api('/routes/get-all-routes');
      setRoutes(response.data);
    } catch (error) {
      setError('Error fetching routes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId) => {
    try {
      await api.delete(`/routes/${routeId}`);
      setRoutes(routes.filter(route => route.id !== routeId));
      setDeleteModal({ show: false, route: null });
      alert('Route deleted successfully!');
    } catch (error) {
      alert('Error deleting route');
    }
  };

  const openDeleteModal = (route) => {
    setDeleteModal({ show: true, route });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, route: null });
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Manage Routes</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
        <li className="breadcrumb-item active">Manage Routes</li>
      </ol>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <Link to="/routes/add" className="btn btn-success">
          <i className="fas fa-plus me-1"></i>Add New Route
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-route me-1"></i>
          Routes Data
        </div>

        <div className="card-body table-responsive">
          <table className="table table-bordered table-hover table-striped">
            <thead>
              <tr>
                <th width="10%">#</th>
                <th width="25%">Route Name</th>
                <th width="20%">Starting Point</th>
                <th width="20%">Ending Point</th>
                <th width="10%">Distance (km)</th>
                <th width="15%">Action</th>
              </tr>
            </thead>

            <tbody>
              {routes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No routes found</td>
                </tr>
              ) : (
                routes.map((route, index) => (
                  <tr key={route.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle">{route.routeName}</td>
                    <td className="align-middle">{route.startingPoint}</td>
                    <td className="align-middle">{route.endingPoint}</td>
                    <td className="align-middle">{route.distance}</td>
                    <td className="align-middle">
                      <Link to={`/routes/edit/${route.id}`} className="btn btn-primary me-2 mb-2">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button 
                        className="btn btn-danger mb-2" 
                        onClick={() => openDeleteModal(route)}
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
                <h5 className="modal-title">Remove Route</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                Do you want to delete <strong>{deleteModal.route?.routeName}</strong>?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteModal.route.id)}
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