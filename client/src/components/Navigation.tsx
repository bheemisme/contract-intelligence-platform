import React from 'react';
import { Link, useLocation } from 'react-router';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/contracts', label: 'Contracts', icon: '📄' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:bg-green-800 md:text-white">
        <div className="flex items-center justify-center h-16 bg-green-900">
          <h1 className="text-xl font-bold">CIP</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-800 text-white flex justify-around py-2 z-10">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-2 px-4 text-xs font-medium transition-colors ${
              location.pathname === item.path
                ? 'text-green-200'
                : 'text-green-100 hover:text-white'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile Spacer */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default Navigation;