import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Dashboard from './pages/Dashboard';
import HallManagement from './pages/HallManagement';
import BookingManagement from './pages/BookingManagement';
import Profile from './pages/Profile';
import HallDetails from './pages/HallDetails';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';


const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-sky-500">Loading Admin Dashboard...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            } />

            <Route path="/halls" element={
              <ProtectedAdminRoute>
                <HallManagement />
              </ProtectedAdminRoute>
            } />

            <Route path="/halls/:id" element={
              <ProtectedAdminRoute>
                <HallDetails />
              </ProtectedAdminRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedAdminRoute>
                <BookingManagement />
              </ProtectedAdminRoute>
            } />

            <Route path="/users" element={
              <ProtectedAdminRoute>
                <UserManagement />
              </ProtectedAdminRoute>
            } />

            <Route path="/profile" element={
              <ProtectedAdminRoute>
                <Profile />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
