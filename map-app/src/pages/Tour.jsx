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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
    case "it":
      return {
        emoji: "🖥️",
        label: "IT",
        gradient: "from-blue-500 to-cyan-500",
      };
    case "sports":
      return {
        emoji: "⚾",
        label: "스포츠",
        gradient: "from-green-500 to-blue-500",
      };
    case "beauty":
      return {
        emoji: "💄",
        label: "뷰티",
        gradient: "from-pink-500 to-rose-500",
      };
    case "culture":
      return {
        emoji: "🏛️",
        label: "문화",
        gradient: "from-purple-500 to-indigo-500",
      };
    case "adventure":
      return {
        emoji: "🏔️",
        label: "모험",
        gradient: "from-emerald-500 to-teal-500",
      };
    case "entertainment":
      return {
        emoji: "🎢",
        label: "엔터",
        gradient: "from-yellow-500 to-orange-500",
      };
    default:
      return {
        emoji: "🎵",
        label: "기타",
        gradient: "from-gray-500 to-gray-600",
      };
  }
};

// 모바일 최적화된 TourCard 컴포넌트
const MobileTourCard = ({ item, onDetailClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const categoryInfo = getCategoryInfo(item.category);

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
      <div className="relative h-28 overflow-hidden">
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
      <div className="p-2.5 space-y-1.5 flex flex-col justify-between flex-1">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white line-clamp-1">
            {item.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-300">
                {item.rating || "4.5"}
              </span>
            </div>
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 truncate max-w-16">
                  {item.location}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 line-clamp-2">
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
            <span className="text-sm font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {item.price}
            </span>

            <div className="flex items-center gap-1">
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDetailClick(item);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded text-xs font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <Eye size={10} />
                보기
              </button>
            </div>
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
            Klover 제휴사
          </h2>
          <p className="text-gray-300"></p>
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
  const itemsPerPage = 4; // 모바일에서 한 번에 4개씩 표시

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

  // 카테고리 배열
  const categories = [
    { value: "all", label: "전체", emoji: "🌟" },
    { value: "entertainment", label: "Entertainment", emoji: "🎢" },
    { value: "location", label: "Filming", emoji: "📍" },
    { value: "experience", label: "Experience", emoji: "🎭" },
    { value: "it", label: "IT", emoji: "🖥️" },
    { value: "sports", label: "Sports", emoji: "⚾" },
    { value: "beauty", label: "Beauty", emoji: "💄" },
    { value: "culture", label: "Culture", emoji: "🏛️" },

    // { value: "goods", label: "Shopping", emoji: "🛍️" },
    // { value: "food", label: "MeokBang", emoji: "🍜" },
    //  { value: "adventure", label: "Outdoor", emoji: "🏔️" },
  ];

  return (
    <BackgroundEffect className="w-full min-h-screen">
      <section className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight mb-4 px-4">
              Klover에서만 만날 수 있는
              <br className="sm:hidden" /> 특별한 투어
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6 sm:mb-8 px-4">
              프리미엄 한국 문화 체험 투어
            </p>

            {/* 검색 및 필터 
            <div className="max-w-4xl mx-auto px-4">
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="투어 검색..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-purple-500/30 bg-gray-900/80 backdrop-blur-sm focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 outline-none transition-all text-white placeholder-gray-400 shadow-lg"
                  />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setFilterCategory(category.value);
                        setCurrentPage(1); // 필터 변경시 첫 페이지로
                      }}
                      className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all shadow-lg ${
                        filterCategory === category.value
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white shadow-purple-500/25"
                          : "bg-gray-900/70 border-gray-600/50 text-gray-300 hover:border-purple-500/50 hover:bg-gray-800/70"
                      }`}
                    >
                      <span className="text-lg">{category.emoji}</span>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {category.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
*/}
            {/* 검색 및 필터 */}
            <div className="max-w-4xl mx-auto px-4">
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="투어 검색..."
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
            </div>
          </motion.div>
          {/* 모바일 투어 카드 섹션 */}
          <div className="max-w-md mx-auto space-y-6">
            <NeonCard className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                    Klover 여행 상품
                  </h2>
                </div>
              </div>

              {currentItems.length > 0 ? (
                <>
                  {/* 모바일 그리드 (2x2) */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <AnimatePresence mode="wait">
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
