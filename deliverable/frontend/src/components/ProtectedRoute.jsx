import { Navigate } from 'react-router-dom';
import { hasValidSession, loginPathFor } from '../utils/auth';

// Wrap a page so it only shows for a logged-in user of the given role.
const ProtectedRoute = ({ role, children }) => {
  if (!hasValidSession(role)) {
    return <Navigate to={loginPathFor(role)} replace />;
  }
  return children;
};

export default ProtectedRoute;
