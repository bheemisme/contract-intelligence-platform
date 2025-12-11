import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);

    // Mock Google sign-in process
    setTimeout(() => {
      // In a real app, this would integrate with Google OAuth
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://via.placeholder.com/40'
      }));

      setIsSigningIn(false);
      navigate('/contracts'); // Redirect to contracts page after sign-in
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Navigation Bar - Public */}
      <nav className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-800">CIP</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-green-700 hover:text-green-800 font-medium">Features</a>
              <a href="#about" className="text-green-700 hover:text-green-800 font-medium">About</a>
              <a href="#contact" className="text-green-700 hover:text-green-800 font-medium">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-6">
            Contract Intelligence Platform
          </h1>
          <p className="text-xl md:text-2xl text-green-700 mb-8 max-w-3xl mx-auto">
            Revolutionize your contract management with AI-powered insights, automated analysis,
            and intelligent document processing.
          </p>

          {/* Sign In Button */}
          <div className="mb-12">
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center px-8 py-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-xl hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-20">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">Smart Contract Analysis</h3>
              <p className="text-green-700">
                AI-powered contract analysis that extracts key information, identifies risks,
                and provides actionable insights.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">Intelligent Chat</h3>
              <p className="text-green-700">
                Interactive AI assistant for contract discussions, analysis queries,
                and document-related conversations.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-green-800 mb-3">Secure & Compliant</h3>
              <p className="text-green-700">
                Enterprise-grade security with compliance features to protect your
                sensitive contract data.
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-6">About Contract Intelligence Platform</h2>
          <p className="text-lg text-green-700 max-w-3xl mx-auto">
            Our platform leverages cutting-edge AI technology to transform how legal professionals
            and businesses manage contracts. From automated document processing to intelligent
            analysis and interactive consultations, we make contract management efficient,
            accurate, and insightful.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-green-200">
            © 2025 Contract Intelligence Platform. Transforming contract management with AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;