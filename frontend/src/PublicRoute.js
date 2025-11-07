import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PublicRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  useEffect(() => {
    // If user is authenticated, redirect to appropriate dashboard
    if (token && roles.length > 0) {
      if (roles.includes("ADMIN")) {
        navigate("/dashboard", { replace: true });
      } else if (roles.includes("DRIVER")) {
        navigate("/driver-dashboard", { replace: true });
      }
    }
  }, [token, roles, navigate]);

  // If user is authenticated, don't render the public route
  if (token && roles.length > 0) {
    return null;
  }

  return children;
}

export default PublicRoute;