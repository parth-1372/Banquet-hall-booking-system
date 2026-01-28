import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Halls from './pages/Halls';
import HallDetails from './pages/HallDetails';
import MyBookings from './pages/MyBookings';
import Contact from './pages/Contact';
import MultiBooking from './pages/MultiBooking';
import EditBooking from './pages/EditBooking';
import BookingInvoice from './pages/BookingInvoice';
import Chatbot from './components/ui/Chatbot';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-slate-950 dark:text-white transition-colors">Loading...</div>;
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
            <Route path="/" element={<Home />} />
            <Route path="/halls" element={<Halls />} />
            <Route path="/halls/:id" element={<HallDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/book-multi" element={
              <ProtectedRoute>
                <MultiBooking />
              </ProtectedRoute>
            } />
            <Route path="/edit-booking/:id" element={
              <ProtectedRoute>
                <EditBooking />
              </ProtectedRoute>
            } />
            <Route path="/invoice/:id" element={
              <ProtectedRoute>
                <BookingInvoice />
              </ProtectedRoute>
            } />
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
