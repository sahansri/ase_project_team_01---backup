import React, { useEffect, useState } from 'react';
import { useNavigate , useParams, Link} from 'react-router-dom';
import api from '../../config';

export const DriverMaintenanceAdd = () => {
  const navigate = useNavigate();
  const { busNumber } = useParams();


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

  useEffect(() => {
  if (busNumber) {
    setFormData(prev => ({
      ...prev,
      busNumber: busNumber
    }));
  }
  }, [busNumber]);

 

  /*
  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get('/maintenance/add/bus-list', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      
      console.log("API Response:", response.data, Array.isArray(response.data));

      if (Array.isArray(response.data)) {
        setBuses(response.data);
       // console.log("set The buses using setBuses State!")
      } else {
        setError("Unexpected data format from server");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 204) {
          setBuses([]); // No content
        } else {
          setError(`Server Error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError("Network error: Unable to connect to backend server.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await api.post('/maintenance/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Record added successfully:", res.data);
      alert("Record added successfully!");
      navigate("/driver-dashboard/driverMaintenance");
    } catch (error) {
      setError(error.response?.data?.message || "Error adding Record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
      <h1 className="mt-4">Add Maintenance</h1>
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
        <li className="breadcrumb-item active">
          {`Add`}
        </li>
      </ol>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="alert alert-info">Loading...</div>}

          <form onSubmit={handleSubmit}>

            {/* Bus dropdown */}
            <div className="mb-3">
              <label className="form-label">Bus</label>
              <input
                type="text"
                className="form-control"
                value={busNumber}
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
              {loading ? "Saving..." : "Add Maintenance"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
