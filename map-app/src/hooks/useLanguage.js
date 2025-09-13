import { useState, useContext, createContext, useEffect } from "react";
import i18n from "../i18n";
import { translateDynamicContent, markStaticContent } from "../integrations/translator";

// Context 생성
const LanguageContext = createContext();

// Provider 컴포넌트
export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem("app.language");
      return saved || "ko";
    } catch (e) {
      return "ko";
    }
  }); // 기본값: 한국어

  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("app.language", selectedLanguage);
      
      // 하이브리드 번역 로직
      const handleLanguageChange = async () => {
        // 1. i18n 언어 변경 (정적 텍스트 번역)
        await i18n.changeLanguage(selectedLanguage);
        
        // 2. 정적 콘텐츠 마킹 (번역 제외)
        markStaticContent();
        
        // 3. 동적 콘텐츠 번역 (Azure API 사용) - 메뉴 정보 제외
        setIsTranslating(true);
        try {
          await translateDynamicContent(selectedLanguage);
        } finally {
          setIsTranslating(false);
        }
      };
      
      handleLanguageChange();
    } catch (e) {
      console.error("Language change error:", e);
      setIsTranslating(false);
    }
  }, [selectedLanguage]);

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 커스텀 훅
export function useLanguage() {
  return useContext(LanguageContext);
}
