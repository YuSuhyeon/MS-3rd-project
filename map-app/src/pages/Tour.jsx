import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// 언어 버튼은 상위 Layout에서 관리되므로 여기서는 불필요
// NeonTheme 컴포넌트들을 import
import {
  BackgroundEffect,
  NeonCard,
  NeonButton,
  GradientText,
} from "../components/ui/NeonTheme";

// 목업 데이터 임포트
import {
  tourProducts,
  tourInfoData,
  partnershipData,
} from "../utils/mockTourData";

// localStorage 서비스
const LikedProductsService = {
  STORAGE_KEY: "liked_travel_products",
  getLikedProducts() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("좋아요한 상품 로드 오류:", error);
      return [];
    }
  },
  addLikedProduct(product) {
    try {
      const likedProducts = this.getLikedProducts();
      const isAlreadyLiked = likedProducts.some((p) => p.id === product.id);
      if (!isAlreadyLiked) {
        likedProducts.push(product);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(likedProducts));
        return true;
      }
      return false;
    } catch (error) {
      console.error("좋아요 추가 오류:", error);
      return false;
    }
  },
  removeLikedProduct(productId) {
    try {
      const likedProducts = this.getLikedProducts();
      const filteredProducts = likedProducts.filter((p) => p.id !== productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProducts));
      return true;
    } catch (error) {
      console.error("좋아요 제거 오류:", error);
      return false;
    }
  },
  isLiked(productId) {
    const likedProducts = this.getLikedProducts();
    return likedProducts.some((p) => p.id === productId);
  },
};

// getCategoryInfo 함수
const getCategoryInfo = (t, category) => {
  switch (category) {
    case "location":
      return {
        emoji: "📍",
        label: "Filming",
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

    case "it":
      return {
        emoji: "🖥️",
        label: "IT",
        gradient: "from-blue-500 to-cyan-500",
      };
    case "sports":
      return {
        emoji: "⚾",
        label: "sports",
        gradient: "from-green-500 to-blue-500",
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
        label: "History",
        gradient: "from-purple-500 to-indigo-500",
      };

    default:
      return {
        emoji: "🎵",
        label: t("category.etc"),
        gradient: "from-gray-500 to-gray-600",
      };
  }
};

// 모바일 최적화된 TourCard 컴포넌트
const MobileTourCard = ({ item, onDetailClick }) => {
  const { t, i18n: i18nextInstance } = useTranslation("tour", {
    useSuspense: false,
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    i18nextInstance.loadNamespaces(["tour"]);
  }, [i18nextInstance]);

  // 언어 변경 시에도 tour 네임스페이스 보장 로드
  useEffect(() => {
    i18nextInstance.loadNamespaces(["tour"]);
  }, [i18nextInstance.language]);

  useEffect(() => {
    setIsLiked(LikedProductsService.isLiked(item.id));
  }, [item.id]);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (isLiked) {
      if (LikedProductsService.removeLikedProduct(item.id)) {
        setIsLiked(false);
      }
    } else {
      if (LikedProductsService.addLikedProduct(item)) {
        setIsLiked(true);
      }
    }
  };

  const categoryInfo = getCategoryInfo(t, item.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-xl border border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 hover:border-pink-500/50 group transition-all duration-300 cursor-pointer h-full"
      onClick={() => onDetailClick(item)}
    >
      {/* 모바일 최적화 이미지 섹션 */}
      <div className="relative h-44 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute top-1.5 left-1.5">
          <span
            className={`px-1.5 py-0.5 bg-gradient-to-r ${categoryInfo.gradient} text-white text-xs font-semibold rounded-full backdrop-blur-sm shadow-lg`}
          >
            {categoryInfo.emoji}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className={`absolute top-1.5 right-1.5 p-1 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isBookmarked
              ? "bg-yellow-500 text-white shadow-lg"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          <Bookmark size={12} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {item.kpopGroup && (
          <div className="absolute bottom-1.5 left-1.5">
            <span className="text-white text-xs font-medium bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {item.kpopGroup}
            </span>
          </div>
        )}
      </div>

      {/* 모바일 최적화 컨텐츠 섹션 */}
      <div className="p-2.5 sm:p-3 md:p-4 space-y-1.5 flex flex-col justify-between flex-1">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
            {item.title}
          </h3>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            {/* 위치: 좌측 */}
            <div className="flex items-center gap-1 text-gray-400 min-w-0">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">{item.location}</span>
            </div>
            {/* 평점: 우측 */}
            <div className="flex items-center gap-1 text-gray-300 flex-shrink-0 ml-2">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating || "4.5"}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex gap-1">
            {item.tags?.slice(0, 1).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-gray-800/80 text-gray-400 text-xs rounded-full border border-gray-700 truncate"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {item.price}
            </span>
            <button
              onClick={handleLikeClick}
              className={`p-1 rounded transition-all duration-200 ${
                isLiked
                  ? "bg-red-500/20 text-red-400"
                  : "hover:bg-gray-800/80 text-gray-500 hover:text-gray-300"
              }`}
            >
              <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
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
      <div className="relative overflow-hidden">
        <motion.div
          className="flex space-x-8"
          animate={{ x: [0, -200 * partnershipData.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: partnershipData.length * 4,
              ease: "linear",
            },
          }}
        >
          {[...partnershipData, ...partnershipData].map((partner, index) => (
            <motion.div
              key={`partner-${index}`}
              whileHover={{ scale: 1.1, y: -8 }}
              className="flex-shrink-0 w-40 text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name || partner.category}
                    className="max-w-14 max-h-14 object-contain"
                    onError={(e) => {
                      console.log("Image failed to load:", partner.logo);
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "block";
                    }}
                  />
                ) : null}
                <div
                  className={`text-purple-600 font-bold text-xl ${
                    partner.logo ? "hidden" : "block"
                  }`}
                >
                  {(partner.name || partner.category).charAt(0).toUpperCase()}
                </div>
              </div>
              <h3 className="font-bold text-white mb-1">
                {partner.name || partner.category}
              </h3>
              <p className="text-sm text-gray-400">{partner.category}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </NeonCard>
  );
};

// 메인 Tour 컴포넌트 - 모바일 최적화 적용
export default function Tour() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = isMobile ? 3 : 2; // 모바일 3개, 데스크톱 2개씩 표시
  // 컴포넌트 마운트 시 세션 스토리지 정리
  useEffect(() => {
    // URL이 직접 /tour로 접근한 경우 세션 스토리지 정리
    if (
      window.location.pathname === "/tour" &&
      !sessionStorage.getItem("previousPage")
    ) {
      sessionStorage.removeItem("previousPage");
      sessionStorage.removeItem("previousPageTitle");
    }
  }, []);

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

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 카테고리 배열
  const categories = [
    { value: "all", label: "All", emoji: "🌟" },
    //{ value: "entertainment", label: "Entertainment", emoji: "🎢" },
    // { value: "location", label: "Filming", emoji: "📍" },
    { value: "experience", label: "Experience", emoji: "🎭" },
    { value: "it", label: "IT", emoji: "🖥️" },
    { value: "sports", label: "Sports", emoji: "⚾" },
    { value: "beauty", label: "Beauty", emoji: "💄" },
    { value: "culture", label: "History", emoji: "🏛️" },

    // { value: "goods", label: "Shopping", emoji: "🛍️" },
    // { value: "food", label: "MeokBang", emoji: "🍜" },
    //  { value: "adventure", label: "Outdoor", emoji: "🏔️" },
  ];

  // 뒤로가기 함수
  const handleBackToDocent = () => {
    const previousPage = sessionStorage.getItem("previousPage");
    const previousPageTitle = sessionStorage.getItem("previousPageTitle");

    if (previousPage && previousPageTitle === "AI Docent") {
      navigate(previousPage);
      // 사용 후 세션 스토리지 정리 (타임스탬프 포함)
      sessionStorage.removeItem("previousPage");
      sessionStorage.removeItem("previousPageTitle");
      sessionStorage.removeItem("previousPageTimestamp");
    } else {
      navigate("/docent"); // 기본적으로 도슨트 페이지로 이동
    }
  };

  // 챗봇에서 온 경우인지 확인 (더 정확한 검증)
  const isFromDocent = () => {
    const previousPage = sessionStorage.getItem("previousPage");
    const previousPageTitle = sessionStorage.getItem("previousPageTitle");
    const timestamp = sessionStorage.getItem("previousPageTimestamp");

    // 세션 스토리지에 데이터가 있고, AI Docent에서 왔으며, 최근 5분 이내인 경우만
    if (previousPage && previousPageTitle === "AI Docent" && timestamp) {
      const now = Date.now();
      const storedTime = parseInt(timestamp);
      const fiveMinutes = 5 * 60 * 1000; // 5분을 밀리초로 변환

      return now - storedTime < fiveMinutes;
    }

    return false;
  };

  return (
    <BackgroundEffect className="w-full min-h-screen">
      <section className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 뒤로가기 버튼 - 챗봇에서 온 경우에만 표시 */}
          {isFromDocent() && (
            <div className="mb-4">
              <button
                onClick={handleBackToDocent}
                className="flex items-center justify-center w-10 h-10 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg transition-colors"
                title="AI Docent로 돌아가기"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          )}
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight mb-4 px-4">
              K-lover
              <br className="sm:hidden" /> Tour
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
              Premium Personal Tour
            </p>
          </motion.div>
          {/* 모바일/데스크톱 반응형 투어 카드 섹션 (데스크톱 과도한 가로 확장 방지) */}
          <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto space-y-6">
            <NeonCard className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                    K-lover 투어
                  </h2>
                </div>
              </div>

              {/* 검색 및 필터: 카드 내부 */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={""}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-purple-500/30 bg-gray-900/80 backdrop-blur-sm focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all text-white placeholder-gray-400 shadow-lg"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((category) => (
                    <motion.button
                      key={category.value}
                      onClick={() => {
                        setFilterCategory(category.value);
                        setCurrentPage(1);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
                        filterCategory === category.value
                          ? "bg-white/20 text-white shadow-lg shadow-white/10 border border-white/30"
                          : "bg-black/20 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                      }`}
                    >
                      <span className="text-base">{category.emoji}</span>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {category.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {currentItems.length > 0 ? (
                <>
                  {/* 그리드: 모바일 1열, 데스크톱 2열 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <AnimatePresence mode="sync">
                      {currentItems.map((item, index) => (
                        <motion.div
                          key={`${currentPage}-${item.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: index * 0.1 },
                          }}
                          exit={{ opacity: 0, y: -20 }}
                          className="h-full"
                        >
                          <MobileTourCard
                            item={item}
                            onDetailClick={handleDetailClick}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-4 py-4">
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-800/80 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
                      >
                        <ChevronLeft size={16} />
                        <span className="text-sm">이전</span>
                      </button>

                      <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                  : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-800/80 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/80 transition-colors"
                      >
                        <span className="text-sm">다음</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-300 text-sm">
                    다른 검색어나 필터를 시도해보세요.
                  </p>
                </motion.div>
              )}
            </NeonCard>

            <PartnershipSection />
          </div>
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </BackgroundEffect>
  );
}
