import React, { useEffect, useState } from "react";
import { translatePageContent } from "../../integrations/translator";
import { useLanguage } from "../../hooks/useLanguage";
import i18n from "../../i18n";

const SUPPORTED_LANGUAGES = {
  ko: { name: "한국어", flag: "🇰🇷" },
  en: { name: "English", flag: "🇺🇸" },
  ja: { name: "日本語", flag: "🇯🇵" },
  zh: { name: "中文", flag: "🇨🇳" },
  // 필요시 추가
};

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [selected, setSelected] = useState("ko");
  const [loading, setLoading] = useState(false);

  const handleChange = async (code) => {
    if (code === selectedLanguage) return;
    setLoading(true);
    setSelectedLanguage(code);
    try {
      await i18n.changeLanguage(code);
    } catch {}
    await translatePageContent(code);
    setLoading(false);
  };

  useEffect(() => {
    setSelected(selectedLanguage);
  }, [selectedLanguage]);

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}>
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
          <option key={code} value={code}>
            {flag} {name}
          </option>
        ))}
      </select>
      {loading && <span style={{ marginLeft: 8 }}>번역 중...</span>}
    </div>
  );
}
