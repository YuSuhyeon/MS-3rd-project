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
// 기본 Directions 페이지는 사용하지 않고 개선 페이지로 대체합니다.
import DirectionsMantineImproved from "./pages/DirectionsMantineImproved";
import VisionOCR from "./pages/VisionOCR";
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
        <Route path="/directions" element={<DirectionsMantineImproved />} />
        <Route path="/directions2" element={<DirectionsMantineImproved />} />
        <Route path="/itinerary" element={<ItineraryView />} />
        <Route path="/visionocr" element={<VisionOCR />} />
        <Route path="/community" element={<CommunityMain />} />
        <Route path="*" element={<Navigate to="/persona" replace />} />
      </Routes>
    </Layout>
  );
}
