import React, { useEffect, useState, useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import api from "../config";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import dayjs from "dayjs";

const NotificationsList = () => {
  const { notifications, addNotifications, markAllAsRead } = useContext(NotificationContext);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const fetchAllNotifications = async () => {
    try {
      const response = await api.get(`/notifications/user/${username}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (Array.isArray(response.data)) {
        addNotifications(response.data); // Update global context
      }
    } catch (err) {
      console.error("Error fetching all notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

   const formatDate = (date) => {
  if (!date) return "Invalid date";

  // If it's an array like [2025, 10, 25, 19, 58, 11, 932000000]
  if (Array.isArray(date)) {
    const [year, month, day, hour, minute, second] = date;
    const jsDate = new Date(year, month - 1, day, hour, minute, second);
    return dayjs(jsDate).format("YYYY-MM-DD HH:mm:ss");
  }

  // If it's already an ISO string
  if (typeof date === "string") {
    const jsDate = new Date(date);
    return dayjs(jsDate).isValid()
      ? dayjs(jsDate).format("YYYY-MM-DD HH:mm:ss")
      : "Invalid date";
  }

  return "Invalid date";
};

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">All Notifications</h3>
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length > 0 ? (
        <div
          className="list-group shadow-sm"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            borderRadius: "10px",
          }}
        >
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${
                n.isRead ? "bg-light" : "bg-white"
              }`}
              style={{
                borderLeft: n.isRead
                  ? "5px solid transparent"
                  : "5px solid #0d6efd",
              }}
            >
              <div className="ms-2 me-auto">
                <div className="fw-bold">{n.title}</div>
                <div>{n.message}</div>
                <small className="text-muted">
                  <i className="far fa-clock me-1"></i>
                  {formatDate(n.createdAt)}
                </small>
              </div>
              {!n.isRead && (
                <span className="badge bg-primary rounded-pill">New</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted mt-5">
          <i className="far fa-bell-slash mb-3" style={{ fontSize: "3rem", opacity: 0.4 }}></i>
          <p>No notifications found</p>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link 
          to={
            JSON.parse(localStorage.getItem('roles') || '[]').includes('DRIVER') 
              ? '/driver-dashboard' 
              : '/dashboard'
          } 
          className="btn btn-secondary"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
};

export default NotificationsList;
