import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import ForgotPassword from './pages/ForgotPassword';
import RoleLogin from './pages/RoleLogin';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/coordinator/login" element={<RoleLogin />} />
          <Route path="/year-coordinator/login" element={<RoleLogin />} />
          <Route path="/chairperson/login" element={<RoleLogin />} />
          <Route path="/admin/login" element={<RoleLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
