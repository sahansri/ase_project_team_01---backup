import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './authentication/Login';
import Dashboard from './pages/admin/Dashboard';
import { Profile } from './pages/admin/Profile';
import { EditProfile } from './pages/admin/EditProfile';
import { ManageUsers } from './pages/admin/ManageUsers';
import { AddUsers } from './pages/admin/AddUsers';
import { EditUsers } from './pages/admin/EditUsers';
import { AddBus } from './pages/admin/AddBus';
import { ManageBuses } from './pages/admin/ManageBuses';
import { EditBus } from './pages/admin/EditBus';
import { AddRoute } from './pages/admin/AddRoute';
import { ManageRoutes } from './pages/admin/ManageRoutes';
import { EditRoute } from './pages/admin/EditRoute';
import { AddSchedule } from './pages/admin/AddSchedule';
import { ManageSchedule } from './pages/admin/ManageSchedule';
import { EditSchedule } from './pages/admin/EditSchedule';
import { AddMaintain } from './pages/admin/AddMaintain';
import { ManageMaintain } from './pages/admin/ManageMaintain';
import { EditMaintain } from './pages/admin/EditMaintain';
import { ManageMaintainRecords } from './pages/admin/ManageMaintainRecords';
import { LiveTracking } from './pages/admin/LiveTracking';
import { Reports } from './pages/admin/Reports';
import './assets/styles.css';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { TripHistory } from './pages/driver/TripHistory';
import { BusInfo } from './pages/driver/BusInfo';
import { Schedule } from './pages/driver/Schedule';
import DriverNavbar from './components/DriverNavbar';
import { AddTripDriver } from './pages/driver/AddTripDriver';
import { ViewAllTripHistory } from './pages/admin/ViewAllTripHistory';
import { DriverProfile } from './pages/driver/DriverProfile';
import { DriverProfileEdit } from './pages/driver/DriverProfileEdit';
import { Starter } from './starter';
import { DriverMaintenance } from './pages/driver/DriverMaintenance';
import {DriverMaintenanceEdit} from './pages/driver/DriverMaintenanceEdit';
import {DriverMaintenanceAdd} from './pages/driver/DriverMaintenanceAdd';
import NotificationsList from './pages/NotificationsList';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Starter />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={ <PrivateRoute role="ADMIN">
            <Navbar><Dashboard /></Navbar>
          </PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute role="ADMIN"><Navbar><Profile /></Navbar></PrivateRoute>} />
      <Route path="/profile/edit" element={<PrivateRoute role="ADMIN"><Navbar><EditProfile /></Navbar></PrivateRoute>} />
      <Route path="/users/add" element={<PrivateRoute role="ADMIN"><Navbar><AddUsers /></Navbar></PrivateRoute>} />
      <Route path="/users/manage" element={<PrivateRoute role="ADMIN"><Navbar><ManageUsers /></Navbar></PrivateRoute>} />
      <Route path="/users/edit/:userId" element={<PrivateRoute role="ADMIN"><Navbar><EditUsers /></Navbar></PrivateRoute>} />
      <Route path="/buses/add" element={<PrivateRoute role="ADMIN"><Navbar><AddBus /></Navbar></PrivateRoute>} />
      <Route path="/buses/manage" element={<PrivateRoute role="ADMIN"><Navbar><ManageBuses /></Navbar></PrivateRoute>} />
      <Route path="/buses/edit/:id" element={<PrivateRoute role="ADMIN"><Navbar><EditBus /></Navbar></PrivateRoute>} />
      <Route path="/routes/add" element={<PrivateRoute role="ADMIN"><Navbar><AddRoute /></Navbar></PrivateRoute>} />
      <Route path="/routes/manage" element={<PrivateRoute role="ADMIN"><Navbar><ManageRoutes /></Navbar></PrivateRoute>} />
      <Route path="/routes/edit/:id" element={<PrivateRoute role="ADMIN"><Navbar><EditRoute /></Navbar></PrivateRoute>} />
      <Route path="/schedule/add" element={<PrivateRoute role="ADMIN"><Navbar><AddSchedule /></Navbar></PrivateRoute>} />
      <Route path="/schedule/manage" element={<PrivateRoute role="ADMIN"><Navbar><ManageSchedule /></Navbar></PrivateRoute>} />
      <Route path="/schedule/edit/:id" element={<PrivateRoute role="ADMIN"><Navbar><EditSchedule /></Navbar></PrivateRoute>} />
      <Route path="/maintain/add" element={<PrivateRoute role="ADMIN"><Navbar><AddMaintain /></Navbar></PrivateRoute>} />
      <Route path="/maintain/manage" element={<PrivateRoute role="ADMIN"><Navbar><ManageMaintain /></Navbar></PrivateRoute>} />
      <Route path="/maintain/edit/:id" element={<PrivateRoute role="ADMIN"><Navbar><EditMaintain /></Navbar></PrivateRoute>} />
      <Route path="/maintain/viewRecords" element={<PrivateRoute role="ADMIN"><Navbar><ManageMaintainRecords/></Navbar></PrivateRoute>}/>
      <Route path="/maintain/viewRecords/:busNumber" element={<PrivateRoute role="ADMIN"><Navbar><ManageMaintainRecords/></Navbar></PrivateRoute>}/>
      <Route path="/livetracking" element={<PrivateRoute role="ADMIN"><Navbar><LiveTracking /></Navbar></PrivateRoute>} />
      <Route path="/trip/history" element={<PrivateRoute role="ADMIN"><Navbar><ViewAllTripHistory /></Navbar></PrivateRoute>} />
      <Route path="/notification/see-all" element={<PrivateRoute role="ADMIN"><Navbar><NotificationsList /></Navbar></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute role="ADMIN"><Navbar><Reports /></Navbar></PrivateRoute>} />

      // driver routes
      <Route path="/driver-dashboard" element={<PrivateRoute role="DRIVER"><DriverNavbar><DriverDashboard /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/schedule" element={<PrivateRoute role="DRIVER"><DriverNavbar><Schedule /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/trip-info/:id" element={<PrivateRoute role="DRIVER"><DriverNavbar><AddTripDriver /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/trip-history" element={<PrivateRoute role="DRIVER"><DriverNavbar><TripHistory /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/bus-info" element={<PrivateRoute role="DRIVER"><DriverNavbar><BusInfo /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-profile" element={<PrivateRoute role="DRIVER"><DriverNavbar><DriverProfile /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-profile/edit" element={<PrivateRoute role="DRIVER"><DriverNavbar><DriverProfileEdit /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/driverMaintenance" element={<PrivateRoute role="DRIVER"><DriverNavbar><DriverMaintenance /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/Maintenance/edit/:id" element={<PrivateRoute role="DRIVER"><DriverNavbar><DriverMaintenanceEdit /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/Maintenance/add/:busNumber" element={<PrivateRoute role="DRIVER"><DriverNavbar><DriverMaintenanceAdd /></DriverNavbar></PrivateRoute>} />
      <Route path="/driver-dashboard/notification/see-all" element={<PrivateRoute role="DRIVER"><DriverNavbar><NotificationsList /></DriverNavbar></PrivateRoute>} />
    </Routes>
  );
}
