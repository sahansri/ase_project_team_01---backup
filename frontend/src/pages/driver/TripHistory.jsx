import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config";

export const TripHistory = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchTrips = async (searchQuery = "", currentPage = 0, pageSize = 10) => {
  try {
    setLoading(true);
    setError("");

    // ✅ Get token from localStorage (or wherever you saved it after login)
    const token = localStorage.getItem("token");

    const response = await api.get("/trip/getAllDriverTrips", {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Send JWT here
      },
      params: {
        searchText: searchQuery,
        page: currentPage,
        size: pageSize,
      },
    });

    console.log("Trips API response:", response.data);

    if (response.data && response.data.code === 200) {
      const tripData = response.data.data;
      if (tripData && tripData.dataList) {
        setTrips(tripData.dataList || []);
        const totalCount = tripData.count || 0;
        setTotalPages(Math.ceil(totalCount / pageSize));
      } else {
        setTrips([]);
        setTotalPages(0);
      }
    } else {
      setError("Failed to fetch trips");
      setTrips([]);
    }
  } catch (error) {
    console.error("Error fetching trips:", error);
    setError("Error fetching trips. Please try again.");
    setTrips([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  searchTrips();
}, []);


  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setPage(0);
    searchTrips(value, 0, size);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    searchTrips(searchText, newPage, size);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setSize(newSize);
    setPage(0);
    searchTrips(searchText, 0, newSize);
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
      <h1 className="mt-4">Trip History</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/driver-dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Trip History</li>
      </ol>

      <div className="card mb-4">
        <div className="card-header">
          <i className="fas fa-bus me-1"></i>
          Trip Data
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input type="text" className="form-control" placeholder="Search trips..." value={searchText} onChange={handleSearchChange}/>
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={size} onChange={handlePageSizeChange}>
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-bordered table-hover table-striped">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Schedule</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Passengers</th>
                  <th>Income (LKR)</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  Array.isArray(trips) &&
                  trips.map((trip, index) => {
                    const rowNumber = page * size + index + 1;
                    return (
                      <tr key={trip.id}>
                        <td>{rowNumber}</td>
                        <td>{trip.scheduleNumber || "N/A"}</td>
                        <td>{trip.routeId || "N/A"}</td>
                        <td>{trip.date || "N/A"}</td>
                        <td>{trip.actualDepartureTime || "-"}</td>
                        <td>{trip.actualArrivalTime || "-"}</td>
                        <td>{trip.passengerCount || 0}</td>
                        <td>{trip.income || 0}</td>
                      </tr>
                    );
                  })}
                {!loading && (!Array.isArray(trips) || trips.length === 0) && (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      {searchText
                        ? "No trips found matching your search."
                        : "No trips found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && trips.length > 0 && totalPages > 1 && (
            <nav aria-label="Trip pagination">
              <ul className="pagination justify-content-center mt-3">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${index === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    page === totalPages - 1 ? "disabled" : ""
                  }`}
                >
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
    </div>
  );
};
