// src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../config";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Reports = () => {
  const [allBusesData, setAllBusesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAllBusesReport = async () => {
    if (!fromDate || !toDate) {
      setError("Please select both from and to dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError("From date cannot be after to date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/all-buses-report?fromDate=${fromDate}&toDate=${toDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 200) {
        setAllBusesData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report");
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Set default dates (last 6 months)
  useEffect(() => {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    setToDate(today.toISOString().split('T')[0]);
    setFromDate(sixMonthsAgo.toISOString().split('T')[0]);
  }, []);

  // Prepare chart data
  const chartData = allBusesData ? {
    labels: allBusesData.monthlyIncomeData.map(item => item.monthName),
    datasets: [
      {
        label: 'Monthly Income (Rs.)',
        data: allBusesData.monthlyIncomeData.map(item => item.totalIncome),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income - All Buses Combined',
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Income: Rs. ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Rs. ' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="container-fluid px-4" style={{ paddingTop: "50px" }}>
      <h1 className="mt-4">Admin Bus Reports</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/admin-dashboard" className="text-decoration-none">
            Admin Dashboard
          </Link>
        </li>
        <li className="breadcrumb-item active">Bus Reports</li>
      </ol>

      {/* Date Range Filter */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="fas fa-filter me-2"></i>Report Period
          </h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold">
                <i className="fas fa-calendar-alt me-1"></i>From Date
              </label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">
                <i className="fas fa-calendar-alt me-1"></i>To Date
              </label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={fetchAllBusesReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <span className="fas fa-chart-bar me-2"></span>Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="alert alert-danger mt-3 mb-0">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Income Chart */}
      {allBusesData && (
        <>
          <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: "15px" }}>
            <div
              className="card-header text-white"
              style={{ background: "linear-gradient(90deg, #007bff, #0056b3)" }}
            >
              <h4 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>Monthly Income Overview
              </h4>
            </div>
            <div className="card-body bg-light p-4">
              <div style={{ height: "400px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
              
              {/* Summary Stats */}
              <div className="row mt-4 g-3">
                <div className="col-md-4">
                  <div className="p-3 bg-white rounded shadow-sm text-center">
                    <h6 className="text-muted mb-2">
                      <i className="fas fa-calendar-range me-2"></i>Period
                    </h6>
                    <h5>{allBusesData.fromDate} to {allBusesData.toDate}</h5>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-success bg-opacity-10 rounded shadow-sm text-center border border-success">
                    <h6 className="text-muted mb-2">
                      <i className="fas fa-dollar-sign me-2 text-success"></i>Total Income
                    </h6>
                    <h5 className="text-success fw-bold">
                      Rs. {allBusesData.totalIncome.toLocaleString()}
                    </h5>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-info bg-opacity-10 rounded shadow-sm text-center border border-info">
                    <h6 className="text-muted mb-2">
                      <i className="fas fa-road me-2 text-info"></i>Total Trips
                    </h6>
                    <h5 className="text-info fw-bold">{allBusesData.totalTrips}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bus-wise Income Table */}
          <div className="card shadow-lg border-0" style={{ borderRadius: "15px" }}>
            <div
              className="card-header text-white"
              style={{ background: "linear-gradient(90deg, #28a745, #1e7e34)" }}
            >
              <h4 className="mb-0">
                <i className="fas fa-bus me-2"></i>Income by Bus
              </h4>
            </div>
            <div className="card-body bg-light p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="py-3">Bus Number</th>
                      <th className="py-3">Model</th>
                      <th className="py-3">Driver</th>
                      <th className="py-3 text-center">Total Trips</th>
                      <th className="py-3 text-end">Total Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBusesData.busIncomeData.map((bus, index) => (
                      <tr key={bus.busId}>
                        <td className="px-4 py-3 fw-bold">{index + 1}</td>
                        <td className="py-3">
                          <i className="fas fa-bus me-2 text-primary"></i>
                          <strong>{bus.busNumber}</strong>
                        </td>
                        <td className="py-3">{bus.busModel}</td>
                        <td className="py-3">
                          <i className="fas fa-user me-2 text-secondary"></i>
                          {bus.driverName}
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-info">{bus.totalTrips}</span>
                        </td>
                        <td className="py-3 text-end">
                          <strong className="text-success">
                            Rs. {bus.totalIncome.toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-end fw-bold">TOTAL:</td>
                      <td className="py-3 text-center">
                        <span className="badge bg-primary fs-6">{allBusesData.totalTrips}</span>
                      </td>
                      <td className="py-3 text-end">
                        <strong className="text-success fs-5">
                          Rs. {allBusesData.totalIncome.toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="row mt-4 mb-5">
            <div className="col-12">
              <button 
                className="btn btn-outline-primary btn-lg"
                onClick={() => window.print()}
              >
                <i className="fas fa-print me-2"></i>Print Report
              </button>
            </div>
          </div>
        </>
      )}

      {/* No Data Message */}
      {!allBusesData && !loading && (
        <div className="card shadow-sm">
          <div className="card-body text-center py-5">
            <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No report generated yet</h5>
            <p className="text-muted">Select a date range and click "Generate Report" to view analytics</p>
          </div>
        </div>
      )}
    </div>
  );
};