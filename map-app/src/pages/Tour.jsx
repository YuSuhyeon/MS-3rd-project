"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Star,
  Bookmark,
  ShoppingBag,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Building2,
  Package,
  Search,
  Filter,
  Eye,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// 목업 데이터 임포트
import { tourProducts, partnershipData } from "../utils/mockTourData";

// API 호출 함수들
const callExchangeRateAPI = async () => {
  const functionUrl =
    "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/ExchangeRateAPI";

  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("환율 API 호출 오류:", error);
    throw error;
  }
};

const callWeatherAPI = async () => {
  const functionUrl =
    "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/WeatherAPI?";
  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("날씨 API 호출 오류:", error);
    throw error;
  }
};

// 실시간 정보 표시 컴포넌트
const LiveInfoBar = () => {
  const [exchangeData, setExchangeData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [exchangeResult, weatherResult] = await Promise.all([
        callExchangeRateAPI(),
        callWeatherAPI(),
      ]);

      setExchangeData(exchangeResult);
      setWeatherData(weatherResult);
      setLastUpdated(new Date());
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // 5분마다 데이터 갱신
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "cloudy":
      case "overcast":
        return <Cloud className="w-5 h-5 text-gray-500" />;
      case "rain":
      case "rainy":
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      default:
        return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">실시간 정보 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">데이터 로딩 실패: {error}</span>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs">재시도</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 환율 정보 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-300" />
              <div className="text-sm">
                <span className="font-semibold">USD/KRW: </span>
                {exchangeData?.rate ? (
                  <span className="text-green-200">
                    {typeof exchangeData.rate === "number"
                      ? exchangeData.rate.toLocaleString()
                      : exchangeData.rate}
                    원
                  </span>
                ) : (
                  <span className="text-gray-300">1,300원</span>
                )}
              </div>
            </div>

            {exchangeData?.change && (
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  exchangeData.change > 0
                    ? "bg-green-500/20 text-green-200"
                    : "bg-red-500/20 text-red-200"
                }`}
              >
                {exchangeData.change > 0 ? "+" : ""}
                {exchangeData.change}%
              </div>
            )}
          </div>

          {/* 날씨 정보 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weatherData?.condition)}
              <div className="text-sm">
                <span className="font-semibold">서울: </span>
                {weatherData?.temperature ? (
                  <span className="text-blue-200">
                    {weatherData.temperature}°C
                  </span>
                ) : (
                  <span className="text-gray-300">22°C</span>
                )}
              </div>
            </div>

            {weatherData?.humidity && (
              <div className="flex items-center gap-1 text-xs">
                <Droplets className="w-3 h-3 text-blue-300" />
                <span className="text-blue-200">{weatherData.humidity}%</span>
              </div>
            )}

            {weatherData?.wind && (
              <div className="flex items-center gap-1 text-xs">
                <Wind className="w-3 h-3 text-gray-300" />
                <span className="text-gray-200">{weatherData.wind}m/s</span>
              </div>
            )}
          </div>

          {/* 새로고침 및 업데이트 시간 */}
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-white/70">
                {lastUpdated.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                업데이트
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// TourCard 컴포넌트
const TourCard = ({ item, onDetailClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryInfo = (category) => {
    switch (category) {
      case "location":
        return {
          emoji: "📍",
          label: "촬영지",
          gradient: "from-purple-500 to-pink-500",
        };
      case "goods":
        return {
          emoji: "🛍️",
          label: "굿즈",
          gradient: "from-pink-500 to-fuchsia-500",
        };
      case "experience":
        return {
          emoji: "🎭",
          label: "체험",
          gradient: "from-indigo-500 to-purple-500",
        };
      case "food":
        return {
          emoji: "🍜",
          label: "먹방",
          gradient: "from-orange-500 to-pink-500",
        };
      default:
        return {
          emoji: "🎵",
          label: "기타",
          gradient: "from-gray-500 to-gray-600",
        };
    }
  };

  const categoryInfo = getCategoryInfo(item.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl group"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryInfo.gradient} backdrop-blur-sm`}
          >
            {categoryInfo.emoji} {categoryInfo.label}
          </span>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isBookmarked
                ? "bg-yellow-500 text-white shadow-lg"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm font-medium">
              {item.partnership}
            </span>
            <div className="flex items-center gap-1 text-white text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{item.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {item.kpopGroup}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-500">리뷰 {item.reviews}개</span>
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {item.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        {item.location && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{item.location}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">ROI</div>
            <div className="text-sm font-bold text-green-600">{item.roi}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">신규고객</div>
            <div className="text-sm font-bold text-blue-600">
              {item.newCustomers}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">브랜드가치</div>
            <div className="text-sm font-bold text-purple-600">
              {item.brandValue}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {item.price}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isLiked
                  ? "bg-red-50 text-red-500 shadow-md"
                  : "hover:bg-gray-50 text-gray-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => onDetailClick(item)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
            >
              <Eye className="w-4 h-4" />
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// PartnershipSection 컴포넌트
const PartnershipSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            기업 제휴 파트너
          </h2>
          <p className="text-gray-600">
            신뢰할 수 있는 파트너사와의 전략적 협업
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {partnershipData.map((partner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <img
                  src={partner.logo || "/placeholder.svg"}
                  alt={partner.name}
                  className="h-10 w-auto"
                />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{partner.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{partner.category}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상품</span>
                  <span className="font-semibold">{partner.products}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">매출</span>
                  <span className="font-bold text-purple-600">
                    {partner.revenue}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">성장률</span>
                  <span className="font-bold text-green-600">
                    {partner.growth}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// BusinessMetrics 컴포넌트
const BusinessMetrics = () => {
  const metrics = [
    {
      icon: TrendingUp,
      label: "총 매출 증가율",
      value: "+285%",
      description: "전년 대비 매출 성장",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      label: "신규 고객 유입",
      value: "7,394명",
      description: "월평균 신규 가입자",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Award,
      label: "브랜드 인지도",
      value: "+42%",
      description: "브랜드 가치 상승률",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: DollarSign,
      label: "평균 ROI",
      value: "298%",
      description: "마케팅 투자 대비 수익",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <TrendingUp className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            비즈니스 성과
          </h2>
          <p className="text-gray-600">데이터 기반 마케팅 효과 분석</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {metric.label}
                </h3>
                <div
                  className={`text-3xl font-bold bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}
                >
                  {metric.value}
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// 메인 Tour 컴포넌트
export default function Tour() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const navigate = useNavigate();

  const handleDetailClick = (item) => {
    navigate(`/tour/${item.id}`);
  };

  const filteredProducts = tourProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* 실시간 정보 바 */}
      <LiveInfoBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(1200px 600px at 80% 10%, rgba(124,58,237,0.18), transparent 60%), " +
              "radial-gradient(900px 500px at 0% 100%, rgba(236,72,153,0.12), transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              K-lover 투어
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8">
              한류와 함께하는 특별한 여행 경험을 만나보세요
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="상품 검색..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-12 pr-8 py-4 rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="all">전체 카테고리</option>
                  <option value="location">촬영지</option>
                  <option value="goods">굿즈</option>
                  <option value="experience">체험</option>
                  <option value="food">먹방</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tour Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                인기 투어 상품
              </h2>
              <p className="text-gray-600">
                검증된 파트너사와 함께하는 프리미엄 상품
              </p>
            </div>
          </div>

          {/* Tour Cards Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-8 mb-8">
              <AnimatePresence>
                {filteredProducts.map((item) => (
                  <TourCard
                    key={item.id}
                    item={item}
                    onDetailClick={handleDetailClick}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Partnership Section */}
        <PartnershipSection />

        {/* Business Metrics Section */}
        <BusinessMetrics />
      </div>
    </div>
  );
}
