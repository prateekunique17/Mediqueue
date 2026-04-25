import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentRequest from './pages/AppointmentRequest';

const App: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg text-text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <nav className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-extrabold text-accent flex items-center gap-2">
            <span className="text-2xl">✚</span>
            MEDIQUEUE
          </Link>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to={profile?.role === 'admin' ? '/admin' : profile?.role === 'hospital' ? '/hospital' : '/dashboard'} className="text-text-secondary hover:text-accent font-medium text-sm transition">
                  Dashboard
                </Link>
                <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-text-primary font-bold uppercase text-xs">
                   {user.email?.[0]}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-secondary hover:text-accent font-medium text-sm transition">Login</Link>
                <Link to="/signup" className="bg-accent text-white px-5 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition shadow-lg shadow-accent/20">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            user && profile?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />
          } />
          
          <Route path="/request" element={
            user && profile?.role === 'patient' ? <AppointmentRequest /> : <Navigate to="/login" />
          } />

          <Route path="/hospital" element={
            user && profile?.role === 'hospital' ? <HospitalDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/admin" element={
            user && profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
