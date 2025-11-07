import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../config";

export const Profile = () => {
      const [user, setUser] = useState(null);
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(true);

      useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    api
      .get("/user/find-user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.data) {
          setUser(res.data.data);
        } else {
          setError("No user data found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load user data.");
      })
      .finally(() => setLoading(false));
}, []);

    if (loading) {
      return <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>Loading...</div>;
    }

    if (error) {
      return <div className="container-fluid px-4" style={{ paddingTop: '50px', color: 'red' }}>{error}</div>;
    }

  return (

        <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
          <h1 className="mt-4">Profile</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">Profile</li>
          </ol>

          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-table me-1"></i>
              Profile Data
            </div>
            <div className="card-body">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>User Name</th>
                    <td>{user.username}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Full Name</th>
                    <td>{user.name}</td>
                  </tr>
                  <tr>
                    <th>Phone Number</th>
                    <td>{user.mobile}</td>
                  </tr>
                  <tr>
                    <th>Role</th>
                    <td>
                      <span className="badge bg-success">{user.roles.join(", ")}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Link className="btn btn-primary shadow-none" to="/profile/edit">Edit</Link>
        </div>
  );
};
