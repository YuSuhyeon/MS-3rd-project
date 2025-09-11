import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 컴포넌트 및 페이지 임포트
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ResultDashboard from "./pages/ResultDashboard";
import PersonaAnalysis from "./pages/PersonaAnalysis";
import ItineraryView from "./pages/ItineraryView";
import DocentMantine from "./pages/DocentMantine";
import DirectionsMyro from "./pages/DirectionsMyro";
import VisionOCR from "./pages/VisionOCR";
import DocentVision from "./pages/DocentVision";
import CommunityMain from "./pages/CommunityMain";

// 스타일 임포트
import "./styles/layout.css";

// AppRoutes 컴포넌트: 라우팅 규칙을 정의합니다.
function AppRoutes() {
  return (
    <Routes>
      {/* 루트 경로는 Layout 없이 Home 페이지만 렌더링합니다. */}
      <Route path="/" element={<Home />} />

      {/* 그 외 모든 경로는 Layout 컴포넌트로 감싸서 렌더링합니다. */}
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/persona" element={<PersonaAnalysis />} />
              <Route path="/result" element={<ResultDashboard />} />
              <Route path="/docent" element={<DocentMantine />} />
              <Route path="/directions" element={<DirectionsMyro />} />
              <Route path="/itinerary" element={<ItineraryView />} />
              {/* community 경로를 Layout 안으로 이동 */}
              <Route path="/community" element={<CommunityMain />} />
              <Route path="/community/*" element={<CommunityMain />} />
              <Route path="/visionocr" element={<VisionOCR />} />
              <Route path="/vision" element={<DocentVision />} />
              {/* 위 경로들과 일치하지 않으면 "/persona"로 리다이렉트합니다. */}
              <Route path="*" element={<Navigate to="/persona" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

// App 컴포넌트는 수정할 필요 없습니다.
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
