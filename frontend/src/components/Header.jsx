import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-[#3b5998] border-b border-[#112240]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
        <div className="flex items-center justify-center">
          <Link to="/" className="group">
            {/* Logo */}
            <img 
              src="/assets/nit-logo.png" 
              alt="NIT Nagaland Logo"
              className="h-12 lg:h-16 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </header>
  );
} 