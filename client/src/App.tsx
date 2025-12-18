import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router';

import Home from './pages/Home';
import Contracts from './pages/Contracts';
import Chat from './pages/Chat';
import Account from './pages/Account';
import Navigation from './components/Navigation';
import { useGetUser } from './queries/user';
import Callback from './pages/Callback';

import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { useEffect, useState } from 'react';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export const sessionStoragePersister = createAsyncStoragePersister({
  storage: window.sessionStorage,
})


// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { error, data: user } = useGetUser()
  const [state, setState] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (user || error) {
      setState("ready");
    }
  }, [user, error]);
  if (state === "loading") {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
};






function App() {

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: sessionStoragePersister }}>
      <ReactQueryDevtools
        initialIsOpen={false}
        position="bottom"
      />
      <Router>
        <Routes>
          {/* Public Home page */}
          <Route path="/callback" element={<Callback />} />

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


    </PersistQueryClientProvider>
  )
}

export default App
