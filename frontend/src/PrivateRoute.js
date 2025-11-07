import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "./config";
function PrivateRoute({ children, role }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  const validateToken = async () => {
        if (!token) {
            console.log('No token found');
            return false;
        }
        try {
            const response = await axios.get('user/verify-token', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Token validation response:', response);
            return response;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
    
  useEffect(() => {
    if (!token || (role && !roles.includes(role))) {
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      localStorage.removeItem('username');
      navigate("/login");
    }
    const checkToken = async () => {
      const isValid = await validateToken();
      if (!isValid || isValid.status !== 200) {
        console.log('Token is invalid or expired');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        localStorage.removeItem('username');
        navigate("/login");
      }
    }
    checkToken();
      
  }, [token, role, roles, navigate]);
  return children;
}
export default PrivateRoute;

