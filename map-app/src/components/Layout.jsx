import React, { useState, useEffect, useRef, useCallback } from "react";

import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "components/BrandLogo";
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
  { title: t("community"), url: "/social" }, //community main 에서 social로 이동
  { title: t("tour"), url: "/tour" },
  { title: t("survival"), url: "/community" },
];

// 배너 컴포넌트
const BannerWidget = () => {
  const banners = [
    {
      id: 1,
      image: "../../img/seoul_kdh_policies.jpg",
      title: "배너타이틀",
      subtitle: "배너 테스트",
    },
    {
      id: 2,
      image: "../../img/seoul_kdh_policies_1.jpg",
      title: "배너타이틀1",
      subtitle: "배너 테스트1",
    },
    {
      id: 3,
      image: "../../img/seoul_kdh_policies_2.jpg",
      title: "배너타이틀2",
      subtitle: "배너 테스트2",
    },
    {
      id: 4,
      image: "../../img/seoul_kdh_policies_3.jpg",
      title: "배너타이틀3",
      subtitle: "배너 테스트3",
    },
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

// API 호출 함수들
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

// FlickerNumber 컴포넌트 (네온 테마 적용)
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
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [displayValues, setDisplayValues] = useState({});

  // 1시간 = 3600000ms
  const UPDATE_INTERVAL = 60 * 60 * 1000; // 1시간
  const ANIMATION_INTERVAL = 3000; // 3초마다 애니메이션

  // 실제 API 호출
  const fetchRealData = async () => {
    console.log("🔄 실제 API 데이터 가져오는 중...");
    setLoading(true);

    try {
      const [exchange, weather] = await Promise.all([
        callExchangeRateAPI(),
        callWeatherAPI(),
      ]);

      if (exchange) {
        setExchangeData(exchange);
        console.log("✅ 환율 데이터 업데이트 완료");
      }

      if (weather) {
        setWeatherData(weather);
        console.log("✅ 날씨 데이터 업데이트 완료");
      }

      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error("❌ API 호출 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 가짜 변동 효과 (실제 데이터는 유지하면서 살짝만 변경)
  const createFlickerEffect = useCallback(() => {
    if (!exchangeData || !weatherData) return;

    setDisplayValues((prev) => {
      const newValues = {};

      // 환율 변동 효과 (±0.1% 범위)
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

      // 날씨 변동 효과 (±1도, ±2% 습도, ±0.3m/s 풍속)
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

  // 초기 로드 및 1시간마다 실제 데이터 가져오기
  useEffect(() => {
    fetchRealData();
    const realDataInterval = setInterval(fetchRealData, UPDATE_INTERVAL);
    return () => clearInterval(realDataInterval);
  }, []);

  // 3초마다 가짜 변동 효과
  useEffect(() => {
    if (!isCollapsed && (exchangeData || weatherData)) {
      createFlickerEffect(); // 초기 설정
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

  // 표시할 환율 데이터 (가짜 변동 효과 적용)
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
            //title={`${t("refresh_data")} (${getUpdateStatus()})`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
            title={isCollapsed ? t("expand") : t("collapse")}
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

export default function Layout({ children }) {
  const location = useLocation();
  const { profile, login, logout } = useAuth();
  const { t } = useTranslation("Navigation");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLiveInfoCollapsed, setIsLiveInfoCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigationItems = getNavigationItems(t);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleLiveInfo = () =>
    setIsLiveInfoCollapsed((prevState) => !prevState);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // 사이드바 애니메이션 variants
  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
  };

  // 오버레이 애니메이션
  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <>
      <style jsx>{`
        .layout-container {
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0c0c0c 0%,
            #1a0a2e 50%,
            #16213e 100%
          );
        }

        .neon-menu-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 12px;
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
          position: relative;
          overflow: hidden;
        }

        .menu-icon {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
          z-index: 2;
          position: relative;
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
          border-radius: 12px;
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
        }

        .neon-text-primary {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .neon-text-secondary {
          color: rgba(255, 255, 255, 0.6);
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

        .neon-border {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0%;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          transition: width 0.3s ease;
        }

        .neon-menu-item:hover .neon-border {
          width: 100%;
        }

        // .close-button {
        //   background: rgba(239, 68, 68, 0.1);
        //   border: 1px solid rgba(239, 68, 68, 0.3);
        //   border-radius: 8px;
        //   width: 32px;
        //   height: 32px;
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   color: #ef4444;
        //   cursor: pointer;
        // }

        .language-buttons-container {
          padding: 12px 20px;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        }

        @media (max-width: 767px) {
          .neon-menu-toggle {
            top: 15px;
            left: 15px;
            width: 45px;
            height: 45px;
          }
        }
      `}</style>

      <div className="layout-container flex w-full">
        {/* 네온 스타일 토글 버튼 - 메뉴가 닫혔을 때만 표시 */}
        {!menuOpen && (
          <motion.button
            className="neon-menu-toggle"
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/img/menu_150.png" alt="메뉴" className="menu-icon" />
            <div className="neon-glow" />
          </motion.button>
        )}

        {/* 오버레이 */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={closeMenu}
            />
          )}
        </AnimatePresence>

        {/* left side bar menu */}
        <motion.aside
          className="fixed inset-y-0 left-0 z-50 w-72 neon-sidebar flex flex-col"
          variants={sidebarVariants}
          initial="closed"
          animate={menuOpen ? "open" : "closed"}
        >
          {/* 언어 - 메뉴 닫기 */}
          <div className="language-buttons-container">
            <div className="flex items-center justify-between">
              <LanguageButtons />
              <button
                onClick={closeMenu}
                className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                title="메뉴 닫기"
              >
                <X size={20} />
              </button>
            </div>
          </div>

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
                      onClick={closeMenu}
                      className={`neon-menu-item flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
                        active ? "active" : ""
                      }`}
                    >
                      <span className="font-medium">{item.title}</span>
                      <div className="neon-border" />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="mt-6">
              <BannerWidget />
            </div>
          </div>

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
                    className="w-8 h-8 rounded-full border-2 border-purple-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      {profile.name}
                    </p>
                    <p className="text-xs neon-text-secondary truncate">
                      {profile.email}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    title={t("log_out")}
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
                    <span className="text-white font-medium text-sm">?</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      {t("welcome_traveler")}
                    </p>
                    <p className="text-xs neon-text-secondary truncate">
                      {t("plan_your_trip_with_ai")}
                    </p>
                  </div>
                  <button
                    onClick={() => login()}
                    title={t("log_in")}
                    className="p-2 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                  >
                    <LogIn size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* 메인 콘텐츠 */}
        <motion.main
          className="flex-1 flex flex-col"
          animate={{
            marginLeft: !isMobile && menuOpen ? "288px" : "0px",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 40,
          }}
        >
          <div className="flex-1 overflow-auto">
            <div
              className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"
              style={{ paddingTop: "80px" }}
            >
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </>
  );
}
