import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Dashboard } from './pages/Dashboard';
import SplashPage from './pages/SplashPage';
import Login from './pages/Login';
import History from "./pages/History";
import NutritionHome from "./pages/NutritionHome";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SplashPage />
        <Login />
        <History />
        <NutritionHome />

        {/* 
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MainLayout> 
        */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;