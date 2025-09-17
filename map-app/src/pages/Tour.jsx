"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Star,
  Bookmark,
  ShoppingBag,
  Building2,
  Package,
  Search,
  Filter,
  Eye,
} from "lucide-react";
// 목업 데이터 임포트
import {
  tourProducts,
  tourInfoData,
  partnershipData,
} from "../utils/mockTourData";
// 웰컴 팝업
{
  /*
const WelcomePopup = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 relative shadow-2xl border border-purple-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700/50 transition-colors group"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                src="https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400"
                alt="K-Pop Tour"
                className="w-full h-32 object-cover rounded-2xl mb-6 border border-purple-500/30"
              />

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4"
              >
                Welcome to Your K-Pop Adventure!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-300 mb-6 leading-relaxed"
              >
                You're about to explore the magical world of K-Pop! Get ready
                for exclusive experiences and amazing photo opportunities.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>24+ joined today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>4.8★ rating</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <NeonButton onClick={onClose} className="w-full py-4">
                  Start the Journey
                </NeonButton>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; */
}
// NeonTheme 컴포넌트들
const BackgroundEffect = ({ children, className = "" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const waves = [
        {
          amplitude: 40,
          frequency: 0.005,
          speed: 0.01,
          color: "rgba(168, 85, 247, 0.1)", // purple
          yOffset: canvas.height * 0.3,
        },
        {
          amplitude: 60,
          frequency: 0.003,
          speed: 0.008,
          color: "rgba(236, 72, 153, 0.08)", // pink
          yOffset: canvas.height * 0.5,
        },
        {
          amplitude: 30,
          frequency: 0.007,
          speed: 0.012,
          color: "rgba(59, 130, 246, 0.06)", // blue
          yOffset: canvas.height * 0.7,
        },
      ];

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.fillStyle = wave.color;

        const mouseInfluence = Math.sin(mouseX * 0.001) * 20;
        const mouseVertical = (mouseY / canvas.height - 0.5) * 100;

        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
          const y =
            wave.yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * 0.01 + time * 0.005) * 15 +
            mouseInfluence * Math.sin(x * 0.002) +
            mouseVertical * 0.1;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(drawWaves);
    };

    resizeCanvas();
    drawWaves();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={`relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white overflow-hidden ${className}`}
    >
      {/* 물결 캔버스 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ zIndex: 1 }}
      />

      {/* 별 배경 효과 */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 추가 파티클 효과 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, 
                rgba(168, 85, 247, 0.6), 
                rgba(236, 72, 153, 0.4)
              )`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const NeonCard = ({
  children,
  delay = 0.2,
  className = "",
  variant = "default",
  ...props
}) => {
  const variants = {
    default:
      "border-purple-500/30 hover:border-pink-500/50 hover:shadow-pink-500/20",
    primary:
      "border-blue-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20",
    success:
      "border-green-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/20",
    warning:
      "border-yellow-500/30 hover:border-orange-500/50 hover:shadow-orange-500/20",
    danger:
      "border-red-500/30 hover:border-rose-500/50 hover:shadow-rose-500/20",
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg
                  border ${variants[variant]} rounded-2xl p-6 shadow-2xl
                  hover:shadow-2xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      {...props}
    >
      {/* 네온 글로우 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-2xl blur-xl" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

const NeonButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) => {
  const variants = {
    primary:
      "from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/25",
    secondary:
      "from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-gray-500/25",
    success:
      "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-500/25",
    warning:
      "from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-yellow-500/25",
    danger:
      "from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-500/25",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-gradient-to-r ${variants[variant]}
        ${sizes[size]}
        font-semibold text-white rounded-xl
        shadow-lg hover:shadow-xl
        transform transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  );
};

// TourCard 컴포넌트 (네온 테마 적용)
const TourCard = ({ item, onDetailClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryInfo = (category) => {
    switch (category) {
      case "location":
        return {
          emoji: "📍",
          label: "Location",
          gradient: "from-purple-500 to-pink-500",
        };
      case "goods":
        return {
          emoji: "🛍️",
          label: "Shopping",
          gradient: "from-pink-500 to-fuchsia-500",
        };
      case "experience":
        return {
          emoji: "🎭",
          label: "Experience",
          gradient: "from-indigo-500 to-purple-500",
        };
      case "food":
        return {
          emoji: "🍜",
          label: "Food",
          gradient: "from-orange-500 to-pink-500",
        };
      case "it":
        return {
          emoji: "🖥️",
          label: "IT",
          gradient: "from-blue-500 to-pink-500",
        };
      case "sports":
        return {
          emoji: "⚾",
          label: "sports",
          gradient: "from-blue-500 to-pink-500",
        };
      case "beauty":
        return {
          emoji: "💄",
          label: "Beauty",
          gradient: "from-pink-500 to-rose-500",
        };
      case "culture":
        return {
          emoji: "🏛️",
          label: "Culture",
          gradient: "from-purple-500 to-indigo-500",
        };
      case "adventure":
        return {
          emoji: "🏔️",
          label: "Adventure",
          gradient: "from-emerald-500 to-teal-500",
        };
      case "entertainment":
        return {
          emoji: "🎢",
          label: "Entertainment",
          gradient: "from-yellow-500 to-orange-500",
        };
      default:
        return {
          emoji: "🎵",
          label: "play",
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
      className="bg-gradient-to-br from-gray-900/90 to-black/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden hover:shadow-pink-500/20 hover:shadow-2xl hover:border-pink-500/50 group transition-all duration-300"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryInfo.gradient} backdrop-blur-sm border border-white/20 shadow-lg`}
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
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 border ${
              isBookmarked
                ? "bg-yellow-500 text-white shadow-lg border-yellow-400/50 shadow-yellow-500/25"
                : "bg-white/10 text-white hover:bg-white/20 border-white/20"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-white text-sm bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{item.rating}</span>
            </div>
            <span className="text-sm text-gray-400">리뷰 {item.reviews}개</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* <div className="flex items-center gap-2 mb-3">
          {/* <span className="text-sm font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {item.kpopGroup}
          </span> 
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-400">리뷰 {item.reviews}개</span>
        </div> */}

        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
          {item.title}
        </h3>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        {item.location && (
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{item.location}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full hover:bg-gray-700/50 transition-colors border border-gray-600/50"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {item.price}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2 rounded-xl transition-all duration-200 border ${
                isLiked
                  ? "bg-red-500/20 text-red-400 shadow-md border-red-500/50"
                  : "hover:bg-gray-800/50 text-gray-400 border-gray-600/50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <NeonButton
              onClick={() => onDetailClick(item)}
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              자세히 보기
            </NeonButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

//TourInfo 컴포넌트
const TourInfoSection = () => {
  return <NeonCard></NeonCard>;
};
// PartnershipSection 컴포넌트
const PartnershipSection = () => {
  return (
    <NeonCard className="mb-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
            기업 제휴 파트너
          </h2>
          <p className="text-gray-300">신뢰할 수 있는 파트너사</p>
        </div>
      </div>
      {/* 캐러셀 효과로 파트너십 보여주기 */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex space-x-8"
          animate={{
            x: [0, -200 * partnershipData.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: partnershipData.length * 4,
              ease: "linear",
            },
          }}
        >
          {/* 원본 + 복사본으로 무한 스크롤 */}
          {[...partnershipData, ...partnershipData].map((partner, index) => (
            <motion.div
              key={`partner-${index}`}
              whileHover={{ scale: 1.1, y: -8 }}
              className="flex-shrink-0 w-40 text-center group"
              style={{ minWidth: "160px" }}
            >
              {/* 로고만 깔끔하게 - 네온 테마 */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10 group-hover:shadow-xl group-hover:shadow-purple-500/20 group-hover:scale-110 transition-all duration-300 border border-gray-100">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name || partner.category}
                    className="max-w-12 max-h-12 object-contain"
                    style={{
                      filter: "brightness(1.3) contrast(1.2)",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`text-white font-bold text-xl ${
                    partner.logo ? "hidden" : "flex"
                  }`}
                >
                  {(partner.name || partner.category || "P")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>

              {/* 텍스트만 깔끔하게 - 네온 테마 */}
              <h3 className="font-bold text-white mb-1 text-lg group-hover:text-purple-300 transition-colors duration-300">
                {partner.name || partner.category}
              </h3>
              <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {partner.category}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 좌우 페이드 효과 - 네온 테마 */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-900/90 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-900/90 to-transparent pointer-events-none z-10" />
      </div>
    </NeonCard>
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
    <BackgroundEffect className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight mb-4">
              특별한 여행 경험을 만나보세요
            </h1>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-12 pr-8 py-4 rounded-2xl border border-purple-500/30 bg-gray-900/80 backdrop-blur-sm focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all text-white appearance-none cursor-pointer shadow-lg"
                >
                  <option value="all">전체 </option>
                  <option value="location">촬영지</option>
                  <option value="goods">굿즈</option>
                  <option value="experience">체험</option>
                  <option value="food">먹방</option>
                </select>
              </div>
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="상품 검색..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-purple-500/30 bg-gray-900/80 backdrop-blur-sm focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all text-white placeholder-gray-400 shadow-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        {/* Tour Products Section */}
        <NeonCard className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                인기 투어 상품
              </h2>
              <p className="text-gray-300">
                제휴된 파트너사와 함께하는 프리미엄 상품
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
              <div className="w-20 h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600/50">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-300">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </motion.div>
          )}
        </NeonCard>
        {/* TourInfo Section
        <TourInfoSection /> */}
        {/* Partnership Section */}
        <PartnershipSection />
      </div>
    </BackgroundEffect>
  );
}
