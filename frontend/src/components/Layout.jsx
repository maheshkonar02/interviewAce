import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, Home, Video, FileText, History } from 'lucide-react';
import Logo from './Logo';

export default function Layout() {
  const { user, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  // Fetch latest user data (including credits) when component mounts
  useEffect(() => {
    if (user) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/">
                  <Logo variant={1} className="w-auto h-8" textClassName="text-2xl" />
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/interview"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Interview
                </Link>
                <Link
                  to="/resume"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Resume
                </Link>
                <Link
                  to="/sessions"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-gray-200"
                >
                  <History className="w-4 h-4 mr-2" />
                  Sessions
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <div className="text-sm font-medium">{user?.name || user?.email}</div>
                <div className="text-xs text-gray-200">Credits: {user?.credits || 0}</div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

