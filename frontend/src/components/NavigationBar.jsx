import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function NavigationBar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-gray-800 text-center text-lg md:text-xl lg:text-2xl font-bold mt-2">
              APPLICATION FORM FOR ADMISSION TO Ph.D. PROGRAMME (Visvesvaraya Ph.D. Scheme for Electronics and IT: Phase-II)(Jul -Dec 2025)
            </h1>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 