import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home';
import Contracts from './pages/Contracts';
import Chat from './pages/Chat';
import Account from './pages/Account';
import Navigation from './components/Navigation';

const queryClient = new QueryClient();

// Mock authentication check
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>

        <Routes>
          {/* Public Home page */}
          <Route path="/" element={<Home />} />

          {/* Protected routes with Navigation */}
          <Route path="/contracts" element={
            <ProtectedRoute>
              <div className=''>
                <Navigation />
                <div className='md:pl-64 pt-16 md:pt-0'>
                  <Contracts />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <div className=''>
                <Navigation />
                <div className='md:pl-64 pt-16 md:pt-0'>
                  <Chat />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <div className=''>
                <Navigation />
                <div className='md:pl-64 pt-16 md:pt-0'>
                  <Chat />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/account" element={
            <ProtectedRoute>
              <div className=''>
                <Navigation />
                <div className='md:pl-64 pt-16 md:pt-0'>
                  <Account />
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>

      </Router>
    </QueryClientProvider>
  )
}

export default App
