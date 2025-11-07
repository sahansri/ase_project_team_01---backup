import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config';

export const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleColors = {
    ADMIN: 'bg-primary',
    DRIVER: 'bg-success',
    CONDUCTOR: 'bg-warning text-dark',
    'BUS OWNER': 'bg-info text-dark',
  };

  // Search users function
  const searchUsers = async (searchQuery = '', currentPage = 0, pageSize = 10) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/user/search-user', {
        params: {
          searchText: searchQuery,
          page: currentPage,
          size: pageSize
        }
      });

      if (response.data && response.data.code === 200) {
        const userData = response.data.data;
        console.log('API Response userData:', userData);
        
        // Handle your API structure with count and dataList
        if (userData && userData.dataList) {
          setUsers(userData.dataList || []);
          // Calculate total pages based on count and page size
          const totalCount = userData.count || 0;
          const calculatedTotalPages = Math.ceil(totalCount / pageSize);
          setTotalPages(calculatedTotalPages);
          console.log('Users set:', userData.dataList);
          console.log('Total count:', totalCount);
          console.log('Total pages:', calculatedTotalPages);
        } else {
          console.log('No dataList found in response:', userData);
          setUsers([]);
          setTotalPages(0);
        }
      } else {
        setError('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Error fetching users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    searchUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setPage(0); // Reset to first page when searching
    searchUsers(value, 0, size);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    searchUsers(searchText, newPage, size);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setSize(newSize);
    setPage(0);
    searchUsers(searchText, 0, newSize);
  };

  const handleDelete = async (id) => {
    try {
      // You can implement the delete API call here
      // await api.delete(`/user/delete-user/{id}`);
      const res = await api.delete(`/user/delete-user/${id}`);
      console.log('User deleted successfully:', res.data);
      // For now, just remove from local state and refresh the search
      setUsers((prev) => prev.filter(user => user.id !== id));
      setSelectedUser(null);
      
      // Optionally refresh the data from server
      searchUsers(searchText, page, size);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Handle edit user navigation
  const handleEditUser = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Manage Users</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><a href="/dashboard">Dashboard</a></li>
        <li className="breadcrumb-item active">Manage Users</li>
      </ol>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-users me-1"></i>
          Registered Users
        </div>

        <div className="card-body">
          {/* Search and Filter Section */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, mobile, or role..."
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={size} 
                onChange={handlePageSizeChange}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {!loading && Array.isArray(users) && users.map((user, index) => (
                  <tr key={user.id || index}>
                    <td className="align-middle">{page * size + index + 1}</td>
                    <td className="align-middle">{user.name || 'N/A'}</td>
                    <td className="align-middle">{user.username || 'N/A'}</td>
                    <td className="align-middle">{user.email || 'N/A'}</td>
                    <td className="align-middle">{user.mobile || 'N/A'}</td>
                    <td className="align-middle">
                      <span className={`badge ${roleColors[user.roles[0]] || 'bg-secondary'}`}>
                        {user.roles[0] ? user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td className="align-middle">
                      <button 
                        onClick={() => handleEditUser(user.id)}
                        className="btn btn-primary me-2"
                        title="Edit User"
                      >
                          <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-danger"
                        data-bs-toggle="modal"
                        data-bs-target={`#deleteUserModal${user.id}`}
                        onClick={() => setSelectedUser(user)}
                        title="Delete User"
                      >
                        <i className="fas fa-trash me-1"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && (!Array.isArray(users) || users.length === 0) && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {searchText ? 'No users found matching your search.' : 'No users found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && users.length > 0 && totalPages > 1 && (
            <nav aria-label="User pagination">
              <ul className="pagination justify-content-center mt-3">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${index === page ? 'active' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => handlePageChange(index)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Delete Modals outside the table */}
      {Array.isArray(users) && users.map(user => (
        <div
          key={user.id}
          className="modal fade"
          id={`deleteUserModal${user.id}`}
          tabIndex="-1"
          aria-labelledby={`deleteUserModalLabel${user.id}`}
          aria-hidden="true"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id={`deleteUserModalLabel${user.id}`}>Remove User</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
              </div>
              <div className="modal-body">
                Do you want to delete <strong>{user.name}</strong>?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
