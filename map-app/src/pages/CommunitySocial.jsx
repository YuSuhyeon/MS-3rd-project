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
  LogOut,
  Users,
  Loader,
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

const fetchPosts = async (page = 1, limit = 10, searchParams = {}) => {
  console.log("🚀 API 호출 시도:", `${API_BASE_URL}/boards`);

  try {
    const headers = { "Content-Type": "application/json" };

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

// 좋아요 기능
const toggleLike = async (postId, isLiked) => {
  try {
    const method = isLiked ? "DELETE" : "POST";
    console.log(
      `💗 좋아요 API 요청: postId=${postId}, 현재상태=${isLiked}, 메소드=${method}`
    );

    const response = await fetch(`${API_BASE_URL}/boards/${postId}/like`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("로그인이 필요합니다.");
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    return {
      likes_count: data.likes_count || data.likesCount || 0,
      is_liked:
        data.is_liked !== undefined
          ? data.is_liked
          : data.isLiked !== undefined
          ? data.isLiked
          : !isLiked,
    };
  } catch (error) {
    console.error("좋아요 API 오류:", error);
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/${postId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 세션 쿠키 포함
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
    </div>
  );
};

// 사이드바 컴포넌트
const TrendingSidebar = ({
  trendingTags,
  trendingPosts,
  profile,
  onTagClick,
  onPostClick,
  onShowLoginModal,
  onLogout,
  onRemoveTag,
  onRemoveBookmark,
}) => {
  return (
    <div className="w-80 space-y-6">
      {/* 로그인 카드 - 최상단 고정 */}
      {profile ? (
        <NeonCard variant="primary" className="sticky top-6 z-30 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={profile.picture || "/img/default_profile_img.png"}
              alt="프로필"
              className="w-12 h-12 rounded-full border-2 border-purple-400"
              onError={(e) => {
                e.target.src = "/img/default_profile_img.png";
              }}
            />
            <div className="flex-1">
              <p className="text-white font-medium">
                {profile.name ||
                  profile.nickname ||
                  "서울의 오늘을 함께한 여행자"}
                님
              </p>
              <p className="text-white/70 text-sm">서울의 하루를 나눠보세요.</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm("로그아웃 하시겠습니까?")) {
                  onLogout();
                }
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </NeonCard>
      ) : (
        <NeonCard variant="info" className="sticky top-6 z-30 mb-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">
              K-컬처 팬들의 생생한 여행 후기를 둘러보세요!
            </h3>
            <p className="text-white/70 text-sm mb-4">
              좋아요, 댓글, 글 작성을 하려면 로그인이 필요합니다.
            </p>
            <NeonButton
              onClick={onShowLoginModal}
              variant="primary"
              size="base"
              className="w-full"
            >
              로그인 / 회원가입
            </NeonButton>
          </div>
        </NeonCard>
      )}

      {/* 인기 태그 */}
      <NeonCard variant="primary" className="sticky top-44 z-20">
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
      <NeonCard variant="secondary" className="sticky top-96 z-10">
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

const SocialPost = ({
  post,
  onLikeUpdate,
  onPostUpdate,
  onPostDelete,
  onPostClick,
  currentUserId,
  onEditPost,
}) => {
  const [isLiked, setIsLiked] = useState(() => {
    return post.isLiked || post.is_liked || false;
  });
  const [likesCount, setLikesCount] = useState(() => {
    return post.likes_count || post.likesCount || 0;
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwner =
    currentUserId &&
    (post.user_id === currentUserId || post.user?.id === currentUserId);
  useEffect(() => {
    console.log("🔄 Post props 변경 감지:", {
      postId: post.id || post.board_id,
      newIsLiked: post.isLiked || post.is_liked,
      newLikesCount: post.likes_count || post.likesCount,
      currentIsLiked: isLiked,
      currentLikesCount: likesCount,
    });

    setIsLiked(post.isLiked || post.is_liked || false);
    setLikesCount(post.likes_count || post.likesCount || 0);
  }, [
    post.isLiked,
    post.is_liked,
    post.likes_count,
    post.likesCount,
    post.id,
    post.board_id,
  ]);

  const handleLikeClick = async () => {
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }

    if (isUpdating) return;

    const postId = post.id || post.board_id;
    const originalLiked = isLiked;
    const originalCount = likesCount;
    const newIsLiked = !originalLiked;
    const newCount = originalLiked ? originalCount - 1 : originalCount + 1;

    setIsLiked(newIsLiked);
    setLikesCount(newCount);
    setIsUpdating(true);

    try {
      const result = await toggleLike(postId, originalLiked);
      console.log(`💗 좋아요 API 응답:`, result);

      if (result) {
        setIsLiked(result.is_liked);
        setLikesCount(result.likes_count);

        if (onLikeUpdate) {
          onLikeUpdate(postId, result.likes_count, result.is_liked);
        }
      }
    } catch (error) {
      console.error("💥 좋아요 처리 실패:", error);

      setIsLiked(originalLiked);
      setLikesCount(originalCount);

      if (error.message === "로그인이 필요합니다.") {
        setShowLoginModal(true);
      } else {
        alert("좋아요 처리에 실패했습니다.");
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

  const handleEdit = () => {
    if (onEditPost) {
      onEditPost(post);
    } else {
      // 기본 편집 모달 방식
      setShowEditModal(true);
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
                        handleEdit();
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
  const { profile, logout } = useAuth(); // logout 함수 추가
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
      // 백엔드 검색 API에 맞춰 수정
      console.log("🏷️ 태그 클릭:", tag);

      // 화면에는 #태그 형태로 표시
      const displayQuery = `#${tag}`;
      setCurrentSearchTerm(displayQuery);

      // API에는 태그명만 전송 (백엔드가 search_posts에서 처리)
      handleSearch({
        query: tag, // 백엔드의 search_posts가 태그를 포함한 검색을 처리
      });
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
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        const currentPostId = post.id || post.board_id;
        if (currentPostId === postId) {
          const updatedPost = {
            ...post,
            likes_count: newLikesCount,
            likesCount: newLikesCount,
            isLiked: isLiked,
            is_liked: isLiked,
          };

          return updatedPost;
        }
        return post;
      });
      return updatedPosts;
    });

    setTrendingPosts((prevTrending) =>
      prevTrending.map((post) =>
        (post.id || post.board_id) === postId
          ? { ...post, likes_count: newLikesCount, isLiked: isLiked }
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
    // 댓글 변경 후 게시글 목록 새로고침
    loadPosts(searchFilters);
  };

  const handleTrendPostClick = (postId) => {
    if (postId === "all") {
      setTrendModalType("posts");
      setShowTrendModal(true);
    } else {
      handlePostClick(postId);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        await logout();
        // 로그아웃 후 필요한 추가 처리가 있다면 여기에 추가
      } catch (error) {
        console.error("로그아웃 실패:", error);
      }
    }
  };

  // 게시글 편집 핸들러 (navigate 사용하려면 useNavigate import 필요)
  const handleEditPost = (post) => {
    console.log("Edit post:", post);
    // navigate(`/write?edit=${post.id}`); // 편집 페이지로 이동하는 경우
    // 또는 모달로 편집하는 경우는 기존 방식 유지
  };

  // 태그 삭제 핸들러
  const handleRemoveTag = (tagName) => {
    if (window.confirm(`"${tagName}" 태그를 삭제하시겠습니까?`)) {
      console.log("Remove tag:", tagName);
      // 실제 태그 삭제 API 호출
    }
  };

  // 북마크 제거 핸들러
  const handleRemoveBookmark = (postId) => {
    if (window.confirm("북마크를 제거하시겠습니까?")) {
      console.log("Remove bookmark:", postId);
      // 실제 북마크 제거 API 호출
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
            {/* 헤더 
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
                        onEditPost={handleEditPost}
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
                profile={profile}
                onTagClick={handleTagClick}
                onPostClick={handleTrendPostClick}
                onShowLoginModal={() => setShowLoginModal(true)}
                onLogout={handleLogout}
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
        {showPostDetailModal && selectedPostId && (
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
