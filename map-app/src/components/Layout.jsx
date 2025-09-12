import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

const navigationItems = [
  { title: "Persona Analysis", url: "/persona" },
  { title: "Result Dashboard", url: "/result" },
  { title: "Itinerary Planner", url: "/itinerary" },
  { title: "Edit Route", url: "/directions" },
  { title: "AI Docent", url: "/docent" },
  { title: "Community", url: "/community" },
  { title: "Vision OCR", url: "/visionocr", exact: true },
  { title: "AI Vision", url: "/vision", exact: true },
];
//환율,닐씨 정보 API 호출 함수(function에서가져오는중)
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
/// 숫자 깜빡이는 효과
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
    const duration = 100; //100ms로 깜박임

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

// Live Info 위젯
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
    const interval = setInterval(fetchAllData, 30 * 1000); //30초 마다 자동 업데이트
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
    <div className="border-t border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="w-full px-4 py-3 flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Live Info</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200/60 hover:text-gray-800 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200/60 hover:text-gray-800 transition-colors"
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
            <div className="text-xs font-medium text-gray-600 mb-2">
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
                        <span className="font-medium text-gray-700">
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
              <div className="text-xs text-gray-500">
                {loading ? "Loading..." : "Failed to load rates"}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">
              Seoul Weather
            </div>
            {weatherData?.summary ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {getWeatherIcon(weatherData.summary.weather)}
                    <span className="text-gray-700">Temp</span>
                  </div>
                  <FlickerNumber
                    value={parseFloat(weatherData.summary.temperature)}
                    formatter={(val) => `${val.toFixed(0)}°C`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-700">Humidity</span>
                  </div>
                  <FlickerNumber
                    value={parseFloat(weatherData.summary.humidity)}
                    formatter={(val) => `${val.toFixed(0)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-700">Wind</span>
                  </div>
                  <FlickerNumber
                    value={parseFloat(weatherData.summary.windSpeed)}
                    formatter={(val) => `${val.toFixed(1)}m/s`}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
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

  const toggleLiveInfo = () =>
    setIsLiveInfoCollapsed((prevState) => !prevState);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-sm border-r border-white/20 flex flex-col transform transition-transform duration-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0`}
      >
        <div className="border-b border-gray-200/50 p-6">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-95 transition-opacity"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <BrandLogo size={40} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                AI Travel Planner
              </h2>
              <p className="text-xs text-gray-500">
                Personalized Travel Planning
              </p>
            </div>
          </Link>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Menu
          </div>
          <nav className="px-2">
            {navigationItems.map((item) => {
              const active = isActive(item.url, item.exact);
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 hover:bg-pink-50 hover:text-pink-700 ${
                    active
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                      : ""
                  }`}
                >
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto">
          <LiveInfoWidget
            isCollapsed={isLiveInfoCollapsed}
            onToggle={toggleLiveInfo}
          />
          <div className="border-t border-gray-200/50 p-6">
            {profile ? (
              <div className="flex items-center gap-3">
                <img
                  src={profile.picture}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-sm">?</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    Welcome, Traveler!
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Plan your trip with AI
                  </p>
                </div>
                <button
                  onClick={() => login()}
                  title="Log In"
                  className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                >
                  <LogIn size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 md:hidden sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
              aria-label="Menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="#444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">AI Travel Planner</h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
