import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "components/BrandLogo";
import { useAuth } from "context/AuthContext";
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

const navigationItems = [
  { title: "Persona Analysis", url: "/persona" },
  { title: "Result Dashboard", url: "/result" },
  { title: "Itinerary Planner", url: "/itinerary" },
  { title: "AI Docent", url: "/docent" },
  { title: "Community", url: "/community" },
];

// 배너 컴포넌트 (기존과 동일)
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
      subtitle: "배너 테스트3",
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
        className={`relative overflow-hidden rounded-xl h-32 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
        />
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
                index === currentBannerIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// API 호출 함수들 (기존과 동일)
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

// FlickerNumber 컴포넌트 (기존과 동일)
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

  return <span className="font-mono text-gray-800">{displayValue}</span>;
};

// LiveInfoWidget 컴포넌트 (기존과 동일)
const LiveInfoWidget = ({ isCollapsed, onToggle }) => {
  const [exchangeData, setExchangeData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    const [exchange, weather] = await Promise.all([
      callExchangeRateAPI(),
      callWeatherAPI(),
    ]);
    setExchangeData(exchange);
    setWeatherData(weather);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Sun className="w-4 h-4 text-yellow-500" />;
    const lowerCaseCondition = condition.toLowerCase();
    if (
      lowerCaseCondition.includes("sunny") ||
      lowerCaseCondition.includes("clear")
    )
      return <Sun className="w-4 h-4 text-yellow-500" />;
    if (
      lowerCaseCondition.includes("cloud") ||
      lowerCaseCondition.includes("overcast")
    )
      return <Cloud className="w-4 h-4 text-gray-500" />;
    if (lowerCaseCondition.includes("rain"))
      return <CloudRain className="w-4 h-4 text-blue-500" />;
    if (lowerCaseCondition.includes("snow"))
      return <Snowflake className="w-4 h-4 text-blue-300" />;
    return <Sun className="w-4 h-4 text-yellow-500" />;
  };

  const cleanedExchangeRates = exchangeData?.exchangeRates
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
          <span className="text-sm font-medium text-purple-300">Live Info</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
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
              Exchange Rate ({exchangeData?.baseCurrency || "KRW"})
            </div>
            {cleanedExchangeRates ? (
              <div className="space-y-2">
                {Object.entries(cleanedExchangeRates).map(
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
              Seoul Weather
            </div>
            {weatherData?.summary ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {getWeatherIcon(weatherData.summary.weather)}
                    <span className="text-purple-200">Temp</span>
                  </div>
                  <FlickerNumber
                    value={parseFloat(weatherData.summary.temperature)}
                    formatter={(val) => `${val.toFixed(0)}°C`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className="text-purple-200">Humidity</span>
                  </div>
                  <FlickerNumber
                    value={parseFloat(weatherData.summary.humidity)}
                    formatter={(val) => `${val.toFixed(0)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-400" />
                    <span className="text-purple-200">Wind</span>
                  </div>
                  <FlickerNumber
                    value={parseFloat(weatherData.summary.windSpeed)}
                    formatter={(val) => `${val.toFixed(1)}m/s`}
                  />
                </div>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLiveInfoCollapsed, setIsLiveInfoCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
        }

        .neon-menu-item:hover {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(168, 85, 247, 0.3);
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

        .close-button {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          cursor: pointer;
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
        {/* 네온 스타일 토글 버튼 */}
        <motion.button
          className="neon-menu-toggle"
          onClick={toggleMenu}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/img/menu_150.png" alt="메뉴" className="menu-icon" />
          <div className="neon-glow" />
        </motion.button>

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

        {/* 네온 사이드바 */}
        <motion.aside
          className="fixed inset-y-0 left-0 z-50 w-72 neon-sidebar flex flex-col"
          variants={sidebarVariants}
          initial="closed"
          animate={menuOpen ? "open" : "closed"}
        >
          <div className="border-b border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-3 hover:opacity-95 transition-opacity"
                onClick={closeMenu}
              >
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <BrandLogo size={40} />
                </motion.div>
                <div>
                  <h2 className="font-bold text-lg neon-text-primary">
                    AI Travel Planner
                  </h2>
                  <p className="text-xs neon-text-secondary">
                    Personalized Travel Planning
                  </p>
                </div>
              </Link>

              {/* 닫기 버튼 */}
              <motion.button
                className="close-button"
                onClick={closeMenu}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <div className="text-xs font-medium text-purple-400 uppercase tracking-wider px-3 py-2">
              Menu
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
                      className={`neon-menu-item flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-white ${
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
                    title="Log Out"
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
                      Welcome, Traveler!
                    </p>
                    <p className="text-xs neon-text-secondary truncate">
                      Plan your trip with AI
                    </p>
                  </div>
                  <button
                    onClick={() => login()}
                    title="Log In"
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
