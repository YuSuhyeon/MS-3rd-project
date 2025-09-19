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
  User,
  Eye,
  ArrowUp,
  ArrowDown,
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

const fetchPosts = async (page = 1, limit = 4, searchParams = {}) => {
  console.log("?? API 호출 시도:", `${API_BASE_URL}/boards`);

  try {
    const headers = { "Content-Type": "application/json" };

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...searchParams,
    });

    console.log("?? 검색 파라미터:", searchParams);
    console.log("?? 요청 URL:", `${API_BASE_URL}/boards?${params}`);

    const response = await fetch(`${API_BASE_URL}/boards?${params}`, {
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`네트워크 응답이 올바르지 않습니다: ${response.status}`);
    }

    const data = await response.json();
    console.log("?? 받은 데이터:", data);

    if (searchParams.query) {
      console.log(
        `?? "${searchParams.query}" 검색 결과: ${data.posts?.length || 0}개`
      );
    }

    // 백엔드 BoardService의 응답 구조에 맞춤
    return {
      posts: data.posts || [],
      totalCount: data.pagination?.total_count || 0,
      totalPages: data.pagination?.total_pages || 0,
      currentPage: data.pagination?.current_page || page,
      hasNext: data.pagination?.has_next || false,
      hasPrev: data.pagination?.has_prev || false,
    };
  } catch (error) {
    console.error("?? 게시글 가져오기 실패:", error);
    return {
      posts: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNext: false,
      hasPrev: false,
    };
  }
};

const fetchTrendingTags = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/boards/trending/tags`);
    if (!response.ok) {
      throw new Error("인기 태그 조회 실패");
    }

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
    if (!response.ok) {
      throw new Error("인기 글 조회 실패");
    }

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
      `?? 좋아요 API 요청: postId=${postId}, 현재상태=${isLiked}, 메소드=${method}`
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
      credentials: "include",
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
    console.log("?? 검색어 동기화:", currentSearchTerm);
  }, [currentSearchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();

    const searchQuery = inputRef.current.value.trim();
    console.log("?? 현재 입력값:", searchQuery);

    if (!searchQuery) {
      onSearch({});
      return;
    }

    const { query: oldQuery, ...otherFilters } = searchFilters;

    const searchData = {
      query: searchQuery,
      ...otherFilters,
    };

    console.log("?? 전송할 검색 데이터:", searchData);
    onSearch(searchData);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentSearchTerm(value);
    console.log("?? 입력 변경:", value);
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

// 실시간 트렌드 컴포넌트 (상단 가로 배치)
const TrendingBar = ({
  trendingTags,
  trendingPosts,
  onTagClick,
  onPostClick,
  isMobile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showType, setShowType] = useState("tags"); // 'tags' 또는 'posts'

  // 5초마다 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      if (showType === "tags") {
        setCurrentIndex((prev) =>
          prev >= (trendingTags?.length || 0) - 1 ? 0 : prev + 1
        );
      } else {
        setCurrentIndex((prev) =>
          prev >= (trendingPosts?.length || 0) - 1 ? 0 : prev + 1
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [showType, trendingTags, trendingPosts]);

  // 15초마다 태그/글 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setShowType((prev) => (prev === "tags" ? "posts" : "tags"));
      setCurrentIndex(0);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6">
      <NeonCard variant="primary" className="overflow-hidden">
        <div
          className={`flex items-center ${
            isMobile ? "flex-col gap-3" : "justify-between"
          }`}
        >
          <div
            className={`flex items-center ${
              isMobile ? "flex-col gap-2 w-full" : "gap-4"
            }`}
          >
            {/* 타입 표시 */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span
                className={`text-white font-bold ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                {showType === "tags"
                  ? "🔥 실시간 인기 태그"
                  : "🌟 실시간 인기 글"}
              </span>
            </div>

            {/* 트렌드 아이템들 */}
            <div className="flex items-center gap-2 overflow-hidden flex-wrap">
              {showType === "tags" ? (
                trendingTags && trendingTags.length > 0 ? (
                  <motion.div
                    key={`tag-${currentIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    {trendingTags
                      .slice(0, isMobile ? 3 : 5)
                      .map((item, index) => (
                        <motion.button
                          key={item.tag || index}
                          onClick={() => onTagClick(item.tag)}
                          className={`px-2 py-1 rounded-full transition-all duration-300 ${
                            isMobile ? "text-xs" : "text-sm"
                          } ${
                            index === currentIndex % trendingTags.length
                              ? "bg-purple-500 text-white font-bold scale-110"
                              : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          #{item.tag || item.name || item}
                        </motion.button>
                      ))}
                  </motion.div>
                ) : (
                  <span
                    className={`text-gray-400 ${
                      isMobile ? "text-xs" : "text-sm"
                    }`}
                  >
                    인기 태그 없음
                  </span>
                )
              ) : trendingPosts && trendingPosts.length > 0 ? (
                <motion.div
                  key={`post-${currentIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 max-w-full overflow-hidden flex-wrap"
                >
                  {trendingPosts
                    .slice(0, isMobile ? 2 : 3)
                    .map((post, index) => (
                      <motion.button
                        key={post.id || post.board_id || index}
                        onClick={() => onPostClick(post.id || post.board_id)}
                        className={`px-2 py-1 rounded-lg transition-all duration-300 truncate ${
                          isMobile ? "text-xs max-w-32" : "text-sm max-w-xs"
                        } ${
                          index === currentIndex % trendingPosts.length
                            ? "bg-yellow-500/20 text-yellow-300 font-bold scale-105"
                            : "bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="flex items-center gap-1">
                          <span className="truncate">
                            {post.title || "제목 없음"}
                          </span>
                          <Heart className="w-2 h-2 flex-shrink-0" />
                          <span className="text-xs">
                            {post.likes_count || 0}
                          </span>
                        </span>
                      </motion.button>
                    ))}
                </motion.div>
              ) : (
                <span
                  className={`text-gray-400 ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  인기 글 없음
                </span>
              )}
            </div>
          </div>

          {/* 전체보기 버튼 */}
          {!isMobile && (
            <button
              onClick={() => {
                if (showType === "tags") {
                  onTagClick("all");
                } else {
                  onPostClick("all");
                }
              }}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-1"
            >
              <span>전체보기</span>
              <TrendingUp className="w-3 h-3" />
            </button>
          )}
        </div>
      </NeonCard>
    </div>
  );
};

// 모바일용 게시글 카드 컴포넌트
const MobilePostCard = ({
  post,
  index,
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

  const isOwner =
    currentUserId &&
    (post.user_id === currentUserId || post.user?.id === currentUserId);

  useEffect(() => {
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

  const handleLikeClick = async (e) => {
    e.stopPropagation();

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
      if (result) {
        setIsLiked(result.is_liked);
        setLikesCount(result.likes_count);
        if (onLikeUpdate) {
          onLikeUpdate(postId, result.likes_count, result.is_liked);
        }
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
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

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "오늘";
    if (diffDays === 2) return "어제";
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <NeonCard
        variant="primary"
        className="cursor-pointer mb-4"
        onClick={() => onPostClick && onPostClick(post.board_id || post.id)}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
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
                <span className="font-bold text-white text-sm">
                  {post.user_name || post.author || "익명"}
                </span>
                {isOwner && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                    내 글
                  </span>
                )}
                {post.created_at &&
                  new Date() - new Date(post.created_at) <
                    24 * 60 * 60 * 1000 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">
                      New
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.created_at)}</span>
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
                        onEditPost && onEditPost(post);
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
                        if (
                          window.confirm("정말로 이 게시글을 삭제하시겠습니까?")
                        ) {
                          onPostDelete &&
                            onPostDelete(post.id || post.board_id);
                        }
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
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            {post.title || "제목 없음"}
            {post.comments_count > 0 && (
              <span className="text-purple-400 text-sm">
                [{post.comments_count}]
              </span>
            )}
          </h3>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
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
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-400/30"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                isLiked
                  ? "text-red-400 bg-red-500/10"
                  : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              } ${isUpdating ? "opacity-50" : ""}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 text-gray-400 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Eye className="w-4 h-4" />
            <span>{post.views || 0}</span>
          </div>
        </div>

        {/* 모달들 */}
        <AnimatePresence>
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
        </AnimatePresence>

        {/* 옵션 메뉴 배경 클릭 감지 */}
        {showOptionsMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptionsMenu(false)}
          />
        )}
      </NeonCard>
    </motion.div>
  );
};

// 게시글 행 컴포넌트 (테이블 스타일 - 데스크톱용)
const PostRow = ({
  post,
  index,
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

  const isOwner =
    currentUserId &&
    (post.user_id === currentUserId || post.user?.id === currentUserId);

  useEffect(() => {
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

  const handleLikeClick = async (e) => {
    e.stopPropagation();

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
      console.log(`?? 좋아요 API 응답:`, result);

      if (result) {
        setIsLiked(result.is_liked);
        setLikesCount(result.likes_count);

        if (onLikeUpdate) {
          onLikeUpdate(postId, result.likes_count, result.is_liked);
        }
      }
    } catch (error) {
      console.error("?? 좋아요 처리 실패:", error);
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

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        await deletePost(post.id || post.board_id);
        onPostDelete && onPostDelete(post.id || post.board_id);
      } catch (error) {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEditPost) {
      onEditPost(post);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "오늘";
    if (diffDays === 2) return "어제";
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="border-b border-white/10 hover:bg-white/5 cursor-pointer transition-all duration-200 group"
        onClick={() => onPostClick && onPostClick(post.board_id || post.id)}
      >
        {/* 번호 */}
        <td className="px-4 py-4 text-center text-gray-400 text-sm w-16">
          {index + 1}
        </td>

        {/* 제목 & 내용 */}
        <td className="px-4 py-4 flex-1 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors truncate">
                {post.title || "제목 없음"}
              </h3>
              {/* 댓글 수 표시 */}
              {post.comments_count > 0 && (
                <span className="text-purple-400 text-sm">
                  [{post.comments_count}]
                </span>
              )}
              {/* 새글 표시 (24시간 이내) */}
              {post.created_at &&
                new Date() - new Date(post.created_at) <
                  24 * 60 * 60 * 1000 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">
                    New
                  </span>
                )}
            </div>
            <p className="text-gray-400 text-sm truncate">
              {truncateText(post.content, 60)}
            </p>
            {/* 태그 */}
            {post.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(Array.isArray(post.tags) ? post.tags : post.tags.split(","))
                  .slice(0, 3)
                  .map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </td>

        {/* 작성자 */}
        <td className="px-4 py-4 text-center w-24">
          <div className="flex flex-col items-center gap-1">
            <img
              src={post.user_profile_image || "/img/default_profile_img.png"}
              alt="프로필"
              className="w-6 h-6 rounded-full border border-purple-400"
              onError={(e) => {
                e.target.src = "/img/default_profile_img.png";
              }}
            />
            <span className="text-white text-sm">
              {post.user_name || post.author || "익명"}
            </span>
            {isOwner && (
              <span className="px-1 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                내글
              </span>
            )}
          </div>
        </td>

        {/* 작성일 */}
        <td className="px-4 py-4 text-center text-gray-400 text-sm w-20">
          {formatDate(post.created_at)}
        </td>

        {/* 좋아요 & 댓글 */}
        <td className="px-4 py-4 text-center w-20">
          <div className="flex flex-col gap-1">
            <button
              onClick={handleLikeClick}
              disabled={isUpdating}
              className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                isLiked
                  ? "text-red-400 bg-red-500/10"
                  : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              } ${isUpdating ? "opacity-50" : ""}`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </button>
            {/* <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
              <MessageCircle className="w-3 h-3" />
              <span>{post.comments_count || 0}</span>
            </div> */}
          </div>
        </td>

        {/* 옵션 메뉴 (작성자만) */}
        <td className="px-4 py-4 text-center w-12">
          {isOwner && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsMenu(!showOptionsMenu);
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showOptionsMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-2 min-w-[100px] z-50"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-1 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-1 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </td>
      </motion.tr>

      {/* 모달들 */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>

      {/* 옵션 메뉴 배경 클릭 감지 */}
      {showOptionsMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptionsMenu(false)}
        />
      )}
    </>
  );
};

// 게시판 테이블 컴포넌트
const PostTable = ({ posts, ...props }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <NeonCard variant="primary" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20 bg-white/5">
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium w-16">
                번호
              </th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">
                제목
              </th>
              <th className="px-4 py-3 text-center text-gray-300 text-sm font-medium w-24">
                작성자
              </th>
              <th
                className="px-4 py-3 text-center text-gray-300 text-sm font-medium w-20 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center justify-center gap-1">
                  작성일
                  {sortConfig.key === "created_at" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    ))}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-gray-300 text-sm font-medium w-20 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort("likes_count")}
              >
                <div className="flex items-center justify-center gap-1">
                  좋아요
                  {sortConfig.key === "likes_count" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    ))}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-gray-300 text-sm font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <PostRow
                key={post.id || post.board_id}
                post={post}
                index={index}
                {...props}
              />
            ))}
          </tbody>
        </table>
      </div>
    </NeonCard>
  );
};

// 메인 컴포넌트
export default function CommunitySocial() {
  const { profile, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
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
  const [selectedTab, setSelectedTab] = useState("all");

  const currentUserId = profile?.sub || profile?.id || profile?.user_id;

  const loadPosts = async (searchParams = {}, category = "all", page = 1) => {
    console.log("?? 백엔드 연결 테스트 시작...");
    setLoading(true);
    setError(null);

    let newSearchParams = { ...searchParams };
    if (category !== "all") {
      newSearchParams = { ...newSearchParams, category };
    }

    try {
      const result = await fetchPosts(page, 4, newSearchParams);
      console.log("?? 받은 데이터:", result);

      setPosts(result.posts);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      });

      if (Object.keys(newSearchParams).length > 0 && newSearchParams.query) {
        setIsSearchMode(true);
        if (result.posts.length === 0) {
          setError(`"${newSearchParams.query}"에 대한 검색 결과가 없습니다.`);
        }
      } else {
        setIsSearchMode(false);
        if (result.posts.length === 0) {
          setError("아직 게시글이 없습니다.");
        }
      }
    } catch (error) {
      console.error("?? 연결 테스트 실패:", error);
      setError(`연결 실패: ${error.message}`);
      setPosts([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
      });
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

  // 로그인 상태 변경 시 모달 닫기
  useEffect(() => {
    if (profile) {
      setShowLoginModal(false);
      console.log("로그인 완료, 모달 닫기");
    }
  }, [profile]);

  const handleSearch = (searchParams) => {
    console.log("?? 받은 검색 파라미터:", searchParams);

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

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadPosts(searchFilters, tab, 1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
      loadPosts(searchFilters, selectedTab, page);
    }
  };

  const handleTagClick = (tag) => {
    if (tag === "all") {
      setTrendModalType("tags");
      setShowTrendModal(true);
    } else {
      console.log("??? 태그 클릭:", tag);
      const displayQuery = `#${tag}`;
      setCurrentSearchTerm(displayQuery);
      handleSearch({
        query: tag,
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
    loadPosts(searchFilters, selectedTab, 1);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setShowPostDetailModal(true);
  };

  const handleClosePostDetailModal = () => {
    setShowPostDetailModal(false);
    setSelectedPostId(null);
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

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        await logout();
      } catch (error) {
        console.error("로그아웃 실패:", error);
      }
    }
  };

  const handleEditPost = (post) => {
    console.log("Edit post:", post);
  };

  const handleRemoveTag = (tagName) => {
    if (window.confirm(`"${tagName}" 태그를 삭제하시겠습니까?`)) {
      console.log("Remove tag:", tagName);
    }
  };

  const handleRemoveBookmark = (postId) => {
    if (window.confirm("북마크를 제거하시겠습니까?")) {
      console.log("Remove bookmark:", postId);
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
        <span className="ml-4 text-white text-lg">게시판 로딩 중...</span>
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
            {/* 게시판 헤더 - 모바일 최적화 */}
            <div
              className={`mb-6 ${
                isMobile ? "space-y-4" : "flex items-center justify-between"
              }`}
            >
              <div className={isMobile ? "text-center" : ""}>
                <GradientText
                  variant="primary"
                  size={isMobile ? "2xl" : "3xl"}
                  className="font-bold"
                >
                  🌟 커뮤니티 게시판
                </GradientText>
                <p
                  className={`text-white/70 mt-2 ${isMobile ? "text-sm" : ""}`}
                >
                  생생한 여행 후기를 공유해보세요!
                </p>
              </div>

              {/* 로그인 상태 + 글쓰기 버튼 */}
              <div
                className={`flex items-center gap-2 ${
                  isMobile ? "justify-center flex-wrap" : "gap-4"
                }`}
              >
                {/* 로그인 상태 표시 */}
                {profile ? (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-purple-400/30 ${
                      isMobile ? "flex-1 min-w-0" : ""
                    }`}
                  >
                    <img
                      src={profile.picture || "/img/default_profile_img.png"}
                      alt="프로필"
                      className="w-6 h-6 rounded-full border border-purple-400 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "/img/default_profile_img.png";
                      }}
                    />
                    <div className={`${isMobile ? "min-w-0 flex-1" : ""}`}>
                      <p
                        className={`text-white font-medium truncate ${
                          isMobile ? "text-sm" : ""
                        }`}
                      >
                        {profile.name || profile.nickname || "사용자"}님
                      </p>
                      {!isMobile && (
                        <p className="text-green-400 text-xs">로그인됨</p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                      title="로그아웃"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <NeonButton
                      onClick={() => setShowLoginModal(true)}
                      //variant="secondary"
                      size="sm"
                    >
                      로그인
                    </NeonButton>
                  </div>
                )}

                {/* 글쓰기 버튼 */}
                <NeonButton
                  onClick={handleCreatePostClick}
                  variant="primary"
                  size={isMobile ? "sm" : "base"}
                  className="flex items-center gap-1 flex-shrink-0"
                  disabled={!profile}
                  title={!profile ? "로그인이 필요합니다" : ""}
                >
                  <Plus className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                  {isMobile ? "글쓰기" : "글쓰기"}
                </NeonButton>
              </div>
            </div>

            {/* 탭 메뉴 + 검색 */}
            <div className="flex justify-between items-center mb-6">
              {/* 탭 메뉴 */}
              <div className="flex justify-start gap-6">
                <button
                  onClick={() => handleTabChange("all")}
                  className={`${
                    selectedTab === "all"
                      ? "text-purple-300 "
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => handleTabChange("travel")}
                  className={`${
                    selectedTab === "travel"
                      ? "text-purple-300 "
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  후기
                </button>
                <button
                  onClick={() => handleTabChange("official")}
                  className={` ${
                    selectedTab === "official"
                      ? "text-purple-300 "
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  정보
                </button>
              </div>

              {/* 컴팩트 검색 */}
              <div className="flex items-center gap-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const searchQuery = e.target.search.value.trim();
                    if (!searchQuery) {
                      handleSearch({});
                      return;
                    }
                    handleSearch({ query: searchQuery });
                  }}
                  className="flex items-center"
                >
                  <div className="relative">
                    <input
                      name="search"
                      type="text"
                      placeholder="검색..."
                      defaultValue={currentSearchTerm}
                      className="w-48 bg-white/10 text-white placeholder-white/50 px-3 py-2 pl-8 rounded-lg border border-white/20 focus:outline-none focus:border-purple-400 text-sm"
                    />
                    <Search className="w-4 h-4 text-purple-400 absolute left-2.5 top-2.5" />
                  </div>
                </form>

                {(currentSearchTerm ||
                  Object.values(searchFilters).some((f) => f)) && (
                  <button
                    onClick={() => {
                      setCurrentSearchTerm("");
                      setSearchFilters({});
                      handleSearch({});
                    }}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-purple-400 rounded transition-colors"
                  >
                    전체
                  </button>
                )}
              </div>
            </div>

            {/* 게시글 목록 - 반응형 */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {posts.length > 0 ? (
                <>
                  {/* 모바일: 카드 형식 */}
                  <div className="block md:hidden">
                    {posts.map((post, index) => (
                      <MobilePostCard
                        key={post.id || post.board_id}
                        post={post}
                        index={index}
                        onLikeUpdate={handleLikeUpdate}
                        onPostUpdate={handlePostUpdate}
                        onPostDelete={handlePostDelete}
                        onPostClick={handlePostClick}
                        currentUserId={currentUserId}
                        onEditPost={handleEditPost}
                      />
                    ))}
                  </div>

                  {/* 데스크톱: 테이블 형식 */}
                  <div className="hidden md:block">
                    <PostTable
                      posts={posts}
                      onLikeUpdate={handleLikeUpdate}
                      onPostUpdate={handlePostUpdate}
                      onPostDelete={handlePostDelete}
                      onPostClick={handlePostClick}
                      currentUserId={currentUserId}
                      onEditPost={handleEditPost}
                    />
                  </div>
                </>
              ) : (
                <NeonCard
                  variant="warning"
                  className="text-center py-16"
                  delay={0.5}
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
                      : "첫 게시글을 작성해보세요!"}
                  </p>
                  {profile && (
                    <NeonButton
                      onClick={handleCreatePostClick}
                      variant="primary"
                      size="base"
                    >
                      <Plus className="w-5 h-5 mr-2" />새 게시글 작성
                    </NeonButton>
                  )}
                </NeonCard>
              )}
            </motion.section>

            {/* 페이지네이션 */}
            <div className="mt-8 flex justify-center items-center gap-2">
              {pagination.totalPages > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      !pagination.hasPrev
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    이전
                  </button>

                  {/* 페이지 번호들 */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;
                    const isVisible =
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.currentPage) <= 1;

                    if (!isVisible) {
                      // 생략 표시
                      if (
                        page === pagination.currentPage - 2 ||
                        page === pagination.currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-gray-500 text-sm"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          isCurrentPage
                            ? "bg-purple-500 text-white font-bold"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      !pagination.hasNext
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    다음
                  </button>

                  {/* 페이지 정보 표시 */}
                  <div className="ml-4 text-sm text-gray-400">
                    {pagination.currentPage} / {pagination.totalPages}
                    <span className="ml-2 text-xs">
                      (총 {pagination.totalCount}개)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 실시간 트렌드 바 - 하단 */}
            <TrendingBar
              trendingTags={trendingTags}
              trendingPosts={trendingPosts}
              onTagClick={handleTagClick}
              onPostClick={handleTrendPostClick}
              isMobile={isMobile}
            />
          </div>

          {/* 사이드바 제거됨 - 로그인 상태만 필요한 경우 별도 처리 */}
        </div>
      </div>

      {/* 모바일 글쓰기 버튼 */}
      {isMobile && (
        <motion.button
          onClick={handleCreatePostClick}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* 모달들 */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            onClose={() => {
              setShowLoginModal(false);
              console.log("로그인 모달 수동으로 닫기");
            }}
            onSuccess={() => {
              setShowLoginModal(false);
              console.log("로그인 성공, 모달 닫기");
            }}
          />
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
