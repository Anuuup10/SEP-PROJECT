import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { Dashboard } from './pages/Dashboard';
import { Goals } from './pages/Goals';
import SplashPage from './pages/SplashPage';
import Setting from './pages/Setting';
import Progress from './pages/Progress';
import FoodAnalysisResult from './pages/FoodAnalysisResult';
import { sampleResult } from "./pages/FoodAnalysisResult.example";
import ItemDetails from './pages/ItemDetails';
import Login from './pages/Login';
import History from "./pages/History";

export function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <Setting/>    
    </>
    // <AuthProvider>
    //   <BrowserRouter>
    //   <SplashPage />
    //     {/* <MainLayout>
    //       <Routes>
    //         <Route path="/" element={<Home />} />
    //         <Route path="/scan" element={<Scan />} />
    //         <Route path="/dashboard" element={<Dashboard />} />
    //       </Routes>
    //     </MainLayout> */}
    //   </BrowserRouter>
    // </AuthProvider>
    <AuthProvider>
      <BrowserRouter>
      {/* <SplashPage /> */}
      <Progress/>
      {/* < SplashPage /> */}
        <Routes>
          <Route path="/onboarding" element={<SplashPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/goals" element={<Goals />} />
        </Routes>
      {selectedItem ? (
        <ItemDetails
          item={selectedItem}
          onBack={() => setSelectedItem(null)}
        />
      ) : (
        <>
          <SplashPage />
          <FoodAnalysisResult
            result={sampleResult}
            onBack={() => console.log("back pressed")}
            onToggleFavorite={(id) => console.log("toggled favorite for", id)}
            onViewDetails={(r) => console.log("view details for", r)}
            onSelectItem={setSelectedItem}
          />
        </>
      )}
      <SplashPage />
    <Login />
    <History />
      
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
