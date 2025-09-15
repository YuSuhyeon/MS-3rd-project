import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const LanguageButtons = ({ className = "" }) => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: "ko", name: "한국어", flag: "/KR.png" },
    { code: "en", name: "English", flag: "/GB.png" },
    { code: "ja", name: "日本語", flag: "/JP.png" },
    { code: "zh", name: "中文", flag: "/CN.png" },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`transition-all duration-200 ${
            language === lang.code
              ? "border-2 border-purple-400 scale-110 shadow-lg shadow-purple-400/50 ring-2 ring-purple-400/30"
              : "border border-white/20 hover:scale-105 hover:border-white/40"
          }`}
          style={{
            width: "32px",
            height: "24px",
            borderRadius: lang.code === "ko" ? "4px" : "2px",
          }}
          whileHover={{ scale: language === lang.code ? 1.1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={lang.name}
        >
          <img
            src={lang.flag}
            alt={`${lang.name} flag`}
            className="w-full h-full object-cover"
            style={{
              borderRadius: lang.code === "ko" ? "4px" : "2px",
            }}
          />
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageButtons;
