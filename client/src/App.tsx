import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './pages/Home';
import Contracts from './pages/Contracts';
import Navigation from './components/Navigation';

const queryClient = new QueryClient();

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Router>

        <div className='flex flex-row justify-items-center'>
          <div className='basis-[30vw]'>
            <Navigation />
          </div>

          <div className='basis-[70vw]'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contracts" element={<Contracts />} />

            </Routes>
          </div>

        </div>

      </Router>
    </QueryClientProvider>
  )
}

export default App
