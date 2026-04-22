import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/student/Dashboard';
import SubmitRequest from './pages/student/SubmitRequest';
import RequestTracker from './pages/student/RequestTracker';

import PendingList from './pages/coordinator/PendingList';

// Placeholder components for roles
import AdminDashboard from './pages/admin/AdminDashboard';
import SubstituteManager from './pages/admin/SubstituteManager';
const Unauthorized = () => <div className="p-8 text-red-600"><h1>Unauthorized Access</h1></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/student/submit" element={<SubmitRequest />} />
            <Route path="/student/track/:id" element={<RequestTracker />} />
          </Route>

          {/* Coordinator Routes (Unified Component) */}
          <Route element={<ProtectedRoute allowedRoles={['CLASS_COORD']} />}>
            <Route path="/classcoord/pending" element={<PendingList />} />
          </Route>

          {/* Year Coordinator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['YEAR_COORD']} />}>
            <Route path="/yearcoord/pending" element={<PendingList />} />
          </Route>

          {/* Chairperson Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CHAIRPERSON']} />}>
            <Route path="/chairperson/pending" element={<PendingList />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/substitutes" element={<SubstituteManager />} />
          </Route>
        </Route>
        <Route path="*" element={<div className="p-8"><h1>404 Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
