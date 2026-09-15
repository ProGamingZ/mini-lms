import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: 'student' | 'admin';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { currentUser, role, loading } = useAuth();

  // Show a blank screen or spinner while Firebase restores the session from local storage
  if (loading) return <div className="login-container"><h2>Loading Secure Session...</h2></div>;

  // If not logged in at all, kick to login screen
  if (!currentUser) return <Navigate to="/login" replace />;

  // If logged in but trying to access the wrong dashboard, redirect to their correct dashboard
  if (role !== allowedRole) return <Navigate to={`/${role}-dashboard`} replace />;

  // If all checks pass, render the requested page
  return <>{children}</>;
}