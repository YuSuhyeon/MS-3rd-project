"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/community/LoginModal";
import {
  Heart,
  MapPin,
  MessageSquare,
  Clock,
  Trash2,
  Camera,
  LogOut,
  LogIn,
  Loader,
  X,
  Route,
  ShoppingBag,
  User,
  Calendar,
  Bookmark,
  Edit3,
} from "lucide-react";

import { BackgroundEffect } from "../components/ui/NeonTheme";
import IconPager from "../components/ui/IconPager";
import { Itinerary } from "../Entities/Itinerary";

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  LIKED_PRODUCTS: "liked_travel_products",
};

// 로컬스토리지 키 상수 아래에 추가
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

  removeLikedProduct(productId) {
    try {
      const likedProducts = this.getLikedProducts();
      const filteredProducts = likedProducts.filter((p) => p.id !== productId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProducts));

      // Storage 이벤트 발생
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: this.STORAGE_KEY,
          newValue: JSON.stringify(filteredProducts),
          oldValue: JSON.stringify(likedProducts),
        })
      );

      return filteredProducts;
    } catch (error) {
      console.error("좋아요 제거 오류:", error);
      return null;
    }
  },
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

// 로딩 페이지 컴포넌트
const LoadingPage = () => {
  const { t } = useTranslation("mypage");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-300">{t("loading")}</p>
      </div>
    </div>
  );
};

// 로그인이 필요함을 알리는 페이지
const LoginRequiredPage = ({ onShowLoginModal }) => {
  const { t } = useTranslation("mypage");
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <NeonCard className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25"
        >
          <User className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          {t("alert_mypage_h")}
        </h2>

        <p className="text-gray-300 mb-8 leading-relaxed">
          {t("alert_mypage_1")}
          <br />
          {t("alert_mypage_2")}
        </p>

        <NeonButton
          onClick={onShowLoginModal}
          className="w-full py-4 flex items-center justify-center gap-3"
          variant="primary"
        >
          <LogIn className="w-5 h-5" />
          로그인하기
        </NeonButton>
      </NeonCard>
    </div>
  );
};

// 대시보드 통계 카드
const StatCard = ({
  icon: Icon,
  title,
  value,
  variant = "default",
  onClick,
}) => {
  return (
    <NeonCard
      variant={variant}
      className={`p-4 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-300" />
        </div>
      </div>
    </NeonCard>
  );
};

// 여행 계획 카드 컴포넌트
const TravelPlanCard = ({ plan, onDelete, onSelect }) => {
  const { t } = useTranslation("mypage");

  const formatDate = (timestamp) => {
    if (!timestamp) return "날짜 없음";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "날짜 없음";
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const dayCount = plan?.total_days || plan?.days?.length || 0;
  const activitiesCount = Array.isArray(plan?.days)
    ? plan.days.reduce(
        (count, day) =>
          count + (Array.isArray(day?.activities) ? day.activities.length : 0),
        0
      )
    : 0;

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete(plan?.id);
  };

  return (
    <NeonCard
      className="w-full p-4 sm:p-5 md:p-6 cursor-pointer group"
      onClick={() => onSelect(plan)}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
          <Route className="w-7 h-7 sm:w-8 sm:h-8 text-blue-300 group-hover:text-blue-200 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="min-w-0">
            <h3
              className="font-bold text-white text-base sm:text-lg md:text-xl mb-1 truncate"
              dynamic="true"
            >
              {plan?.itinerary_name || plan?.title || "여행 계획"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400" dynamic="true">
              {plan?.destination || plan?.description || "목적지 미정"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 mt-4 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span dynamic="true">{dayCount || "일정 없음"}</span>
              {dayCount ? <span dynamic="true">일 일정</span> : null}
            </div>
            {activitiesCount ? (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span dynamic="true">{activitiesCount}개 활동</span>
              </div>
            ) : null}
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span
                className="truncate max-w-[140px] sm:max-w-none"
                dynamic="true"
              >
                {plan?.destination || "미정"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span dynamic="true">
                업데이트: {formatDate(plan?.updated_at || plan?.created_at)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-start">
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 text-red-200 hover:bg-red-500/25 transition-colors"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs sm:text-sm">{t("delete")}</span>
            </button>
          </div>
        </div>
      </div>
    </NeonCard>
  );
};

const TravelPlanDetailModal = ({ plan, onClose, isLoading }) => {
  const { t } = useTranslation("mypage");

  if (!plan) return null;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const days = Array.isArray(plan?.days) ? plan.days : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black/90 border border-purple-500/30 rounded-3xl shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-8 pt-8 pb-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Route className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white" dynamic="true">
                  {plan?.itinerary_name || t("travel_plan")}
                </h2>
                <p className="text-sm text-gray-400" dynamic="true">
                  {plan?.destination || t("destination_undecided")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-300" />
                <span>
                  {plan?.total_days || plan?.days?.length || 0}
                  {t("day_schedule")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-300" />
                <span>
                  {t("saved")}:{" "}
                  {formatDateTime(plan?.created_at || plan?.created_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-300" />
                <span>
                  {t("last_updated")}:{" "}
                  {formatDateTime(plan?.updated_at || plan?.created_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 overflow-y-auto max-h-[55vh] space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Loader className="w-6 h-6 animate-spin mb-3" />
                <span>{t("loading_details")}</span>
              </div>
            ) : days.length > 0 ? (
              days.map((day, dayIndex) => (
                <div
                  key={day?.id || day?.day_number || `day-${dayIndex}`}
                  className="border border-purple-500/20 rounded-2xl p-5 bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Day {day?.day_number || dayIndex + 1}
                    </h3>
                    {day?.date ? (
                      <span className="text-sm text-gray-400">
                        {formatDateTime(day.date)}
                      </span>
                    ) : null}
                  </div>

                  {Array.isArray(day?.activities) &&
                  day.activities.length > 0 ? (
                    <div className="space-y-3">
                      {day.activities.map((activity, activityIndex) => (
                        <div
                          key={
                            activity?.id ||
                            `${day?.day_number || dayIndex}-${activityIndex}`
                          }
                          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-purple-200">
                              <Clock className="w-4 h-4" />
                              <span dynamic="true">
                                {activity?.time || t("time_undecided")}
                              </span>
                            </div>
                            <div
                              className="text-sm text-gray-300"
                              dynamic="true"
                            >
                              {activity?.place_name ||
                                activity?.title ||
                                t("activity")}
                            </div>
                          </div>
                          {activity?.description ? (
                            <p
                              className="mt-2 text-sm text-gray-400"
                              dynamic="true"
                            >
                              {activity.description}
                            </p>
                          ) : null}
                          {activity?.address ? (
                            <p
                              className="mt-1 text-xs text-gray-500"
                              dynamic="true"
                            >
                              {activity.address}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {t("no_registered_activities")}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                {t("no_saved_schedule_info")}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 여행 상품 카드 컴포넌트
const TravelProductCard = ({ product, onRemove }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/tour/${product.id}`);
  };

  return (
    <NeonCard className="p-6 cursor-pointer" onClick={handleCardClick}>
      <div className="flex gap-4">
        <img
          src={
            product.image ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
          }
          alt={product.title}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg mb-2">{product.title}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {product.location}
              </div>
              <div className="text-yellow-400 font-semibold">
                {product.price || "가격 문의"}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 방지
                onRemove(product.id);
              }}
              className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              title="좋아요 취소"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </NeonCard>
  );
};

// PostCard 컴포넌트
const PostCard = ({ post, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <NeonCard className="p-6 cursor-pointer" onClick={() => onEdit(post)}>
      <div className="flex gap-4">
        {post.pictures && post.pictures.length > 0 && (
          <img
            src={post.pictures[0].image_url}
            alt={post.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg mb-1 truncate">
            {post.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {post.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {post.likes_count}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {post.comments_count}
              </div>
              <span>{formatDate(post.created_at)}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(post);
                }}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(post.id);
                }}
                className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </NeonCard>
  );
};

// 좋아요한 글 카드 컴포넌트
const LikedPostCard = ({ post, onNavigate, onRemove }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <NeonCard className="p-6 cursor-pointer" onClick={() => onNavigate(post)}>
      <div className="flex gap-4">
        <img
          src={post.user_profile_image || "/img/default_profile_img.png"}
          // alt={post.user_name}
          className="w-12 h-12 object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.src = "/img/default_profile_img.png";
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-300 font-medium">{post.user_name}</span>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-400 text-sm">
              {formatDate(post.created_at)}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg mb-2">{post.title}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {post.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {post.likes_count}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {post.comments_count}
              </div>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRemove(post.id);
              }}
              className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              title="좋아요 취소"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </NeonCard>
  );
};

// 메인 마이페이지 컴포넌트
export default function MyPage() {
  const { profile, logout, isLoading } = useAuth();
  const { t } = useTranslation("mypage");
  const [activeTab, setActiveTab] = useState("travel-plans");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // LocalStorage 데이터 상태
  const [travelPlans, setTravelPlans] = useState([]);
  const [travelPlansLoading, setTravelPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPlanDetailLoading, setIsPlanDetailLoading] = useState(false);
  const [likedProducts, setLikedProducts] = useState([]);

  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination states per tab
  const [travelPlansPage, setTravelPlansPage] = useState(1);
  const [likedProductsPage, setLikedProductsPage] = useState(1);
  const [myPostsPage, setMyPostsPage] = useState(1);
  const [likedPostsPage, setLikedPostsPage] = useState(1);

  const pageSizeMobile = 5;
  const pageSizeDesktop = 8;
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : true;
  const pageSize = isMobile ? pageSizeMobile : pageSizeDesktop;

  const loadLikedProducts = useCallback(() => {
    try {
      const products = LikedProductsService.getLikedProducts();
      setLikedProducts(products);
    } catch (error) {
      console.error("좋아요한 여행 상품 로드 오류:", error);
    }
  }, []);

  const fetchItineraries = useCallback(async () => {
    if (!profile) {
      setTravelPlans([]);
      return;
    }

    setTravelPlansLoading(true);
    try {
      const items = await Itinerary.list(50);
      setTravelPlans(items);
    } catch (error) {
      console.error("여행 일정 로드 오류:", error);
    } finally {
      setTravelPlansLoading(false);
    }
  }, [profile]);

  const fetchAllData = useCallback(async () => {
    if (!profile) return;

    try {
      const userId = profile.id || profile.sub;
      const params = new URLSearchParams({ limit: "50" });
      const [myPostsResponse, likedPostsResponse] = await Promise.all([
        fetch(`/api/users/${userId}/boards?${params.toString()}`, {
          credentials: "include",
        }),
        fetch(`/api/user/liked-posts?${params.toString()}`, {
          credentials: "include",
        }),
      ]);

      if (myPostsResponse.ok) {
        const myPostsData = await myPostsResponse.json();
        if (myPostsData.success) {
          setUserPosts(myPostsData.posts || []);
        }
      }

      if (likedPostsResponse.ok) {
        const likedPostsData = await likedPostsResponse.json();
        if (likedPostsData.success) {
          setLikedPosts(likedPostsData.posts || []);
        }
      }
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
    }
  }, [profile]);

  const fetchTabData = useCallback(async () => {
    if (!profile) return;
    if (!(activeTab === "my-posts" || activeTab === "liked-posts")) return;

    setLoading(true);
    try {
      let endpoint = "";
      let setState = null;

      if (activeTab === "my-posts") {
        const userId = profile.id || profile.sub;
        endpoint = `/api/users/${userId}/boards?limit=50`;
        setState = setUserPosts;
      } else if (activeTab === "liked-posts") {
        endpoint = `/api/user/liked-posts?limit=50`;
        setState = setLikedPosts;
      }

      if (!endpoint) return;

      const response = await fetch(endpoint, { credentials: "include" });
      const data = await response.json();

      if (data.success) {
        setState(data.posts || []);
      } else {
        console.error(`API 오류: ${data.error}`);
      }
    } catch (error) {
      console.error(`${activeTab} 데이터 가져오기 오류:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, profile]);

  useEffect(() => {
    loadLikedProducts();
  }, [loadLikedProducts]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === LikedProductsService.STORAGE_KEY) {
        loadLikedProducts();
      }
    };

    const handleFocus = () => {
      loadLikedProducts();
      fetchItineraries();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadLikedProducts, fetchItineraries]);

  useEffect(() => {
    fetchItineraries();
  }, [fetchItineraries]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (profile && (activeTab === "my-posts" || activeTab === "liked-posts")) {
      fetchTabData();
    }
  }, [activeTab, profile, fetchTabData]);

  const handleDeleteTravelPlan = async (planId) => {
    if (!planId) return;
    if (!window.confirm("여행 계획을 삭제하시겠습니까?")) return;

    try {
      await Itinerary.remove(planId);
      setTravelPlans((prev) => prev.filter((item) => item.id !== planId));
      if (selectedPlan?.id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("여행 계획 삭제 오류:", error);
      alert("여행 계획을 삭제하는 중 오류가 발생했습니다.");
    }
  };

  const handleSelectTravelPlan = async (plan) => {
    if (!plan) return;
    setSelectedPlan(plan);

    if (!plan.id) {
      setIsPlanDetailLoading(false);
      return;
    }

    setIsPlanDetailLoading(true);
    try {
      const fullPlan = await Itinerary.get(plan.id);
      setSelectedPlan(fullPlan);
    } catch (error) {
      console.error("여행 계획 상세 조회 오류:", error);
    } finally {
      setIsPlanDetailLoading(false);
    }
  };

  const handleClosePlanDetail = () => {
    setSelectedPlan(null);
    setIsPlanDetailLoading(false);
  };

  const handleRemoveLikedProduct = (productId) => {
    if (window.confirm("좋아요를 취소하시겠습니까?")) {
      const updatedProducts =
        LikedProductsService.removeLikedProduct(productId);
      if (updatedProducts !== null) {
        setLikedProducts(updatedProducts);
      } else {
        alert("좋아요 취소 중 오류가 발생했습니다.");
      }
    }
  };

  const handleEditPost = (post) => {
    navigate(`/boards/${post.id}`);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/boards/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          fetchTabData(); // 목록 새로고침
        } else {
          alert("삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("삭제 오류:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleRemoveLikedPost = async (postId) => {
    if (!window.confirm("좋아요를 취소하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/boards/${postId}/like`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setLikedPosts((prev) => prev.filter((post) => post.id !== postId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "좋아요 취소에 실패했습니다.");
      }
    } catch (error) {
      console.error("좋아요 취소 오류:", error);
      alert(error.message || "좋아요 취소 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <BackgroundEffect>
        <LoadingPage />
      </BackgroundEffect>
    );
  }

  // 로그인하지 않은 경우
  if (!profile) {
    return (
      <BackgroundEffect>
        <LoginRequiredPage onShowLoginModal={() => setShowLoginModal(true)} />
        <AnimatePresence>
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
        </AnimatePresence>
      </BackgroundEffect>
    );
  }

  // 로그인한 경우 - 마이페이지 표시
  return (
    <>
      <BackgroundEffect>
        <div className="max-w-3xl mx-auto relative z-10 space-y-12">
          {/* Header */}
          <section className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                  {t("mypage")}
                </h1>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  {t("mypage_description")}
                </p>

                {/* 프로필 섹션 */}
                <NeonCard className="max-w-md mx-auto mb-8">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img
                        src={
                          profile.picture ||
                          profile.profile_image ||
                          "/img/default_profile_img.png"
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 shadow-lg shadow-purple-500/25"
                        onError={(e) => {
                          e.currentTarget.src = "/img/default_profile_img.png";
                        }}
                      />
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">
                      {profile.name || profile.email}
                    </h2>
                    <p className="text-gray-400 mb-4">{profile.email}</p>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </NeonCard>

                {/* 통계 카드들 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatCard
                    icon={Route}
                    title={t("saved_travel_plans")}
                    value={travelPlans.length}
                    variant="primary"
                    onClick={() => setActiveTab("travel-plans")}
                  />
                  <StatCard
                    icon={ShoppingBag}
                    title={t("liked_travel_products")}
                    value={likedProducts.length}
                    variant="warning"
                    onClick={() => setActiveTab("liked-products")}
                  />
                  <StatCard
                    icon={MessageSquare}
                    title={t("my_posts")}
                    value={userPosts.length}
                    variant="success"
                    onClick={() => setActiveTab("my-posts")}
                  />
                  <StatCard
                    icon={Heart}
                    title={t("liked_posts")}
                    value={likedPosts.length}
                    variant="danger"
                    onClick={() => setActiveTab("liked-posts")}
                  />
                </div>

                {/* 탭 네비게이션 제거됨: 상단 통계 카드 클릭으로 전환 */}
              </motion.div>
            </div>
          </section>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="pb-32 min-h-screen">
              <AnimatePresence mode="wait">
                {activeTab === "travel-plans" && (
                  <motion.div
                    key="travel-plans"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {t("saved_travel_plans")} ({travelPlans.length})
                      </h2>
                    </div>
                    {travelPlansLoading ? (
                      <div className="text-center py-20">
                        <Loader className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-300">
                          {t("loading_travel_plans")}
                        </p>
                      </div>
                    ) : travelPlans.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
                          {travelPlans
                            .slice(
                              (travelPlansPage - 1) * pageSize,
                              (travelPlansPage - 1) * pageSize + pageSize
                            )
                            .map((plan) => (
                              <TravelPlanCard
                                key={plan.id || plan.itinerary_name}
                                plan={plan}
                                onDelete={handleDeleteTravelPlan}
                                onSelect={handleSelectTravelPlan}
                              />
                            ))}
                        </div>
                        <IconPager
                          currentPage={travelPlansPage}
                          totalPages={Math.max(
                            1,
                            Math.ceil(travelPlans.length / pageSize)
                          )}
                          onChange={(p) => setTravelPlansPage(p)}
                        />
                      </>
                    ) : (
                      <div className="text-center py-32 mb-20">
                        <Route className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          {t("no_saved_travel_plans")}
                        </h3>
                        <p className="text-gray-400">
                          {t("create_travel_plan_message")}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "liked-products" && (
                  <motion.div
                    key="liked-products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {t("liked_travel_products")} ({likedProducts.length})
                      </h2>
                    </div>
                    {likedProducts.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {likedProducts
                            .slice(
                              (likedProductsPage - 1) * pageSize,
                              (likedProductsPage - 1) * pageSize + pageSize
                            )
                            .map((product) => (
                              <TravelProductCard
                                key={product.id}
                                product={product}
                                onRemove={handleRemoveLikedProduct}
                              />
                            ))}
                        </div>
                        <IconPager
                          currentPage={likedProductsPage}
                          totalPages={Math.max(
                            1,
                            Math.ceil(likedProducts.length / pageSize)
                          )}
                          onChange={(p) => setLikedProductsPage(p)}
                        />
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          {t("no_liked_products")}
                        </h3>
                        <p className="text-gray-400">
                          {t("like_products_message")}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "my-posts" && (
                  <motion.div
                    key="my-posts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {t("my_posts")} ({userPosts.length})
                      </h2>
                    </div>
                    {loading ? (
                      <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-300">{t("loading")}</p>
                      </div>
                    ) : userPosts.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {userPosts
                            .slice(
                              (myPostsPage - 1) * pageSize,
                              (myPostsPage - 1) * pageSize + pageSize
                            )
                            .map((post) => (
                              <PostCard
                                key={post.id}
                                post={post}
                                onEdit={handleEditPost}
                                onDelete={handleDeletePost}
                              />
                            ))}
                        </div>
                        <IconPager
                          currentPage={myPostsPage}
                          totalPages={Math.max(
                            1,
                            Math.ceil(userPosts.length / pageSize)
                          )}
                          onChange={(p) => setMyPostsPage(p)}
                        />
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          {t("no_posts_written")}
                        </h3>
                        <p className="text-gray-400">{t("write_first_post")}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "liked-posts" && (
                  <motion.div
                    key="liked-posts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {t("liked_posts")} ({likedPosts.length})
                      </h2>
                    </div>
                    {loading ? (
                      <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-300">{t("loading")}</p>
                      </div>
                    ) : likedPosts.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {likedPosts
                            .slice(
                              (likedPostsPage - 1) * pageSize,
                              (likedPostsPage - 1) * pageSize + pageSize
                            )
                            .map((post) => (
                              <LikedPostCard
                                key={post.id}
                                post={post}
                                onNavigate={handleEditPost}
                                onRemove={handleRemoveLikedPost}
                              />
                            ))}
                        </div>
                        <IconPager
                          currentPage={likedPostsPage}
                          totalPages={Math.max(
                            1,
                            Math.ceil(likedPosts.length / pageSize)
                          )}
                          onChange={(p) => setLikedPostsPage(p)}
                        />
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                          {t("no_liked_posts")}
                        </h3>
                        <p className="text-gray-400">
                          {t("like_posts_message")}
                        </p>
                        <p className="text-yellow-400 text-sm mt-2">
                          * 이 기능은 백엔드 API 구현 후 동작합니다
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </BackgroundEffect>
      <AnimatePresence>
        {selectedPlan && (
          <TravelPlanDetailModal
            plan={selectedPlan}
            onClose={handleClosePlanDetail}
            isLoading={isPlanDetailLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}
