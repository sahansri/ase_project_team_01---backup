import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from '../../config';

export const DriverMaintenanceEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // get log id from URL

  const [formData, setFormData] = useState({
    busNumber: "",
    maintenanceType: "",
    maintenanceDate: "",
    cost: "",
    maintenanceStatus: "",
    notes: ""
  });

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch bus list and existing record
  useEffect(() => {
    //fetchBuses();
    fetchMaintainLog();
  }, [id]);

  // Fetch bus numbers
  const fetchBuses = async () => {
    try {
      const res = await api.get('/maintenance/add/bus-list');
      if (Array.isArray(res.data)) {
        setBuses(res.data);
      }
    } catch (err) {
      console.error("Error fetching buses:", err);
    }
  };

  // Fetch log details by ID
  const fetchMaintainLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get(`/maintenance/manage/edit/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data);
       console.log("API Response:", res.data, Array.isArray(res.data));
    } catch (err) {
      setError("Failed to load maintenance record");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submit (update log)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await api.put(`/maintenance/manage/edit/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      alert("Record updated successfully!");
      navigate("/driver-dashboard/driverMaintenance");
    } catch (error) {
      setError(error.response?.data?.message || "Error updating record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
      <h1 className="mt-4">Edit Maintenance</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/driver-dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item">
          <Link to="/driver-dashboard/driverMaintenance">Maintenance</Link>
        </li>
        <li className="breadcrumb-item active">
          {`Records of ${formData.busNumber}`}
        </li>
        <li className="breadcrumb-item active">
          {`Edit`}
        </li>
      </ol>
      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="alert alert-info">Loading...</div>}

          <form onSubmit={handleSubmit}>
            {/* Bus */}
            <div className="mb-3">
              <label className="form-label">Bus</label>
              <input
                type="text"
                className="form-control"
                value={formData.busNumber}
                readOnly
                disabled
            />
            </div>

            {/* Maintain Type */}
            <div className="mb-3">
              <label className="form-label">Maintain Type</label>
              <select
                className="form-select"
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleChange}
                required
              >
                <option value="">Select Maintain Type</option>
                <option value="Service">Service</option>
                <option value="Repair">Repair</option>
                <option value="Tyre change">Tyre change</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="form-label">Maintenance Date</label>
              <input
                type="date"
                className="form-control"
                name="maintenanceDate"
                value={formData.maintenanceDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Cost */}
            <div className="mb-3">
              <label className="form-label">Cost (LKR)</label>
              <input
                type="number"
                className="form-control"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="maintenanceStatus"
                value={formData.maintenanceStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                style={{ resize: "none" }}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Update Maintenance"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
