import React, { useEffect,useContext,useState,useRef} from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { NotificationContext } from "../context/NotificationContext";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'
import api from '../config';
import dayjs from 'dayjs';


function Navbar({ children }) {
  const location = useLocation();
  const currentPage = location.pathname;
  
  // Get user role from localStorage or context
  const userRole = localStorage.getItem('roles') || 'ADMIN';
  const username = localStorage.getItem('username');

  console.log("🔍 UserRole:", userRole);
    console.log("🔍 Username:", username);
    console.log("🔍 All localStorage:", {...localStorage});
  
  // Admin state
  const [showBus, setShowBus] = React.useState(currentPage.startsWith('/buses'));
  const [showUser, setShowUser] = React.useState(currentPage.startsWith('/users'));
  const [showRoute, setShowRoute] = React.useState(currentPage.startsWith('/routes'));
  const [showSchedule, setShowSchedule] = React.useState(currentPage.startsWith('/schedule'));
  const [showMaintain, setShowMaintain] = React.useState(currentPage.startsWith('/maintain'));
  const [showTrip, setShowTrip] = React.useState(currentPage.startsWith('/trip'));

  const { notifications} = useContext(NotificationContext);
  const {addNotifications} = useContext(NotificationContext);
  const {unreadCount} = useContext(NotificationContext);
  const {markAllAsRead} = useContext(NotificationContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  

  useEffect(() => {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      const toggleSidebar = (e) => {
        e.preventDefault();
        document.body.classList.toggle('sb-sidenav-toggled');
        localStorage.setItem(
          'sb|sidebar-toggle',
          document.body.classList.contains('sb-sidenav-toggled')
        );
      };
      sidebarToggle.addEventListener('click', toggleSidebar);

      if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        document.body.classList.add('sb-sidenav-toggled');
      }

      return () => sidebarToggle.removeEventListener('click', toggleSidebar);
    }
  }, []);

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

 

  const handleLogout = () => {
    localStorage.clear();
    // Clear session and browser history
    window.history.replaceState(null, null, "/login");
    window.location.href = "/login";
  };

  const fetchUnreadNotifications = async()=>{
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
        <Link className="navbar-brand ps-3 fs-4" to="/dashboard">
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

          {/* NOTIFICATION BELL - Updated to match theme */}
          <li className="nav-item dropdown me-2" ref={dropdownRef}>
            <button
              onClick={() => {
                // Only mark as read when opening the dropdown
                if (!showDropdown) {
                  markAllAsRead();
                }
                setShowDropdown((prev) => !prev);
              }}
              
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
                      to={"/notification/see-all"} 
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
              <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
              <li><Link className="dropdown-item" to="/profile/edit">Settings</Link></li>
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

      {/* SIDEBAR + MAIN */}
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
              <div className="nav">
                <div className="sb-sidenav-menu-heading">
                  {userRole === 'ADMIN' ? 'Admin Panel' : 'Driver Panel'}
                </div>

                {/* Dashboard - Available for both roles */}
                <Link className={`nav-link ${currentPage === '/dashboard' ? 'active' : ''}`} to="/dashboard">
                  <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
                  Dashboard
                </Link>

                {/* ADMIN ONLY NAVIGATION */}
                {userRole.includes('ADMIN') && (
                  <>
                    <div
                      className={`nav-link ${currentPage.startsWith('/users') ? '' : 'collapsed'}`}
                      onClick={() => setShowUser(!showUser)}
                      style={{ cursor: 'pointer' }}
                      aria-expanded={currentPage.startsWith('/users')}
                    >
                      <div className="sb-nav-link-icon"><i className="fa fa-users"></i></div>
                      Users
                      <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                    </div>
                    <div className={`collapsible ${showUser ? 'show' : ''}`}>
                      <nav className="sb-sidenav-menu-nested nav">
                        <Link className={`nav-link ${currentPage === '/users/add' ? 'active' : ''}`} to="/users/add">Add</Link>
                        <Link className={`nav-link ${currentPage === '/users/manage' ? 'active' : ''}`} to="/users/manage">Manage</Link>
                      </nav>
                    </div>

                    <div
                      className={`nav-link ${currentPage.startsWith('/buses') ? '' : 'collapsed'}`}
                      onClick={() => setShowBus(!showBus)}
                      style={{ cursor: 'pointer' }}
                      aria-expanded={currentPage.startsWith('/buses')}
                    >
                      <div className="sb-nav-link-icon"><i className="fa fa-bus"></i></div>
                      Buses
                      <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                    </div>
                    <div className={`collapsible ${showBus ? 'show' : ''}`}>
                      <nav className="sb-sidenav-menu-nested nav">
                        <Link className={`nav-link ${currentPage === '/buses/add' ? 'active' : ''}`} to="/buses/add">Add</Link>
                        <Link className={`nav-link ${currentPage === '/buses/manage' ? 'active' : ''}`} to="/buses/manage">Manage</Link>
                      </nav>
                    </div>

                    <div
                      className={`nav-link ${currentPage.startsWith('/routes') ? '' : 'collapsed'}`}
                      onClick={() => setShowRoute(!showRoute)}
                      style={{ cursor: 'pointer' }}
                      aria-expanded={currentPage.startsWith('/routes')}
                    >
                      <div className="sb-nav-link-icon"><i className="fa fa-road"></i></div>
                      Routes
                      <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                    </div>
                    <div className={`collapsible ${showRoute ? 'show' : ''}`}>
                      <nav className="sb-sidenav-menu-nested nav">
                        <Link className={`nav-link ${currentPage === '/routes/add' ? 'active' : ''}`} to="/routes/add">Add</Link>
                        <Link className={`nav-link ${currentPage === '/routes/manage' ? 'active' : ''}`} to="/routes/manage">Manage</Link>
                      </nav>
                    </div>

                    <div
                      className={`nav-link ${currentPage.startsWith('/schedule') ? '' : 'collapsed'}`}
                      onClick={() => setShowSchedule(!showSchedule)}
                      style={{ cursor: 'pointer' }}
                      aria-expanded={currentPage.startsWith('/schedule')}
                    >
                      <div className="sb-nav-link-icon"><i className="fa fa-calendar-alt"></i></div>
                      Schedule
                      <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                    </div>
                    <div className={`collapsible ${showSchedule ? 'show' : ''}`}>
                      <nav className="sb-sidenav-menu-nested nav">
                        <Link className={`nav-link ${currentPage === '/schedule/add' ? 'active' : ''}`} to="/schedule/add">Add</Link>
                        <Link className={`nav-link ${currentPage === '/schedule/manage' ? 'active' : ''}`} to="/schedule/manage">Manage</Link>
                      </nav>
                    </div>

                    <div
                      className={`nav-link ${currentPage.startsWith('/maintain') ? '' : 'collapsed'}`}
                      onClick={() => setShowMaintain(!showMaintain)}
                      style={{ cursor: 'pointer' }}
                      aria-expanded={currentPage.startsWith('/maintain')}
                    >
                      <div className="sb-nav-link-icon"><i className="fa fa-tools"></i></div>
                      Maintenance
                      <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                    </div>
                    <div className={`collapsible ${showMaintain ? 'show' : ''}`}>
                      <nav className="sb-sidenav-menu-nested nav">
                        <Link className={`nav-link ${currentPage === '/maintain/add' ? 'active' : ''}`} to="/maintain/add">Add</Link>
                        <Link className={`nav-link ${currentPage === '/maintain/manage' ? 'active' : ''}`} to="/maintain/manage">Manage</Link>
                      </nav>
                    </div>

                    <Link className={`nav-link ${currentPage === '/livetracking' ? 'active' : ''}`} to="/livetracking">
                      <div className="sb-nav-link-icon"><i className="fas fa-location-arrow"></i></div>
                      Live tracking
                    </Link>

                    <Link className={`nav-link ${currentPage === '/trip/history' ? 'active' : ''}`} to="/trip/history">
                      <div className="sb-nav-link-icon"><i className="fas fa-route"></i></div>
                      Trip History
                    </Link>

                    <Link className={`nav-link ${currentPage === '/reports' ? 'active' : ''}`} to="/reports">
                      <div className="sb-nav-link-icon"><i className="fas fa-file-pdf"></i></div>
                      Reports
                    </Link>
                  </>
                )}

              </div>
            </div>
            <div className="sb-sidenav-footer">
              <div className="small">Logged in as:</div>
              {userRole}
            </div>
          </nav>
        </div>

        {/* PAGE CONTENT */}
        <div id="layoutSidenav_content">
          <main className="p-4">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Navbar;