import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ResultDashboard from './pages/ResultDashboard';
import ItineraryView from './pages/ItineraryView';
import DocentMantine from './pages/DocentMantine';
import DirectionsMantine from './pages/DirectionsMantine';
import Landing from './pages/Landing';
import './styles/layout.css';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();

  // Landing page without app layout
  if (location.pathname === '/') {
    return <Landing />;
  }

  // App pages wrapped with the sidebar layout
  return (
    <Layout>
      <Routes>
        <Route path="/persona" element={<Home />} />
        <Route path="/result" element={<ResultDashboard />} />
        <Route path="/docent" element={<DocentMantine />} />
        <Route path="/directions" element={<DirectionsMantine />} />
        <Route path="/itinerary" element={<ItineraryView />} />
        <Route path="*" element={<Navigate to="/persona" replace />} />
      </Routes>
    </Layout>
  );
}
