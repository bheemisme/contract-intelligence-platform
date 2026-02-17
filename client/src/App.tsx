import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';

import Home from '@/pages/Home';
import Contracts from '@/pages/Contracts';
import Chat from '@/pages/Chat';
import Account from '@/pages/Account';
import Navigation from '@/components/Navigation';
import { useGetUser } from '@/queries/user';
import Callback from '@/pages/Callback';
import ContractDetail from '@/pages/ContractDetail';

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


const LoadingIndicator: React.FC<{ message?: string }> = ({ message = 'Verifying access...' }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-green-50">
    <svg className="w-20 h-20 animate-spin text-green-700" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <p className="mt-6 text-lg font-semibold text-green-800">{message}</p>
  </div>
);

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
    return <LoadingIndicator message="Verifying access to contracts..." />;
  }

  if (error) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;


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
      {/* <Flag message={flagCtx.flagMessage} flag={flagCtx.flagType} setShowFlag={flagCtx.setShowFlag} showFlag={flagCtx.showFlag} hideFlag={flagCtx.hideFlag} setHideFlag={flagCtx.setHideFlag} /> */}
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

          {/* <Route path="/chat" element={
            <ProtectedRoute>
              <div className=''>
                <Navigation />
                <div className='md:pl-64 pt-16 md:pt-0'>
                  <Chat />
                </div>
              </div>
            </ProtectedRoute>
          } /> */}

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

          <Route path="/contract/:contractId" element={
            <ProtectedRoute>
              <div className=''>
                <Navigation />
                <div className='md:pl-64 pt-16 md:pt-0'>
                  <ContractDetail />
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
