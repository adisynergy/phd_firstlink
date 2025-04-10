import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

export default function FormNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/admission-form', label: 'Personal Details' },
    { path: '/academic-details', label: 'Academic Details' },
    { path: '/payment', label: 'Payment' },
    { path: '/enclosures', label: 'Enclosures' },
    { path: '/print-application', label: 'Print Application' }
  ];

  return (
    <div className="bg-white shadow-md mb-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-4 py-4">
          {tabs.map((tab) => (
            <Button
              key={tab.path}
              variant={location.pathname === tab.path ? "default" : "outline"}
              onClick={() => navigate(tab.path)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
} 