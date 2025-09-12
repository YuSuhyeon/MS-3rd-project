import { useState, useContext, createContext, useEffect } from "react";

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

  useEffect(() => {
    try {
      localStorage.setItem("app.language", selectedLanguage);
    } catch (e) {}
  }, [selectedLanguage]);

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 커스텀 훅
export function useLanguage() {
  return useContext(LanguageContext);
}
