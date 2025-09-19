"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/community/LoginModal";
import {
  Heart,
  MapPin,
  Star,
  Bookmark,
  User,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  Edit3,
  Trash2,
  Eye,
  BarChart3,
  CreditCard,
  Settings,
  Bell,
  Camera,
  LogOut,
  LogIn,
  Loader,
} from "lucide-react";
import {
  BackgroundEffect,
  NeonCard,
  NeonCardJH,
  NeonCardJHMobile,
  NeonButton,
  GradientText,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";

// 실제 DB 구조에 맞게 수정된 목업 데이터
const mockMyPosts = [
  {
    id: 1,
    title: "NewJeans 은평 한옥마을",
    content:
      "NewJeans 자컨 촬영했던 은평 한옥마을 다녀왔어요! 전통과 현대가 어우러진 멋진 장소였어요. 사진도 정말 예쁘게 나와서 만족스러워요.",
    likes_count: 23,
    comments_count: 8,
    views: 156,
    created_at: "2024-09-15T10:30:00",
    updated_at: "2024-09-15T10:30:00",
    pictures: [
      {
        id: 1,
        image_url:
          "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400",
        sort_order: 0,
      },
    ],
    tags: ["NewJeans", "한옥마을", "은평", "사진스팟"],
  },
  {
    id: 2,
    title: "강남 K-POP 굿즈샵 완전 정복!",
    content:
      "하루종일 돌아다니면서 찾은 굿즈샵들 총정리해봤어요. 특히 이곳은 한정판 굿즈도 많고 가격도 합리적이에요!",
    likes_count: 45,
    comments_count: 12,
    views: 234,
    created_at: "2024-09-10T14:20:00",
    updated_at: "2024-09-10T14:20:00",
    pictures: [
      {
        id: 2,
        image_url:
          "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400",
        sort_order: 0,
      },
    ],
    tags: ["굿즈샵", "강남", "쇼핑", "K-POP"],
  },
  {
    id: 3,
    title: "경복궁 한복 체험 꿀팁 공유",
    content:
      "한복 렌탈부터 포토존까지 완벽 가이드를 준비했습니다! 예쁜 사진 찍는 방법도 알려드릴게요.",
    likes_count: 67,
    comments_count: 19,
    views: 412,
    created_at: "2024-09-08T09:15:00",
    updated_at: "2024-09-08T09:15:00",
    pictures: [
      {
        id: 3,
        image_url:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
        sort_order: 0,
      },
    ],
    tags: ["경복궁", "한복체험", "전통문화", "포토존"],
  },
];

// 사용자의 태그 사용 통계
const mockUserTags = [
  { name: "K-POP", count: 5, latest_used: "2024-09-15" },
  { name: "한복체험", count: 3, latest_used: "2024-09-10" },
  { name: "사진스팟", count: 4, latest_used: "2024-09-08" },
  { name: "강남", count: 2, latest_used: "2024-09-05" },
  { name: "전통문화", count: 2, latest_used: "2024-09-01" },
  { name: "NewJeans", count: 1, latest_used: "2024-08-28" },
  { name: "굿즈샵", count: 2, latest_used: "2024-08-25" },
  { name: "경복궁", count: 1, latest_used: "2024-08-20" },
];

// 북마크한 게시글들
const mockBookmarkedPosts = [
  {
    id: 4,
    title: "홍대 인디밴드 공연장 투어",
    user_name: "음악러버",
    user_profile_image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    likes_count: 34,
    comments_count: 7,
    created_at: "2024-09-12T19:00:00",
    tags: ["홍대", "인디음악", "공연장"],
  },
  {
    id: 5,
    title: "명동 길거리 음식 맛집 지도",
    user_name: "푸드헌터",
    user_profile_image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b108?w=100",
    likes_count: 89,
    comments_count: 23,
    created_at: "2024-09-11T16:30:00",
    tags: ["명동", "길거리음식", "맛집"],
  },
  {
    id: 6,
    title: "서울숲 벚꽃 명소 완전 정복",
    user_name: "자연러버",
    user_profile_image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    likes_count: 56,
    comments_count: 15,
    created_at: "2024-09-09T11:20:00",
    tags: ["서울숲", "벚꽃", "자연", "산책"],
  },
];

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

// 로딩 페이지 컴포넌트 (기존 유지)
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

// 로그인이 필요함을 알리는 페이지 (LoginModal 트리거용)
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
const StatCard = ({
  icon: Icon,
  title,
  value,
  change,
  variant = "default",
}) => {
  return (
    <NeonCard variant={variant} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-300" />
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
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.tags &&
              post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            <span className="text-gray-400 text-sm ml-auto">
              {formatDate(post.created_at)}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-1">
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
              {post.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(post)}
                className="p-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(post.id)}
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

// TagCard 컴포넌트
const TagCard = ({ tag, onRemove }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <NeonCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />#{tag.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
            <span>{tag.count}개 게시글</span>
            <span>최근 사용: {formatDate(tag.latest_used)}</span>
          </div>
        </div>
        <button
          onClick={() => onRemove(tag.name)}
          className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </NeonCard>
  );
};

// BookmarkCard 컴포넌트
const BookmarkCard = ({ post, onRemove }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  return (
    <NeonCard className="p-6">
      <div className="flex gap-4">
        <img
          src={post.user_profile_image}
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
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.tags &&
              post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
          </div>
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
              title="북마크 제거"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </NeonCard>
  );
};

// 메인 마이페이지 컴포넌트
export default function MyPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { profile, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLoginModal, setShowLoginModal] = useState(false); // LoginModal 상태 추가
  const navigate = useNavigate();

  // 사용자 통계
  const userStats = {
    totalPosts: mockMyPosts.length,
    totalTags: mockUserTags.length,
    totalLikes: mockMyPosts.reduce((sum, post) => sum + post.likes_count, 0),
    totalBookmarks: mockBookmarkedPosts.length,
  };

  const tabs = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "posts", label: "내가 쓴 글", icon: MessageSquare },
    // { id: "tags", label: "태그 관리", icon: Star },
    { id: "bookmarks", label: "북마크한 글", icon: Bookmark },
  ];

  const handleEditPost = (post) => {
    console.log("Edit post:", post);
    navigate(`/write?edit=${post.id}`);
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      console.log("Delete post:", postId);
      // 실제 삭제 API 호출
    }
  };

  const handleRemoveTag = (tagName) => {
    if (window.confirm(`"${tagName}" 태그를 삭제하시겠습니까?`)) {
      console.log("Remove tag:", tagName);
      // 실제 태그 삭제 API 호출
    }
  };

  const handleRemoveBookmark = (postId) => {
    if (window.confirm("북마크를 제거하시겠습니까?")) {
      console.log("Remove bookmark:", postId);
      // 실제 북마크 제거 API 호출
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

  // 로그인하지 않은 경우 - LoginModal 사용
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
    <BackgroundEffect className="w-full min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* 프로필 섹션 */}
            <NeonCard className="max-w-md mx-auto mb-8">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={profile.picture || "/default_profile_img"}
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
                <p className="text-gray-400 mb-2">{profile.email}</p>
                <div className="flex items-center justify-center gap-4 text-sm mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full">
                    VIP 회원
                  </span>
                  <span className="text-gray-400">
                    가입일: {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-semibold text-yellow-300">
                      2,840 P
                    </span>
                  </div>
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

            {/* 탭 네비게이션 */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-900/50 backdrop-blur-sm rounded-2xl p-1 border border-purple-500/30 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-6 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={MessageSquare}
                  title="작성한 글"
                  value={userStats.totalPosts}
                  variant="primary"
                />
                {/* <StatCard
                  icon={Star}
                  title="사용한 태그"
                  value={userStats.totalTags}
                  variant="success"                /> */}

                <StatCard
                  icon={Bookmark}
                  title="북마크한 글"
                  value={userStats.totalBookmarks}
                  variant="danger"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  내가 쓴 글 ({mockMyPosts.length})
                </h2>
              </div>
              <div className="space-y-6">
                {mockMyPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/*태그 
          activeTab === "tags" && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  태그 관리 ({mockUserTags.length})
                </h2>
              </div>
              <div className="space-y-6">
                {mockUserTags.map((tag, index) => (
                  <TagCard key={index} tag={tag} onRemove={handleRemoveTag} />
                ))}
              </div>
            </motion.div>
          )*/}

          {activeTab === "bookmarks" && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  북마크한 글 ({mockBookmarkedPosts.length})
                </h2>
              </div>
              <div className="space-y-6">
                {mockBookmarkedPosts.map((post) => (
                  <BookmarkCard
                    key={post.id}
                    post={post}
                    onRemove={handleRemoveBookmark}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BackgroundEffect>
  );
}
