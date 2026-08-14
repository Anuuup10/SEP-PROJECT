import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
import SplashPage from './pages/SplashPage';
import FoodAnalysisResult from './pages/FoodAnalysisResult';
import { sampleResult } from "./pages/FoodAnalysisResult.example";
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import Progress from './pages/Progress';
import History from './pages/History';
import Setting from './pages/Setting';

function ResultRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result || sampleResult;

  return (
    <FoodAnalysisResult
      result={result}
      onBack={() => navigate(-1)}
      onToggleFavorite={() => {}}
      onViewDetails={(details) => navigate(`/food/${details.id || 'demo'}`, { state: { item: details } })}
      onSelectItem={(item) => navigate(`/food/${item.id || 'demo'}`, { state: { item } })}
    />
  );
}

function ItemDetailsRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  return <ItemDetails item={location.state?.item} onBack={() => navigate(-1)} />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/onboarding" element={<SplashPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login initialSignup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/scan/analyzing" element={<Scan />} />
          <Route path="/scan/result" element={<ResultRoute />} />
          <Route path="/food/:id" element={<ItemDetailsRoute />} />
          <Route path="/item-details" element={<ItemDetailsRoute />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/progress/goals" element={<Goals />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/profile" element={<Setting />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
