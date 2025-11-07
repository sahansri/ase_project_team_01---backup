import React, { useEffect, useState,useContext,useRef} from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { locationService } from '../services/locationService.js';
import axios from "../config.js";
import api from '../config';
import dayjs from "dayjs";

import { NotificationContext } from "../context/NotificationContext";

function DriverNavbar({ children }) {
  const location = useLocation();
  const currentPage = location.pathname;

  const username = localStorage.getItem('username');

  const [showTripDropdown, setShowTripDropdown] = useState(currentPage.startsWith("/driver-dashboard/trip-info"));
   const { notifications} = useContext(NotificationContext);
   const {addNotifications} = useContext(NotificationContext);
   const {unreadCount} = useContext(NotificationContext);
   const {markAllAsRead} = useContext(NotificationContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
  
  

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

  useEffect(() => {
    const sidebarToggle = document.getElementById("sidebarToggle");
    if (sidebarToggle) {
      const toggleSidebar = (e) => {
        e.preventDefault();
        document.body.classList.toggle("sb-sidenav-toggled");
        localStorage.setItem(
          "sb|sidebar-toggle",
          document.body.classList.contains("sb-sidenav-toggled")
        );
      };
      sidebarToggle.addEventListener("click", toggleSidebar);

      if (localStorage.getItem("sb|sidebar-toggle") === "true") {
        document.body.classList.add("sb-sidenav-toggled");
      }

      return () => sidebarToggle.removeEventListener("click", toggleSidebar);
    }
    
  }, []);
  useEffect(() => {
    handleDriverLocationSetup();
    const interval = setInterval(handleDriverLocationSetup, 30000);
    
    return () => clearInterval(interval);
  },[]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/location/driver/offline', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
    } catch (error) {
      console.log('Error setting driver offline:', error);
    }
    
    localStorage.clear();
    // Clear session and browser history
    window.history.replaceState(null, null, "/login");
    window.location.href = "/login";
  };

   useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [])

     useEffect(()=>{
        fetchUnreadNotifications();
      },[])
    

    const fetchUnreadNotifications = async()=>{
      console.log("Fetching notifications from: ")
    try{
        const response = await api.get(`/notifications/user/${username}/unread`,{
          headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
        });

        if(Array.isArray(response.data)){
         addNotifications(response.data);
         console.log(`Got unread Notifications: ${response}`);
        }
    }catch(err){
      console.log(`Error fetching unread notifications:${err}`)
    }
    
  };

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
    <>
      {/* TOP NAVBAR */}
      <nav className="sb-topnav navbar navbar-expand navbar-dark bg-primary fixed-top">
              <Link className="navbar-brand ps-3 fs-4" to="/driver-dashboard">
              <i className="fas fa-bus me-2" style={{ color: '#ffffffff' }}></i>DriveLine</Link>
              <button className="btn btn-link order-1 order-lg-0 me-4 me-lg-0 shadow-none" id="sidebarToggle">
                <i className="fas fa-bars"></i>
              </button>
      
              <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
                <div className="input-group"></div>
              </form>
      
              <span className="navbar-text text-white me-3">
                {new Date().toLocaleDateString('en-CA')}
              </span>
      
              <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">

                <li className="nav-item dropdown me-2" ref={dropdownRef}>
            <button
              onClick={() => {
                // Only mark as read when opening the dropdown
                if (!showDropdown) {
                  markAllAsRead();
                }
                setShowDropdown((prev) => !prev);
              }}
                //await fetchUnreadNotifications();
              
              
              className="btn btn-link nav-link position-relative p-2"
              style={{ 
                color: 'rgba(255, 255, 255, 0.85)',
                textDecoration: 'none',
                border: 'none'
              }}
            >
              <i className="fas fa-bell fa-fw" style={{ fontSize: '1.1rem' }}></i>
              {unreadCount > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
                >
                  {unreadCount}
                  <span className="visually-hidden">unread notifications</span>
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className="dropdown-menu dropdown-menu-end show shadow-lg" 
                style={{ 
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  right: 0,
                  left: 'auto',
                  marginTop: '0.5rem'
                }}
              >
                <div className="dropdown-header bg-light fw-bold border-bottom">
                  <i className="fas fa-bell me-2"></i>Notifications
                </div>

                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="dropdown-item-text border-bottom py-2 px-3"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="fw-semibold text-dark small">{n.title}</div>
                      <div className="text-muted small">{n.message}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        <i className="far fa-clock me-1"></i>
                        {formatDate(n.createdAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item-text text-center text-muted py-3">
                    <i className="far fa-bell-slash mb-2" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                    <div>No new notifications</div>
                  </div>
                )}

                <div className="dropdown-item-text text-center border-top py-2">
                <Link 
                  to={"/driver-dashboard/notification/see-all"} 
                  className="btn btn-link text-primary p-0"
                >
                    See previous notifications →
                </Link>
              </div> 
              </div>
            )}
          </li>



                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="fas fa-user fa-fw"></i>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" to="/driver-profile">Profile</Link></li>
                    <li><Link className="dropdown-item" to="/driver-profile/edit">Settings</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button type="button" className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

      {/* SIDEBAR + CONTENT */}
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <div className="sb-sidenav-menu-heading">Driver Panel</div>

                {/* Dashboard */}
                <Link
                  className={`nav-link ${currentPage === "/driver-dashboard" ? "active" : ""}`}
                  to="/driver-dashboard"
                >
                  <div className="sb-nav-link-icon"><i className="fa fa-tachometer-alt"></i></div>
                  Dashboard
                </Link>

                {/* Schedule (single link, no dropdown) */}
                <Link
                  className={`nav-link ${currentPage === "/driver-dashboard/schedule" ? "active" : ""}`}
                  to="/driver-dashboard/schedule"
                >
                  <div className="sb-nav-link-icon"><i className="fa fa-calendar-alt"></i></div>
                  Schedule
                </Link>       

                {/* Trip Info */}
                {/* <Link
                  className={`nav-link ${currentPage === "/driver-dashboard/trip-info" ? "active" : ""}`}
                  to="/driver-dashboard/trip-info"
                >
                  <div className="sb-nav-link-icon"><i className="fa fa-road"></i></div>
                  Trip Info
                </Link> */}

                {/* Trip History */}
                <Link
                  className={`nav-link ${currentPage === "/driver-dashboard/trip-history" ? "active" : ""}`}
                  to="/driver-dashboard/trip-history"
                >
                  <div className="sb-nav-link-icon"><i className="fa fa-route"></i></div>
                  Trip History
                </Link>

                {/* Bus Info */}
                <Link
                  className={`nav-link ${currentPage === "/driver-dashboard/bus-info" ? "active" : ""}`}
                  to="/driver-dashboard/bus-info"
                >
                  <div className="sb-nav-link-icon"><i className="fa fa-bus"></i></div>
                  Bus Information
                </Link>

                {/* Driver Maintenance */}
                <Link
                  className={`nav-link ${currentPage === "/driver-dashboard/driverMaintenance" ? "active" : ""}`}
                  to="/driver-dashboard/driverMaintenance"
                >
                  <div className="sb-nav-link-icon"><i className="fa fa-tools"></i></div>
                  Maintenance
                </Link>
              </div>
            </div>

            <div className="sb-sidenav-footer">
              <div className="small">Logged in as:</div>
              DRIVER
            </div>
          </nav>
        </div>

        <div id="layoutSidenav_content">
          <main className="p-4">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default DriverNavbar;
