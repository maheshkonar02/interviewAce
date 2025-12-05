import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import ResumeUpload from './pages/ResumeUpload';
import Sessions from './pages/Sessions';
import LogoShowcase from './pages/LogoShowcase';
import Layout from './components/Layout';
import OverlayWindow from './components/OverlayWindow';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logo-showcase" element={<LogoShowcase />} />
        <Route path="/overlay" element={<OverlayWindow />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="interview" element={<Interview />} />
          <Route path="resume" element={<ResumeUpload />} />
          <Route path="sessions" element={<Sessions />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

