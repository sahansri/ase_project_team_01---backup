import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config.js';
import { locationService } from '../services/locationService.js';


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated and redirect them
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    
    if (token && roles.length > 0) {
      // User is already logged in, redirect to appropriate dashboard
      if (roles.includes("ADMIN")) {
        navigate("/dashboard", { replace: true });
      } else if (roles.includes("DRIVER")) {
        navigate("/driver-dashboard", { replace: true });
      }
    }
    
    // Prevent back navigation to login when authenticated
    const handlePopState = () => {
      const currentToken = localStorage.getItem("token");
      const currentRoles = JSON.parse(localStorage.getItem("roles") || "[]");
      
      if (currentToken && currentRoles.length > 0) {
        // User is authenticated, prevent going back to login
        if (currentRoles.includes("ADMIN")) {
          navigate("/dashboard", { replace: true });
        } else if (currentRoles.includes("DRIVER")) {
          navigate("/driver-dashboard", { replace: true });
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);


  const handleDriverLocationSetup = async () => {
    try {
      // Request location permission
      const location = await locationService.getCurrentLocation();
      console.log(location);
      // Send initial location to backend
      await locationService.updateDriverLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        status: 'online'
      });

      console.log('Driver location tracking started');
    } catch (error) {
      console.log(error);
      console.warn('Location access denied or unavailable:', error.message);
      // Continue with login even if location fails
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("roles", JSON.stringify(res.data.roles));
      localStorage.setItem("username", username);
      

      console.log("Login response ", res);

      const roles = res.data.roles;
      
      if (roles.includes("ADMIN")) {
        navigate("/dashboard");
      } else if (roles.includes("DRIVER")) {
        // Setup location tracking for drivers
        await handleDriverLocationSetup();
        navigate("/driver-dashboard");
      } else {
        navigate("/login"); 
      }
    } catch {
      setError("Invalid credentials...");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center"
      style={{
        background: 'linear-gradient(to bottom right, #0b0c2aff, #1e3c72, #000000)',
      }}
    >
      <div className="container flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="row justify-content-center w-100">
          <div className="col-lg-5">
            <div className="card shadow-lg border-0 rounded-lg mt-5" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-header text-center" style={{ 
                background: 'linear-gradient(135deg, #0b0c2a, #1e3c72)',
                color: 'white',
                borderRadius: '0.5rem 0.5rem 0 0'
              }}>
                <div className="mb-3">
                  <i className="fas fa-bus fa-2x mb-2"></i>
                </div>
                <h3 className="font-weight-light my-3 mb-0">DriveLine</h3>
                <small className="opacity-75">Bus Management System</small>
              </div>
              <div className="card-body p-4">
                <form>
                  <div className="form-floating mb-3">
                    <input 
                      className="form-control" 
                      id="inputUsername" 
                      type="text" 
                      placeholder="Enter your username" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)}
                      disabled={isLoading}
                      style={{
                        borderColor: '#dee2e6',
                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1e3c72';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(30, 60, 114, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#dee2e6';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <label htmlFor="inputUsername">
                      <i className="fas fa-user me-2 text-muted"></i>Username
                    </label>
                  </div>
                  <div className="form-floating mb-3">
                    <input 
                      className="form-control" 
                      id="inputPassword" 
                      type="password" 
                      placeholder="Enter your password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      disabled={isLoading}
                      style={{
                        borderColor: '#dee2e6',
                        transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1e3c72';
                        e.target.style.boxShadow = '0 0 0 0.2rem rgba(30, 60, 114, 0.25)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#dee2e6';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <label htmlFor="inputPassword">
                      <i className="fas fa-lock me-2 text-muted"></i>Password
                    </label>
                  </div>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}
                  <div className="form-check mb-4">
                    <input 
                      className="form-check-input" 
                      id="rememberPasswordCheck" 
                      type="checkbox"
                      style={{ accentColor: '#1e3c72' }}
                      disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="rememberPasswordCheck">
                      <i className="fas fa-clock me-2 text-muted"></i>Remember Password
                    </label>
                  </div>
                  <div className="d-grid mb-3">
                    <button 
                      className="btn btn-lg text-white fw-medium py-3" 
                      onClick={handleLogin}
                      disabled={isLoading}
                      style={{
                        background: isLoading ? '#6c757d' : 'linear-gradient(135deg, #0b0c2a, #1e3c72)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 15px rgba(30, 60, 114, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-center">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Contact administrator for account assistance
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width footer */}
      <footer className="bg-white py-4 mt-auto shadow-sm" style={{
        borderTop: '1px solid #e9ecef'
      }}>
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center justify-content-between small">
            <div className="text-muted">
              <i className="fas fa-bus me-2" style={{ color: '#1e3c72' }}></i>
              Copyright &copy; DriveLine {new Date().getFullYear()}
            </div>
            <div className="d-flex gap-3">
              <a 
                href="#" 
                className="text-muted text-decoration-none"
                style={{ 
                  transition: 'color 0.2s ease',
                  color: '#6c757d'
                }}
                onMouseOver={(e) => e.target.style.color = '#1e3c72'}
                onMouseOut={(e) => e.target.style.color = '#6c757d'}
              >
                Privacy Policy
              </a>
              <span className="text-muted">&middot;</span>
              <a 
                href="#" 
                className="text-muted text-decoration-none"
                style={{ 
                  transition: 'color 0.2s ease',
                  color: '#6c757d'
                }}
                onMouseOver={(e) => e.target.style.color = '#1e3c72'}
                onMouseOut={(e) => e.target.style.color = '#6c757d'}
              >
                Terms &amp; Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
