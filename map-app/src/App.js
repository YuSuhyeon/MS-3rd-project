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
import ItineraryView from "./pages/ItineraryView";
import DocentMantine from "./pages/DocentMantine";
import DirectionsMantine from "./pages/DirectionsMantine";
import Landing from "./pages/Landing";
import "./styles/layout.css";
import VisionOCR from "./pages/VisionOCR";
import CommunityMain from "./pages/CommunityMain";
import LanguageSelector from "./components/ui/LanguageSelector";

import { useEffect } from "react";
import {
  translatePageContent,
  startAutoTranslate,
  stopAutoTranslate,
  setObserverLanguage,
} from "./integrations/translator";
import { useLanguage, LanguageProvider } from "./hooks/useLanguage";

function AppRoutes() {
  const location = useLocation();

  // Landing page without app layout
  if (location.pathname === "/") {
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
        <Route path="/vision-ocr" element={<VisionOCR />} />
        <Route path="/community" element={<CommunityMain />} />
        <Route path="*" element={<Navigate to="/persona" replace />} />
      </Routes>
    </Layout>
  );
}

// Router 내부에서 useLocation, useLanguage 사용
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppWithTranslation />
        <LanguageSelector />
      </BrowserRouter>
    </LanguageProvider>
  );
}

function AppWithTranslation() {
  const location = useLocation();
  const { selectedLanguage } = useLanguage();

  useEffect(() => {
    // i18n이 구현되었으므로 Azure Translator 호출을 최소화
    // 동적 DOM 변경 자동 번역은 유지하되, 디바운스 시간을 늘림
    startAutoTranslate(selectedLanguage);
    
    // 페이지 이동 시에만 한 번 번역 (i18n으로 대부분 처리되므로)
    if (selectedLanguage !== "ko") {
      const timer = setTimeout(() => {
        translatePageContent(selectedLanguage);
      }, 1000); // 디바운스 시간 증가
      return () => {
        clearTimeout(timer);
        stopAutoTranslate();
      };
    }
    
    return () => {
      stopAutoTranslate();
    };
  }, [location, selectedLanguage]);

  useEffect(() => {
    // 언어 변경 시 옵저버에도 반영
    setObserverLanguage(selectedLanguage);
  }, [selectedLanguage]);

  return <AppRoutes />;
}

export default App;
