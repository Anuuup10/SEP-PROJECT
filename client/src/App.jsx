import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Dashboard } from './pages/Dashboard';
import SplashPage from './pages/SplashPage';
import Progress from './pages/Progress';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      {/* <SplashPage /> */}
      <Progress/>
        {/* <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MainLayout> */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
