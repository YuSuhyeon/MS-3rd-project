import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import LanguageButtons from "components/ui/LanguageButtons";
import { useAuth } from "context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  LogOut,
  LogIn,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Sun,
  Cloud,
  CloudRain,
  TrendingUp,
  Snowflake,
  TrendingDown,
  RefreshCw,
  Droplets,
  Wind,
  X,
} from "lucide-react";

const getNavigationItems = (t) => [
  { title: t("persona_analysis"), url: "/persona" },
  { title: t("result_dashboard"), url: "/result" },
  { title: t("itinerary_planner"), url: "/itinerary" },
  { title: t("ai_docent"), url: "/docent" },
  { title: t("community"), url: "/social" },
  { title: t("tour"), url: "/tour" },
  { title: t("survival"), url: "/community" },
  { title: t("mypage"), url: "/mypage" },
];

const BannerWidget = () => {
  const banners = [
    { id: 1, image: "../../img/banner1.png" },
    { id: 2, image: "../../img/banner2.png" },
    { id: 3, image: "../../img/banner3.png" },
    { id: 4, image: "../../img/seoul_kdh_policies.jpg" },
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        setIsVisible(true);
      }, 200);
    }, 2000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentBannerIndex];

  return (
    <div className="px-4 pb-4">
      <div
        className={`relative overflow-hidden rounded-xl h-32 transition-opacity duration-300 border border-purple-500/20 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-4 text-white">
          <h3 className="font-bold text-sm leading-tight mb-1 drop-shadow-lg">
            {currentBanner.title}
          </h3>
          <p className="text-xs opacity-90 leading-tight drop-shadow-md">
            {currentBanner.subtitle}
          </p>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentBannerIndex
                  ? "bg-purple-400"
                  : "bg-purple-400/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// API 함수들
const callExchangeRateAPI = async () => {
  const functionUrl =
    "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/ExchangeRateAPI?";
  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("ExchangeRateAPI call error:", error);
    return null;
  }
};

const callWeatherAPI = async () => {
  const functionUrl =
    "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/WeatherAPI?";
  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("WeatherAPI call error:", error);
    return null;
  }
};

const FlickerNumber = ({ value, formatter = (val) => val }) => {
  const [displayValue, setDisplayValue] = useState(formatter(value));
  const animationRef = useRef();

  useEffect(() => {
    if (value === null || value === undefined) {
      setDisplayValue("N/A");
      return;
    }

    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    let animationCounter = 0;
    const totalSteps = 10;
    const duration = 100;

    animationRef.current = setInterval(() => {
      if (animationCounter >= totalSteps) {
        clearInterval(animationRef.current);
        setDisplayValue(formatter(value));
      } else {
        const randomValue = value + (Math.random() - 0.5) * (value / 10);
        setDisplayValue(formatter(randomValue));
        animationCounter++;
      }
    }, duration);

    return () => clearInterval(animationRef.current);
  }, [value, formatter]);

  return <span className="font-mono text-purple-200">{displayValue}</span>;
};

const LiveInfoWidget = ({ isCollapsed, onToggle, t }) => {
  const [exchangeData, setExchangeData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayValues, setDisplayValues] = useState({});

  const UPDATE_INTERVAL = 60 * 60 * 1000;
  const ANIMATION_INTERVAL = 3000;

  const fetchRealData = async () => {
    setLoading(true);
    try {
      const [exchange, weather] = await Promise.all([
        callExchangeRateAPI(),
        callWeatherAPI(),
      ]);
      if (exchange) setExchangeData(exchange);
      if (weather) setWeatherData(weather);
    } catch (error) {
      console.error("❌ API 호출 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const createFlickerEffect = useCallback(() => {
    if (!exchangeData || !weatherData) return;
    setDisplayValues((prev) => {
      const newValues = {};
      if (exchangeData?.exchangeRates) {
        const rates = exchangeData.exchangeRates;
        newValues.USD = rates.USD
          ? {
              ...rates.USD,
              dealRate:
                rates.USD.dealRate * (1 + (Math.random() - 0.5) * 0.002),
            }
          : null;
        newValues.JPY = rates.JPY
          ? {
              ...rates.JPY,
              dealRate:
                rates.JPY.dealRate * (1 + (Math.random() - 0.5) * 0.002),
            }
          : null;
        newValues.CNY = rates.CNH
          ? {
              ...rates.CNH,
              dealRate:
                rates.CNH.dealRate * (1 + (Math.random() - 0.5) * 0.002),
            }
          : null;
      }
      if (weatherData?.summary) {
        newValues.weather = {
          ...weatherData.summary,
          temperature:
            parseFloat(weatherData.summary.temperature) +
            (Math.random() - 0.5) * 2,
          humidity:
            parseFloat(weatherData.summary.humidity) +
            (Math.random() - 0.5) * 4,
          windSpeed:
            parseFloat(weatherData.summary.windSpeed) +
            (Math.random() - 0.5) * 0.6,
        };
      }
      return newValues;
    });
  }, [exchangeData, weatherData]);

  useEffect(() => {
    fetchRealData();
    const realDataInterval = setInterval(fetchRealData, UPDATE_INTERVAL);
    return () => clearInterval(realDataInterval);
  }, []);

  useEffect(() => {
    if (!isCollapsed && (exchangeData || weatherData)) {
      createFlickerEffect();
      const flickerInterval = setInterval(
        createFlickerEffect,
        ANIMATION_INTERVAL
      );
      return () => clearInterval(flickerInterval);
    }
  }, [isCollapsed, exchangeData, weatherData, createFlickerEffect]);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Sun className="w-4 h-4 text-yellow-400" />;
    const lowerCaseCondition = condition.toLowerCase();
    if (
      lowerCaseCondition.includes("sunny") ||
      lowerCaseCondition.includes("clear")
    )
      return <Sun className="w-4 h-4 text-yellow-400" />;
    if (
      lowerCaseCondition.includes("cloud") ||
      lowerCaseCondition.includes("overcast")
    )
      return <Cloud className="w-4 h-4 text-gray-400" />;
    if (lowerCaseCondition.includes("rain"))
      return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (lowerCaseCondition.includes("snow"))
      return <Snowflake className="w-4 h-4 text-blue-300" />;
    return <Sun className="w-4 h-4 text-yellow-400" />;
  };

  const displayExchangeRates = displayValues.USD
    ? {
        USD: displayValues.USD,
        JPY: displayValues.JPY,
        CNY: displayValues.CNY,
      }
    : exchangeData?.exchangeRates
    ? {
        USD: exchangeData.exchangeRates.USD,
        JPY: exchangeData.exchangeRates.JPY,
        CNY: exchangeData.exchangeRates.CNH,
      }
    : null;

  return (
    <div className="border-t border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
      <div className="w-full px-4 py-3 flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            {t("live_info")}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchRealData}
            disabled={loading}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <div className="text-xs font-medium text-purple-300 mb-2">
              {t("exchange_rate_krw")}
            </div>
            {displayExchangeRates ? (
              <div className="space-y-2">
                {Object.entries(displayExchangeRates).map(
                  ([currency, data]) =>
                    data && (
                      <div
                        key={currency}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-purple-200">
                          {currency}
                        </span>
                        <FlickerNumber
                          value={data.dealRate}
                          formatter={(val) => val.toFixed(1)}
                        />
                      </div>
                    )
                )}
              </div>
            ) : (
              <div className="text-xs text-purple-400">
                {loading ? "Loading..." : "Failed to load rates"}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-medium text-purple-300 mb-2">
              {t("seoul_weather")}
            </div>
            {displayValues.weather || weatherData?.summary ? (
              <div className="space-y-2">
                {(() => {
                  const weather = displayValues.weather || weatherData.summary;
                  return (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {getWeatherIcon(weather.weather)}
                          <span className="text-purple-200">{t("temp")}</span>
                        </div>
                        <FlickerNumber
                          value={parseFloat(weather.temperature)}
                          formatter={(val) => `${val.toFixed(0)}°C`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          <span className="text-purple-200">
                            {t("humidity")}
                          </span>
                        </div>
                        <FlickerNumber
                          value={parseFloat(weather.humidity)}
                          formatter={(val) => `${val.toFixed(0)}%`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Wind className="w-3 h-3 text-gray-400" />
                          <span className="text-purple-200">{t("wind")}</span>
                        </div>
                        <FlickerNumber
                          value={parseFloat(weather.windSpeed)}
                          formatter={(val) => `${val.toFixed(1)}m/s`}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-xs text-purple-400">
                {loading ? "Loading..." : "Failed to load weather"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Menu() {
  const location = useLocation();
  const { profile, login, logout } = useAuth();
  const { t } = useTranslation("Navigation");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLiveInfoCollapsed, setIsLiveInfoCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigationItems = getNavigationItems(t);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 모바일 스와이프 제스처 감지
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (!menuOpen && deltaX > 0 && touchStartX < 50) {
          setMenuOpen(true);
        } else if (menuOpen && deltaX < 0) {
          setMenuOpen(false);
        }
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleCloseClick = () => setMenuOpen(false);
  const toggleLiveInfo = () => setIsLiveInfoCollapsed((prev) => !prev);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleDrag = (_, info) => {
    if (isMobile && info.offset.x < -50) {
      setMenuOpen(false);
    }
  };

  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 40 },
    },
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 40 },
    },
  };

  const overlayVariants = {
    closed: { opacity: 0, transition: { duration: 0.2 } },
    open: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      <style jsx>{`
        .neon-menu-toggle {
          position: relative;
          z-index: 10000 !important;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(168, 85, 247, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        @media (min-width: 1024px) {
          .neon-menu-toggle {
            position: fixed;
            top: 16px;
            left: 16px;
          }
        }
        .neon-menu-toggle:hover {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.2),
            rgba(236, 72, 153, 0.2)
          );
          transform: scale(1.05);
        }
        .menu-icon {
          width: 20px;
          height: 20px;
          filter: hue-rotate(270deg) saturate(1.2) brightness(1.1);
          z-index: 2;
          position: relative;
          pointer-events: none;
        }
        .neon-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            45deg,
            #a855f7,
            #ec4899,
            #3b82f6,
            #a855f7
          );
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .neon-menu-toggle:hover .neon-glow {
          opacity: 0.6;
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }
        @keyframes neon-pulse {
          from {
            box-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7;
          }
          to {
            box-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899;
          }
        }
        .neon-sidebar {
          background: linear-gradient(
            180deg,
            rgba(12, 12, 12, 0.95) 0%,
            rgba(26, 10, 46, 0.95) 50%,
            rgba(22, 33, 62, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 0 50px rgba(168, 85, 247, 0.1),
            inset -1px 0 0 rgba(168, 85, 247, 0.1);
          z-index: 9998 !important;
        }
        @media (min-width: 1024px) {
          .neon-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
          }
        }
        .neon-menu-item {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
        }
        .neon-menu-item:hover {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: white;
          transform: translateX(4px);
        }
        .neon-menu-item.active {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.2),
            rgba(236, 72, 153, 0.2)
          );
          border: 1px solid rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
          color: white;
        }
        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        .close-button {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          color: #a855f7;
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(168, 85, 247, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .close-button:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: rgba(168, 85, 247, 0.3);
          color: #ec4899;
          transform: scale(1.05);
        }
        .close-button:active {
          transform: scale(0.95);
        }
      `}</style>

      {/* 햄버거 메뉴 버튼만 반환 */}
      <motion.button
        className="neon-menu-toggle"
        onClick={toggleMenu}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: menuOpen ? "none" : "flex" }}
      >
        <img src="/img/menu_150.png" alt="메뉴" className="menu-icon" />
        <div className="neon-glow" />
      </motion.button>

      {/* 오버레이와 사이드바 */}
      {menuOpen &&
        createPortal(
          <div
            className="menu-portal"
            style={{ position: "fixed", inset: 0, zIndex: 9997 }}
          >
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                variants={overlayVariants}
                initial="closed"
                animate="open"
                exit="closed"
                onClick={() => setMenuOpen(false)}
              />
            </AnimatePresence>

            <motion.aside
              className="fixed inset-y-0 left-0 w-72 neon-sidebar flex flex-col"
              style={{ zIndex: 9998 }}
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              drag={isMobile ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDrag}
              dragElastic={0.1}
            >
              {/* 헤더 영역 */}
              {/* <div className="sidebar-header">
              <div className="flex items-center gap-2">
                <img
                  src="/img/main_logo.png"
                  alt="Klover 로고"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <span className="text-white font-semibold text-lg">Klover</span>
              </div>
              <button
                className="close-button"
                onClick={handleCloseClick}
                type="button"
              >
                <X size={20} />
              </button>
            </div> */}
              {/* 헤더 영역 */}

              {/* 네비게이션 메뉴 */}
              <div className="p-3 flex-1 overflow-y-auto">
                <div className="text-xs font-medium text-purple-400 uppercase tracking-wider px-3 py-2">
                  {t("menu")}
                </div>
                <nav className="px-2">
                  {navigationItems.map((item, index) => {
                    const active = isActive(item.url, item.exact);
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: menuOpen ? 1 : 0,
                          x: menuOpen ? 0 : -20,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: menuOpen ? index * 0.1 : 0,
                        }}
                      >
                        <Link
                          to={item.url}
                          onClick={() => setMenuOpen(false)}
                          className={`neon-menu-item flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
                            active ? "active" : ""
                          }`}
                        >
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <BannerWidget />
              </div>

              {/* 하단: 실시간 정보 + 사용자 프로필 */}
              <div className="mt-auto">
                <LiveInfoWidget
                  isCollapsed={isLiveInfoCollapsed}
                  onToggle={toggleLiveInfo}
                  t={t}
                />

                <div className="border-t border-purple-500/20 p-6">
                  {profile ? (
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={profile.picture}
                        alt={profile.name}
                        className="w-8 h-8 rounded-full border border-purple-400/50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {profile.name}
                        </p>
                        <p className="text-xs text-purple-300 truncate">
                          {profile.email}
                        </p>
                      </div>
                      <button
                        onClick={logout}
                        className="p-2 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                      >
                        <LogOut size={18} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          ?
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {t("welcome_traveler")}
                        </p>
                        <p className="text-xs text-purple-300 truncate">
                          {t("plan_your_trip_with_ai")}
                        </p>
                      </div>
                      <button
                        onClick={() => login()}
                        className="p-2 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                      >
                        <LogIn size={18} />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>,
          document.body
        )}

      {/* 모바일에서 스와이프 힌트 */}
      {isMobile && !menuOpen && (
        <div
          className="fixed left-0 top-1/2 transform -translate-y-1/2 w-1 h-20 bg-gradient-to-b from-transparent via-purple-400/30 to-transparent rounded-r-full"
          style={{ zIndex: 9996 }}
        />
      )}
    </>
  );
}
