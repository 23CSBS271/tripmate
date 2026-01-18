import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, LogOut, LayoutDashboard, Calendar, Map, BookOpen } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TripMate</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/calendar"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isActive('/calendar')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </Link>

              <Link
                to="/map"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isActive('/map')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </Link>

              <Link
                to="/stories"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isActive('/stories')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Stories</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden sm:block font-medium">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
