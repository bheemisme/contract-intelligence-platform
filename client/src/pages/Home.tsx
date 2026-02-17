import React from 'react';
import GoogleButton from '@/components/GoogleButton';

const Home: React.FC = () => {


  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-green-100">
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
          <GoogleButton />
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


      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-green-200">
            © 2025 Contract Intelligence Platform. Transforming contract management with AI.
          </p>
        </div>
      </footer>
    </div >
  );

}

export default Home;