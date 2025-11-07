import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from "../../config";

export default function Dashboard() {
  const username = localStorage.getItem("username");

  const [stats, setStats] = useState({});
  const [period, setPeriod] = useState("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem('token');

      const response = await api.get("/dashboard", {
        params: { period: selectedPeriod },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("Dashboard Data:", response.data);
        setStats(response.data);
      } else {
        setError("Failed to fetch dashboard stats");
        setStats({});
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Error fetching dashboard. Please try again.");
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(period);
  }, [period]);

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h1 className="mb-0">Dashboard</h1>
        <select
          className="form-select w-auto"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          disabled={loading}
        >
          <option value="today">Today</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
        </select>
      </div>

      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Dashboard</li>
      </ol>

      <div className="alert alert-info alert-dismissible fade show fs-5" role="alert">
        Welcome <strong>{username}</strong>!
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard data...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="row">
            {/* Total Buses */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-danger text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalBuses ?? 0}</h1>
                  <h6>Total Buses</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/buses/manage">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>

            {/* Total Drivers */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-warning text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalDrivers ?? 0}</h1>
                  <h6>Total Bus Drivers</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/users/manage">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>

            {/* Total Routes */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-primary text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalRoutes ?? 0}</h1>
                  <h6>Total Routes</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/routes/manage">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>

            {/* Total Schedules */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalSchedules ?? 0}</h1>
                  <h6>Total Schedules</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/schedule/manage">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Total Trips */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalTrips ?? 0}</h1>
                  <h6>Total Trips</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/trip/history">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>

            {/* Total Income */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-dark text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalIncome ?? 0} LKR</h1>
                  <h6>Total Income</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/trip/history">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>

            {/* Total Maintenance */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-secondary text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalMaintenanceCost ?? 0} LKR</h1>
                  <h6>Total Maintain Cost</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/maintain/manage">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>

            {/* Total Profit */}
            <div className="col-xl-3 col-md-6">
              <div className="card bg-info text-white mb-4">
                <div className="card-body">
                  <h1>{stats.totalProfit ?? 0} LKR</h1>
                  <h6>Total Profit</h6>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                  <Link className="small text-white stretched-link" to="/reports">View Details</Link>
                  <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}