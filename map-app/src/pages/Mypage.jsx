"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/community/LoginModal";
import {
  Heart,
  MapPin,
  MessageSquare,
  Clock,
  Edit3,
  Trash2,
  Eye,
  Camera,
  LogOut,
  LogIn,
  Loader,
  Route,
  ShoppingBag,
  User,
  Calendar,
  ThumbsUp,
  Bookmark,
  Star,
} from "lucide-react";

import { BackgroundEffect } from "../components/ui/NeonTheme";

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  TRAVEL_PLANS: "routes", // Route.js에서 사용하는 키
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

// 모바일 감지 Hook
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
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
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-300">로딩 중...</p>
      </div>
    </div>
  );
};

// 로그인이 필요함을 알리는 페이지
const LoginRequiredPage = ({ onShowLoginModal }) => {
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
          마이페이지 접근 제한
        </h2>

        <p className="text-gray-300 mb-8 leading-relaxed">
          마이페이지를 이용하시려면 먼저 로그인이 필요합니다.
          <br />
          소셜 계정으로 간편하게 로그인하세요.
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
const StatCard = ({ icon: Icon, title, value, variant = "default" }) => {
  return (
    <NeonCard variant={variant} className="p-4">
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
const TravelPlanCard = ({ plan, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "날짜 없음";
    return new Date(timestamp).toLocaleDateString("ko-KR");
  };

  return (
    <NeonCard className="p-6">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
          <Route className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg mb-2">
            {plan.title || "여행 계획"}
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            {plan.description || "여행 루트 계획"}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(plan.created_date)}
              </div>
              {plan.stops && <span>{plan.stops.length}개 장소</span>}
            </div>
            <button
              onClick={() => onDelete(plan.id)}
              className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </NeonCard>
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
    <NeonCard className="p-6">
      <div className="flex gap-4">
        {post.pictures && post.pictures.length > 0 && (
          <img
            src={post.pictures[0].image_url}
            alt={post.title}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg mb-2">{post.title}</h3>
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

            <button
              onClick={() => onDelete(post.id)}
              className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </NeonCard>
  );
};

// 좋아요한 글 카드 컴포넌트
const LikedPostCard = ({ post, onRemove }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <NeonCard className="p-6">
      <div className="flex gap-4">
        <img
          src={post.user_profile_image || "/default-avatar.png"}
          alt={post.user_name}
          className="w-12 h-12 object-cover rounded-full"
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
              onClick={() => onRemove(post.id)}
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

// Route localStorage 서비스 (제공해주신 코드 기반)
const RouteService = {
  async list(sort = "-created_date", limit = 100) {
    const items = this.readAll();
    const sorted = items.sort(
      (a, b) => (b.created_date || 0) - (a.created_date || 0)
    );
    const sliced = sorted.slice(0, limit);
    return Promise.resolve(sliced);
  },
  readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRAVEL_PLANS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
  writeAll(items) {
    localStorage.setItem(STORAGE_KEYS.TRAVEL_PLANS, JSON.stringify(items));
  },
};

// 메인 마이페이지 컴포넌트
export default function MyPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { profile, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("travel-plans");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // LocalStorage 데이터 상태
  const [travelPlans, setTravelPlans] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);

  // API 데이터 상태
  const [userPosts, setUserPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // LocalStorage에서 데이터 로드
  useEffect(() => {
    loadLocalStorageData();

    // 실시간 동기화를 위한 이벤트 리스너 추가
    const handleStorageChange = (e) => {
      if (
        e.key === STORAGE_KEYS.LIKED_PRODUCTS ||
        e.key === STORAGE_KEYS.TRAVEL_PLANS
      ) {
        loadLocalStorageData();
      }
    };

    // 창 포커스 시에도 데이터 다시 로드
    const handleFocus = () => {
      loadLocalStorageData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 프로필 로드시 모든 데이터 미리 가져오기
  useEffect(() => {
    if (profile) {
      fetchAllData();
    }
  }, [profile]);

  // 탭 변경시 해당 데이터 가져오기
  useEffect(() => {
    if (profile && (activeTab === "my-posts" || activeTab === "liked-posts")) {
      fetchTabData();
    }
  }, [activeTab, profile]);

  const loadLocalStorageData = async () => {
    try {
      // 저장한 여행 계획 로드 (Route 서비스 사용)
      const plans = await RouteService.list();
      setTravelPlans(plans);

      // 좋아요한 여행 상품 로드 - 서비스 사용
      const products = LikedProductsService.getLikedProducts();
      setLikedProducts(products);
      console.log("로드된 좋아요 상품:", products); // 디버깅용
    } catch (error) {
      console.error("LocalStorage 데이터 로드 오류:", error);
    }
  };

  const fetchAllData = async () => {
    if (!profile) return;

    try {
      const userId = profile.id || profile.sub;
      const [myPostsResponse, likedPostsResponse] = await Promise.all([
        fetch(`/api/users/${userId}/boards`, { credentials: "include" }),
        fetch("/api/user/liked-posts", { credentials: "include" }),
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
  };

  const fetchTabData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let setState = null;

      switch (activeTab) {
        case "my-posts":
          const userId = profile.id || profile.sub;
          endpoint = `/api/users/${userId}/boards`;
          setState = setUserPosts;
          break;
        case "liked-posts":
          endpoint = "/api/user/liked-posts"; // 이 API가 호출되는지 확인
          setState = setLikedPosts;
          break;
        default:
          setLoading(false);
          return;
      }

      console.log(`API 호출: ${endpoint}`); // 디버깅용 로그 추가

      const response = await fetch(endpoint, {
        credentials: "include",
      });

      console.log(`응답 상태: ${response.status}`); // 디버깅용 로그 추가

      const data = await response.json();
      console.log("응답 데이터:", data); // 디버깅용 로그 추가

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
  };

  const tabs = [
    { id: "travel-plans", label: "저장한 여행 계획", icon: Route },
    { id: "liked-products", label: "좋아요한 여행 상품", icon: ShoppingBag },
    { id: "my-posts", label: "내가 작성한 글", icon: MessageSquare },
    { id: "liked-posts", label: "내가 좋아요 누른 글", icon: Heart },
  ];

  const handleDeleteTravelPlan = (planId) => {
    if (window.confirm("여행 계획을 삭제하시겠습니까?")) {
      const currentItems = RouteService.readAll();
      const updatedItems = currentItems.filter((item) => item.id !== planId);
      RouteService.writeAll(updatedItems);
      setTravelPlans(updatedItems);
    }
  };

  const handleRemoveLikedProduct = (productId) => {
    if (window.confirm("좋아요를 취소하시겠습니까?")) {
      const updatedProducts =
        LikedProductsService.removeLikedProduct(productId);
      if (updatedProducts !== null) {
        setLikedProducts(updatedProducts);
        console.log("좋아요 취소됨:", productId); // 디버깅용
      } else {
        alert("좋아요 취소 중 오류가 발생했습니다.");
      }
    }
  };

  const handleEditPost = (post) => {
    console.log("Edit post:", post);
    navigate(`/write?edit=${post.id}`);
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

  const handleRemoveLikedPost = (postId) => {
    if (window.confirm("좋아요를 취소하시겠습니까?")) {
      // TODO: 백엔드 API 구현 후 실제 API 호출
      console.log("Remove liked post:", postId);
      fetchTabData();
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
    <BackgroundEffect>
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
              마이페이지
            </h1>
            <p className="text-gray-300 mb-8 leading-relaxed">
              내 활동과 정보를 확인하고 관리하세요
            </p>

            {/* 프로필 섹션 */}
            <NeonCard className="max-w-md mx-auto mb-8">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={
                      profile.picture ||
                      profile.profile_image ||
                      "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/50 shadow-lg shadow-purple-500/25"
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
                    로그아웃
                  </button>
                </div>
              </div>
            </NeonCard>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Route}
                title="저장한 여행 계획"
                value={travelPlans.length}
                variant="primary"
              />
              <StatCard
                icon={ShoppingBag}
                title="좋아요한 여행 상품"
                value={likedProducts.length}
                variant="warning"
              />
              <StatCard
                icon={MessageSquare}
                title="작성한 글"
                value={userPosts.length}
                variant="success"
              />
              <StatCard
                icon={Heart}
                title="좋아요한 글"
                value={likedPosts.length}
                variant="danger"
              />
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex justify-center mb-8 overflow-x-auto">
              <div className="flex bg-gray-900/50 backdrop-blur-sm rounded-2xl p-1 border border-purple-500/30 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-300 whitespace-nowrap text-sm md:text-base ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.id === "travel-plans"
                        ? "여행계획"
                        : tab.id === "liked-products"
                        ? "여행상품"
                        : tab.id === "my-posts"
                        ? "내글"
                        : "좋아요"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
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
                    저장한 여행 계획 ({travelPlans.length})
                  </h2>
                </div>
                {travelPlans.length > 0 ? (
                  <div className="space-y-6">
                    {travelPlans.map((plan) => (
                      <TravelPlanCard
                        key={plan.id}
                        plan={plan}
                        onDelete={handleDeleteTravelPlan}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 mb-20">
                    <Route className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      저장한 여행 계획이 없습니다
                    </h3>
                    <p className="text-gray-400">
                      여행 계획을 세우고 저장해보세요!
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
                    좋아요한 여행 상품 ({likedProducts.length})
                  </h2>
                </div>
                {likedProducts.length > 0 ? (
                  <div className="space-y-6">
                    {likedProducts.map((product) => (
                      <TravelProductCard
                        key={product.id}
                        product={product}
                        onRemove={handleRemoveLikedProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      좋아요한 여행 상품이 없습니다
                    </h3>
                    <p className="text-gray-400">
                      마음에 드는 여행 상품에 좋아요를 눌러보세요!
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
                    내가 작성한 글 ({userPosts.length})
                  </h2>
                </div>
                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">로딩 중...</p>
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      작성한 글이 없습니다
                    </h3>
                    <p className="text-gray-400">첫 번째 글을 작성해보세요!</p>
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
                    내가 좋아요 누른 글 ({likedPosts.length})
                  </h2>
                </div>
                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">로딩 중...</p>
                  </div>
                ) : likedPosts.length > 0 ? (
                  <div className="space-y-6">
                    {likedPosts.map((post) => (
                      <LikedPostCard
                        key={post.id}
                        post={post}
                        onRemove={handleRemoveLikedPost}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      좋아요한 글이 없습니다
                    </h3>
                    <p className="text-gray-400">
                      마음에 드는 글에 좋아요를 눌러보세요!
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
    </BackgroundEffect>
  );
}
