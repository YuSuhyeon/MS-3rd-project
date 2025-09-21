import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import useIsMobile from "../../pages/useIsMobile";

const LanguageButtons = ({ className = "" }) => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "ko", name: "한국어", flag: "/KR.png" },
    { code: "en", name: "English", flag: "/GB.png" },
    { code: "ja", name: "日本語", flag: "/JP.png" },
    { code: "zh", name: "中文", flag: "/CN.png" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === language) || languages[0];

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      {/* 드롭다운 버튼 - 통일된 40px 높이 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 h-10 px-3 text-sm font-medium text-white rounded-lg border border-purple-500/30 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        style={{
          background:
            "linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
        }}
        whileHover={{
          scale: 1.05,
          background:
            "linear-gradient(145deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
        }}
        whileTap={{ scale: 0.98 }}
      >
        <img
          src={currentLanguage.flag}
          alt={`${currentLanguage.name} flag`}
          className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
        />
        <span className="hidden sm:block text-sm">{currentLanguage.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 opacity-70" />
        </motion.div>
      </motion.button>

      {/* 드롭다운 메뉴 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className={`absolute ${
              useIsMobile ? "" : "right-0"
            } mt-2 w-48 origin-top-right rounded-xl border border-purple-500/20 shadow-2xl ring-1 ring-black ring-opacity-5 z-50`}
            style={{
              background:
                "linear-gradient(180deg, rgba(12, 12, 12, 0.95) 0%, rgba(26, 10, 46, 0.95) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="p-1">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`${
                    language === lang.code
                      ? "bg-purple-600/30 text-purple-100"
                      : "text-gray-300 hover:bg-purple-600/20 hover:text-purple-200"
                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={lang.flag}
                    alt={`${lang.name} flag`}
                    className="w-5 h-4 object-cover rounded-sm mr-3 flex-shrink-0"
                  />
                  <span>{lang.name}</span>
                  {language === lang.code && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-purple-400 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageButtons;
