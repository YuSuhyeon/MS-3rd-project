import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ResultDashboard from "./pages/ResultDashboard";
import PersonaAnalysis from "./pages/PersonaAnalysis";
import ItineraryView from "./pages/ItineraryView";
import DocentMantine from "./pages/DocentMantine";
// Naver/WALK/TRANSIT ready directions view
// Redesigned route editor (Myro-like UI)
import DirectionsMyro from "./pages/DirectionsMyro";
import VisionOCR from "./pages/VisionOCR";
import DocentVision from "./pages/DocentVision";
import CommunityMain from "./pages/CommunityMain";
import "./styles/layout.css";

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
  if (location.pathname === "/") {
    return <Home />;
  }

  // App pages wrapped with the sidebar layout
  return (
    <Layout>
      <Routes>
        <Route path="/persona" element={<PersonaAnalysis />} />
        <Route path="/result" element={<ResultDashboard />} />
        <Route path="/docent" element={<DocentMantine />} />
        <Route path="/directions" element={<DirectionsMyro />} />
        <Route path="/itinerary" element={<ItineraryView />} />
        <Route path="/community" element={<CommunityMain />} />
        <Route path="/community/*" element={<CommunityMain />} />
        <Route path="/visionocr" element={<VisionOCR />} />
        <Route path="/vision" element={<DocentVision />} />

        <Route path="*" element={<Navigate to="/persona" replace />} />
      </Routes>
    </Layout>
  );
}
