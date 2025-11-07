import React, { useEffect, useState } from "react";
import axios from "../../config.js";
import { useNavigate } from "react-router-dom";

export const EditProfile = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    username: "",
    email: "",
    mobile: "",
    roles: []
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  // Fetch currently logged user details
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    axios
      .get("/user/find-user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.code === 200) {
          const userData = res.data.data;
          setFormData({
            id: userData.id || "",
            name: userData.name || "",
            username: userData.username || "",
            email: userData.email || "",
            mobile: userData.mobile || "",
            roles: userData.roles || [],
          });
        } else {
          setError("Failed to fetch profile data.");
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load user profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle profile field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Update profile info
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
      };

      const response = await axios.put(
        `/user/update-user/${formData.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 201 || response.data.code === 200) {
        alert("Profile updated successfully!");
        navigate("/profile");
      } else {
        setError("Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setUpdating(true);
      setError("");

      const response = await axios.put(
        `/user/change-password/${formData.id}`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 200 || response.data.code === 201) {
        alert("Password updated successfully!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError("Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setError("Old password does not match. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="container-fluid px-4">Loading...</div>;
  return (
        <div className="container-fluid px-4" style={{ paddingTop: '50px' }}>
          <h1 className="mt-4">Edit Profile</h1>
          <ol className="breadcrumb mb-4">
            <li className="breadcrumb-item">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">Edit Profile</li>
          </ol>

          <div className="card mb-4">
            <div className="card-header">
              <i className="fas fa-user-edit me-1"></i>
              Edit Your Information
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label className="form-label">Role</label><br />
                  <span className="badge bg-success">{formData.roles.join(", ")}</span>
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required />
                </div>

                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input type="tel"
                        className="form-control"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required />
                </div>


                <button
                  type="submit"
                  className="btn btn-primary shadow-none"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Password Section */}
            <div className="container mt-4">
              {/* Info alert */}
              <div className="alert alert-info alert-dismissible fade show" role="alert">
                Leave the password field empty if you don't want to change
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                ></button>
              </div>

              {/* Card and form */}
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handlePasswordUpdate}>
                    {/* Error message placeholder */}
                    <div id="error" className="text-danger fw-bold mb-2 small"></div>

                    <div className="mb-3">
                      <label htmlFor="oldpass" className="form-label">Old Password</label>
                      <input type="password"
                              className="form-control"
                              name="oldPassword"
                              value={passwordData.oldPassword}
                              onChange={handlePasswordChange} />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="pass" className="form-label">New Password</label>
                      <input type="password"
                            className="form-control"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="cpass" className="form-label">Confirm Password</label>
                      <input type="password"
                              className="form-control"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                      />
                    </div>

                    <button
                  type="submit"
                  className="btn btn-primary shadow-none me-2"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="reset"
                  className="btn btn-secondary shadow-none"
                >
                  Cancel
                </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};
