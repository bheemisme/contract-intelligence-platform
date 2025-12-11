import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatSubmenuOpen, setIsChatSubmenuOpen] = useState(false);

  const navItems = [
    // { path: '/', label: 'Home', icon: '🏠' },
    { path: '/contracts', label: 'Contracts', icon: '📄' },
    {
      path: '/chat',
      label: 'Chat',
      icon: '💬',
      subItems: [
        { path: '/chat/general', label: 'General Chat', icon: '💬' },
        { path: '/chat/contracts', label: 'Contract Chat', icon: '📄' },
        { path: '/chat/analysis', label: 'Analysis Chat', icon: '📊' },
      ]
    },
    { path: '/account', label: 'Account', icon: '👤' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:bg-green-800 md:text-white">
        <div className="flex items-center justify-center h-16 bg-green-900">
          <h1 className="text-xl font-bold">CIP</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <div>
                  <div className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}>
                    <button
                      onClick={() => setIsChatSubmenuOpen(!isChatSubmenuOpen)}
                      className="flex items-center flex-1"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate('/chat')}
                        className="p-1 rounded hover:bg-green-600 transition-colors"
                        title="New Chat"
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => setIsChatSubmenuOpen(!isChatSubmenuOpen)}
                        className="p-1 rounded hover:bg-green-600 transition-colors"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  {isChatSubmenuOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors ${
                            location.pathname === subItem.path
                              ? 'bg-green-600 text-white'
                              : 'text-green-200 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
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
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-green-800 text-white z-50">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">CIP</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-green-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-green-800 text-white transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 bg-green-900">
          <h1 className="text-xl font-bold">CIP</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <div>
                  <div className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}>
                    <button
                      onClick={() => setIsChatSubmenuOpen(!isChatSubmenuOpen)}
                      className="flex items-center flex-1"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </button>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate('/chat')}
                        className="p-1 rounded hover:bg-green-600 transition-colors"
                        title="New Chat"
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => setIsChatSubmenuOpen(!isChatSubmenuOpen)}
                        className="p-1 rounded hover:bg-green-600 transition-colors"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  {isChatSubmenuOpen && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={closeMobileMenu}
                          className={`flex items-center px-4 py-2 text-xs font-medium rounded-md transition-colors ${
                            location.pathname === subItem.path
                              ? 'bg-green-600 text-white'
                              : 'text-green-200 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          <span className="mr-2">{subItem.icon}</span>
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Spacer */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default Navigation;