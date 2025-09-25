import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import DynamicTranslator from "./components/DynamicTranslator";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./i18n"; // i18n 초기화
import "./styles/layout.css";

import Home from "./pages/Home";
import ResultDashboard from "./pages/ResultDashboard";
import PersonaAnalysis from "./pages/PersonaAnalysis";
import ItineraryView from "./pages/ItineraryView";
import DocentMantine from "./pages/DocentMantine";
import DirectionsMantineImproved from "./pages/DirectionsMantineImproved";
import VisionOCR from "./pages/VisionOCR";
import DocentVision from "./pages/DocentVision";
import CommunityMain from "./pages/CommunityMain";
import Tour from "./pages/Tour";
import TourDetail from "./pages/TourDetail";
import PopularPlaces from "./pages/PopularPlaces";
import CommunitySocial from "./pages/CommunitySocial";

import Mypage from "./pages/Mypage";

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
              <Route
                path="/directions"
                element={<DirectionsMantineImproved />}
              />
              <Route
                path="/popular-places/:areaName"
                element={<PopularPlaces />}
              />
              <Route path="/tour" element={<Tour />} />
              <Route path="/itinerary" element={<ItineraryView />} />
              <Route path="/community" element={<CommunityMain />} />
              <Route path="/community/*" element={<CommunityMain />} />
              <Route path="/social" element={<CommunitySocial />} />
              <Route path="/visionocr" element={<VisionOCR />} />
              <Route path="/vision" element={<DocentVision />} />

              <Route path="/social" element={<CommunitySocial />} />
              <Route path="/tour/:id" element={<TourDetail />} />
              <Route path="/mypage" element={<Mypage />} />
              <Route
                path="/popular-places/:areaName"
                element={<PopularPlaces />}
              />
              <Route path="/tour/:id" element={<TourDetail />} />
              {/* 위 경로들과 일치하지 않으면 "/persona"로 리다이렉트합니다. */}
              <Route path="*" element={<Navigate to="/persona" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DynamicTranslator>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DynamicTranslator>
      </LanguageProvider>
    </AuthProvider>
  );
}