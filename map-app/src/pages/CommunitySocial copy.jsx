import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Clock,
  Search,
  MapPin,
  Hash,
  Filter,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/community/LoginModal";
import PostModal from "../components/community/PostModal";
import TrendModal from "../components/community/TrendModal";
import {
  BackgroundEffect,
  NeonCard,
  GradientText,
  NeonButton,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import PostDetailModal from "../components/community/PostDetailModal";

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

const API_BASE_URL = "/api";

// API 함수들 (컴포넌트 외부에 정의)
const fetchPosts = async (page = 1, limit = 10, searchParams = {}) => {
  console.log("🚀 API 호출 시도:", `${API_BASE_URL}/boards`);

  try {
    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...searchParams,
    });

    console.log("🔍 검색 파라미터:", searchParams);
    console.log("🌐 요청 URL:", `${API_BASE_URL}/boards?${params}`);

    const response = await fetch(`${API_BASE_URL}/boards?${params}`, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`네트워크 응답이 올바르지 않습니다: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 받은 데이터:", data);

    if (searchParams.query) {
      console.log(
        `🔍 "${searchParams.query}" 검색 결과: ${data.posts?.length || 0}개`
      );
    }

    return data.posts || data.data || data || [];
  } catch (error) {
    console.error("💥 게시글 가져오기 실패:", error);
    return [];
  }
};

const fetchTrendingTags = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/trending/tags`);
    if (!response.ok) throw new Error("인기 태그 조회 실패");

    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error("인기 태그 조회 실패:", error);
    return [];
  }
};

const fetchTrendingPosts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/trending/posts`);
    if (!response.ok) throw new Error("인기 글 조회 실패");
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("인기 글 조회 실패:", error);
    return [];
  }
};

const toggleLike = async (postId, isLiked) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    const method = isLiked ? "DELETE" : "POST";
    const response = await fetch(`${API_BASE_URL}/boards/${postId}/like`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.likes_count;
    }
    throw new Error("좋아요 처리에 실패했습니다.");
  } catch (error) {
    console.error("좋아요 토글 실패:", error);
    throw error;
  }
};

const deletePost = async (postId) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/boards/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("삭제에 실패했습니다.");
    }
    return true;
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    throw error;
  }
};

// 검색 헤더 컴포넌트
const SearchHeader = ({
  onSearch,
  searchFilters,
  setSearchFilters,
  currentSearchTerm,
  setCurrentSearchTerm,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = currentSearchTerm;
    }
    console.log("🔄 검색어 동기화:", currentSearchTerm);
  }, [currentSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();

    const searchQuery = inputRef.current.value.trim();
    console.log("🔎 현재 입력값:", searchQuery);

    if (!searchQuery) {
      onSearch({});
      return;
    }

    // 이전 query 제외하고 새로운 검색어 사용
    const { query: oldQuery, ...otherFilters } = searchFilters;

    const searchData = {
      query: searchQuery,
      ...otherFilters,
    };

    console.log("📤 전송할 검색 데이터:", searchData);
    onSearch(searchData);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentSearchTerm(value);
    console.log("✏️ 입력 변경:", value);
  };

  const handleShowAll = () => {
    setCurrentSearchTerm("");
    setSearchFilters({});
    onSearch({});
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="relative mb-4">
        <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="flex-1 flex items-center">
            <Search className="w-5 h-5 text-purple-400 ml-4" />
            <input
              ref={inputRef}
              type="text"
              value={currentSearchTerm}
              onChange={handleInputChange}
              placeholder="여행지, 태그로 검색..."
              className="flex-1 bg-transparent text-white placeholder-white/50 px-4 py-3 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-4">
            {(currentSearchTerm ||
              Object.values(searchFilters).some((f) => f)) && (
              <button
                type="button"
                onClick={handleShowAll}
                className="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-purple-400 rounded-lg transition-colors"
              >
                전체
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
            <NeonButton type="submit" variant="primary" size="sm">
              검색
            </NeonButton>
          </div>
        </div>
      </form>

      {/* 필터 옵션 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 p-4 mb-4"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <select
                  value={searchFilters.region || ""}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      region: e.target.value,
                    }))
                  }
                  className="bg-gray-800 text-white rounded-lg px-3 py-1 text-sm border border-gray-600 focus:border-purple-400"
                >
                  <option value="">전체 지역</option>
                  <option value="서울">서울</option>
                  <option value="부산">부산</option>
                  <option value="제주도">제주도</option>
                  <option value="강릉">강릉</option>
                  <option value="전주">전주</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-400" />
                <select
                  value={searchFilters.category || ""}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="bg-gray-800 text-white rounded-lg px-3 py-1 text-sm border border-gray-600 focus:border-purple-400"
                >
                  <option value="">전체 카테고리</option>
                  <option value="맛집">맛집</option>
                  <option value="숙박">숙박</option>
                  <option value="관광지">관광지</option>
                  <option value="액티비티">액티비티</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <select
                  value={searchFilters.sortBy || "latest"}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value,
                    }))
                  }
                  className="bg-gray-800 text-white rounded-lg px-3 py-1 text-sm border border-gray-600 focus:border-purple-400"
                >
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="comments">댓글순</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 사이드바 컴포넌트
const TrendingSidebar = ({
  trendingTags,
  trendingPosts,
  onTagClick,
  onPostClick,
}) => {
  return (
    <div className="w-80 space-y-6">
      {/* 인기 태그 */}
      <NeonCard variant="primary" className="sticky top-6">
        <div className="flex items-center gap-2 mb-4">
          <GradientText variant="primary" size="lg" className="font-bold">
            🔥 인기 태그
          </GradientText>
        </div>
        <div className="space-y-2">
          {trendingTags.map((item, index) => (
            <motion.button
              key={item.tag}
              onClick={() => onTagClick(item.tag)}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-purple-300 font-bold">#{index + 1}</span>
                <span className="text-white group-hover:text-purple-300">
                  #{item.tag}
                </span>
              </div>
              <span className="text-purple-400 text-sm">{item.count}</span>
            </motion.button>
          ))}
        </div>
        <NeonButton
          onClick={() => onTagClick("all")}
          variant="secondary"
          size="sm"
          className="w-full mt-4"
        >
          전체 태그 보기
        </NeonButton>
      </NeonCard>

      {/* 인기 글 */}
      <NeonCard variant="secondary" className="sticky top-80">
        <div className="flex items-center gap-2 mb-4">
          <GradientText variant="secondary" size="lg" className="font-bold">
            ⭐ 인기 글
          </GradientText>
        </div>
        <div className="space-y-3">
          {trendingPosts.map((post, index) => (
            <motion.button
              key={post.id}
              onClick={() => onPostClick(post.id)}
              className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-yellow-400 font-bold text-sm">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm line-clamp-2 group-hover:text-yellow-300">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{post.user_name}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        <NeonButton
          onClick={() => onPostClick("all")}
          variant="secondary"
          size="sm"
          className="w-full mt-4"
        >
          전체 인기글 보기
        </NeonButton>
      </NeonCard>
    </div>
  );
};

// SocialPost 컴포넌트
const SocialPost = ({
  post,
  onLikeUpdate,
  onPostUpdate,
  onPostDelete,
  onPostClick,
  currentUserId,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isOwner =
    currentUserId &&
    (post.user_id === currentUserId || post.user?.id === currentUserId);

  const handleLikeClick = async () => {
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newLikesCount = await toggleLike(post.id || post.board_id, isLiked);
      const newLikedState = !isLiked;

      setIsLiked(newLikedState);
      setLikesCount(newLikesCount);
      onLikeUpdate &&
        onLikeUpdate(post.id || post.board_id, newLikesCount, newLikedState);
    } catch (error) {
      if (error.message === "로그인이 필요합니다.") {
        setShowLoginModal(true);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await deletePost(post.id || post.board_id);
        onPostDelete && onPostDelete(post.id || post.board_id);
      } catch (error) {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  return (
    <NeonCard variant="primary" className="h-full">
      <div
        className="cursor-pointer"
        onClick={() => onPostClick && onPostClick(post.board_id || post.id)}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.user_profile_image || "/img/default_profile_img.png"}
              alt="프로필"
              className="w-10 h-10 rounded-full border-2 border-purple-400"
              onError={(e) => {
                e.target.src = "/img/default_profile_img.png";
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {post.user_name || post.author || "익명"}
                </span>
                {isOwner && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                    내 글
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString()
                    : "날짜 없음"}
                </span>
              </div>
            </div>
          </div>

          {/* 옵션 메뉴 (작성자만) */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsMenu(!showOptionsMenu);
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showOptionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-10 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-2 min-w-[120px] z-50"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEditModal(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                        setShowOptionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* 제목 */}
        {post.title && (
          <h3 className="text-lg font-bold text-white mb-3">{post.title}</h3>
        )}

        {/* 내용 */}
        <div className="mb-4">
          <p className="text-white/80 leading-relaxed">
            {post.content || "내용이 없습니다."}
          </p>
        </div>

        {/* 태그 */}
        {post.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(Array.isArray(post.tags) ? post.tags : post.tags.split(","))
              .slice(0, 3)
              .map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-400/30 hover:bg-purple-500/30 cursor-pointer transition-colors"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeClick();
              }}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isLiked
                  ? "text-red-400 bg-red-500/10"
                  : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              } ${isUpdating ? "opacity-50" : ""}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm">{likesCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                !currentUserId && setShowLoginModal(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
          {showEditModal && (
            <PostModal
              mode="edit"
              post={post}
              onClose={() => setShowEditModal(false)}
              onSuccess={(updatedPost) => {
                onPostUpdate && onPostUpdate(updatedPost);
                setShowEditModal(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* 옵션 메뉴 배경 클릭 감지 */}
        {showOptionsMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptionsMenu(false)}
          />
        )}
      </div>
    </NeonCard>
  );
};

// 메인 컴포넌트
export default function CommunitySocial() {
  const { profile } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [trendModalType, setTrendModalType] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);

  const currentUserId = profile?.sub || profile?.id || profile?.user_id;

  const loadPosts = async (searchParams = {}) => {
    console.log("🔧 백엔드 연결 테스트 시작...");
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPosts(1, 10, searchParams);
      console.log("📊 받은 데이터:", data);
      setPosts(data);

      if (Object.keys(searchParams).length > 0 && searchParams.query) {
        setIsSearchMode(true);
        if (data.length === 0) {
          setError(`"${searchParams.query}"에 대한 검색 결과가 없습니다.`);
        }
      } else {
        setIsSearchMode(false);
        if (data.length === 0) {
          setError("아직 게시글이 없습니다.");
        }
      }
    } catch (error) {
      console.error("🚨 연결 테스트 실패:", error);
      setError(`연결 실패: ${error.message}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingData = async () => {
    try {
      const [tags, posts] = await Promise.all([
        fetchTrendingTags(),
        fetchTrendingPosts(),
      ]);
      setTrendingTags(tags || []);
      setTrendingPosts(posts || []);
    } catch (error) {
      console.error("트렌드 데이터 로드 실패:", error);
    }
  };

  useEffect(() => {
    setIsSearchMode(false);
    loadPosts();
    loadTrendingData();
  }, []);

  useEffect(() => {
    if (profile && showLoginModal) {
      setShowLoginModal(false);
    }
  }, [profile, showLoginModal]);

  // 올바른 handleSearch 함수
  const handleSearch = (searchParams) => {
    console.log("🔍 받은 검색 파라미터:", searchParams);

    setSearchFilters(searchParams);

    if (!searchParams.query || searchParams.query.trim() === "") {
      setCurrentSearchTerm("");
      setIsSearchMode(false);
      loadPosts({});
    } else {
      setCurrentSearchTerm(searchParams.query);
      setIsSearchMode(true);
      loadPosts(searchParams);
    }
  };

  const handleTagClick = (tag) => {
    if (tag === "all") {
      setTrendModalType("tags");
      setShowTrendModal(true);
    } else {
      const searchQuery = `#${tag}`;
      console.log("🏷️ 태그 클릭:", searchQuery);

      setCurrentSearchTerm(searchQuery);
      handleSearch({ query: searchQuery });
    }
  };

  const handleCreatePostClick = () => {
    if (!profile) {
      setShowLoginModal(true);
    } else {
      setShowPostModal(true);
    }
  };

  const handleLikeUpdate = (postId, newLikesCount, isLiked) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId || post.board_id === postId
          ? { ...post, likes_count: newLikesCount, isLiked }
          : post
      )
    );
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === updatedPost.id || post.board_id === updatedPost.id
          ? { ...post, ...updatedPost }
          : post
      )
    );
  };

  const handlePostDelete = (postId) => {
    setPosts((prev) =>
      prev.filter((post) => post.id !== postId && post.board_id !== postId)
    );
  };

  const handlePostCreate = (newPost) => {
    loadPosts(searchFilters);
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setShowPostDetailModal(true);
  };

  const handleClosePostDetailModal = () => {
    setShowPostDetailModal(false);
    setSelectedPostId(null);
  };

  const handleTrendPostClick = (postId) => {
    if (postId === "all") {
      setTrendModalType("posts");
      setShowTrendModal(true);
    } else {
      handlePostClick(postId);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-400 border-t-pink-400 rounded-full"
        />
        <span className="ml-4 text-white text-lg">소셜 피드 로딩 중...</span>
      </div>
    );
  }

  return (
    <BackgroundEffect className="flex-1 min-h-screen neon-scrollbar overflow-y-auto">
      <NeonScrollbarStyles />

      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="bg-gradient-to-br from-purple-900/30 via-black/50 to-pink-900/30 absolute inset-0" />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
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

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 p-6">
        <div className={`flex gap-6 ${isMobile ? "flex-col" : ""}`}>
          {/* 왼쪽 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 헤더 */}
            <motion.header>
              {!profile && (
                <NeonCard variant="info" delay={0.3} className="mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        좋아요, 댓글, 글 작성을 하려면 로그인이 필요합니다.
                      </p>
                      <p className="text-white/70 text-sm mt-1">
                        조회는 자유롭게 가능합니다!
                      </p>
                    </div>
                    <NeonButton
                      onClick={() => setShowLoginModal(true)}
                      variant="primary"
                      size="sm"
                    >
                      로그인
                    </NeonButton>
                  </div>
                </NeonCard>
              )}
            </motion.header>

            {/* 검색 헤더 */}
            <SearchHeader
              onSearch={handleSearch}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              currentSearchTerm={currentSearchTerm}
              setCurrentSearchTerm={setCurrentSearchTerm}
            />

            {/* 게시글 목록 */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {posts.length === 0 ? (
                <NeonCard
                  variant="warning"
                  className="text-center py-12"
                  delay={0.8}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
                  <GradientText
                    variant="warning"
                    size="2xl"
                    className="block mb-4"
                  >
                    {isSearchMode
                      ? error || "검색 결과가 없습니다"
                      : error || "아직 게시글이 없습니다"}
                  </GradientText>
                  <p className="text-white/70 mb-6">
                    {isSearchMode
                      ? "다른 검색어로 시도해보세요!"
                      : profile
                      ? "첫 번째 게시글을 작성해보세요!"
                      : "로그인하여 첫 번째 게시글을 작성해보세요!"}
                  </p>

                  <div className="flex gap-3 justify-center">
                    {isSearchMode && (
                      <NeonButton
                        onClick={() => {
                          setIsSearchMode(false);
                          setSearchFilters({});
                          setCurrentSearchTerm("");
                          loadPosts({});
                        }}
                        variant="secondary"
                        size="lg"
                      >
                        전체 글 보기
                      </NeonButton>
                    )}

                    <NeonButton
                      onClick={handleCreatePostClick}
                      variant="primary"
                      size="lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {profile
                        ? isSearchMode
                          ? "새 글 작성하기"
                          : "첫 번째 게시글 작성하기"
                        : "로그인하여 글 작성하기"}
                    </NeonButton>
                  </div>
                </NeonCard>
              ) : (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id || post.board_id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
                    >
                      <SocialPost
                        post={post}
                        onLikeUpdate={handleLikeUpdate}
                        onPostUpdate={handlePostUpdate}
                        onPostDelete={handlePostDelete}
                        onPostClick={handlePostClick}
                        currentUserId={currentUserId}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {!isMobile && (
            <motion.aside>
              <TrendingSidebar
                trendingTags={trendingTags}
                trendingPosts={trendingPosts}
                onTagClick={handleTagClick}
                onPostClick={handleTrendPostClick}
              />
            </motion.aside>
          )}
        </div>
      </div>

      {/* 모달들 */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
        {showPostModal && (
          <PostModal
            mode="create"
            onClose={() => setShowPostModal(false)}
            onSuccess={handlePostCreate}
          />
        )}
        {showTrendModal && (
          <TrendModal
            type={trendModalType}
            trendingTags={trendingTags}
            trendingPosts={trendingPosts}
            onClose={() => setShowTrendModal(false)}
            onTagClick={handleTagClick}
            onPostClick={handlePostClick}
          />
        )}
        {showPostDetailModal && (
          <PostDetailModal
            postId={selectedPostId}
            isOpen={showPostDetailModal}
            onClose={handleClosePostDetailModal}
          />
        )}
      </AnimatePresence>
    </BackgroundEffect>
  );
}
