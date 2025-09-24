import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Pin,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/community/LoginModal";
import PostModal from "../components/community/PostModal";
import TrendModal from "../components/community/TrendModal";
import useIsMobile from "./useIsMobile";
import {
  BackgroundEffect,
  NeonCard,
  GradientText,
  NeonButton,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import PostDetailModal from "../components/community/PostDetailModal";
import mockInfoData from "../utils/mockInfoData";
import { getInfoPosts } from "../utils/mockInfoData";

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

// 터치 스와이프 Hook
const useSwipeScroll = (ref) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleTouchStart = (e) => {
    setIsScrolling(true);
    setStartX(e.touches[0].clientX);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.touches[0].clientX;
    const walk = (startX - x) * 2; // 스크롤 속도 조절
    ref.current.scrollLeft = scrollLeft + walk;
  };

  const handleTouchEnd = () => {
    setIsScrolling(false);
  };

  const handleMouseDown = (e) => {
    setIsScrolling(true);
    setStartX(e.clientX);
    setScrollLeft(ref.current.scrollLeft);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.clientX;
    const walk = (startX - x) * 2;
    ref.current.scrollLeft = scrollLeft + walk;
  };

  const handleMouseUp = () => {
    setIsScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsScrolling(false);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  };
};

const API_BASE_URL = "/api";
const CITY_API_BASE =
  "https://team03-function-cce6cugxacd3aqcs.eastus-01.azurewebsites.net/api/CityDataDetailAPI";

// 기본 서울 지역 목록 (아이콘/표시명 유지)
const DEFAULT_SEOUL_AREAS = [
  { name: "강남", areaName: "강남 MICE 관광특구", icon: "🏢" },
  { name: "광화문", areaName: "광화문·덕수궁", icon: "🏛️" },
  { name: "명동", areaName: "명동 관광특구", icon: "🛍️" },
  { name: "서울역", areaName: "서울역", icon: "🚂" },
  { name: "이태원", areaName: "이태원 관광특구", icon: "🌍" },
  { name: "잠실", areaName: "잠실 관광특구", icon: "🎡" },
  { name: "종로", areaName: "종로·청계 관광특구", icon: "🛒" },
  { name: "홍대", areaName: "홍대 관광특구", icon: "🎨" },
];

const fetchPosts = async (page = 1, limit = 4, searchParams = {}) => {
  // "정보" 탭(official)일 때는 목업 데이터 사용
  if (searchParams.category === "official") {
    try {
      const result = getInfoPosts(page, limit, searchParams.query || "");

      // API 지연 시뮬레이션 (선택사항)
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        posts: result.posts,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error) {
      throw error; // loadPosts의 error handling으로 전달
    }
  }

  try {
    const headers = { "Content-Type": "application/json" };

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...searchParams,
    });

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
//게시글 삭제
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
      <div
        className={`relative bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-blue-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${
          isMobile ? "p-3" : "p-6"
        }`}
      >
        <div
          className={`flex items-center ${
            isMobile ? "flex-col gap-1" : "justify-between"
          }`}
        >
          <div
            className={`flex items-center ${
              isMobile ? "flex-col gap-1 w-full" : "gap-4"
            }`}
          >
            {/* 타입 탭 - 데스크톱에서만 표시 */}
            <div
              className={`flex items-center ${
                isMobile ? "w-full justify-center" : ""
              } gap-2`}
            >
              <div className="w-2 h-5 animate-pulse mr-1">✨</div>
              {isMobile ? (
                <span className="text-white font-bold text-sm">
                  실시간 인기 {showType === "tags" ? "태그" : "글"}
                </span>
              ) : (
                <div className="bg-white/5 rounded-lg p-0.5 border border-white/10 flex">
                  <button
                    onClick={() => setShowType("tags")}
                    className={`px-3 py-1 rounded-md text-xs ${
                      showType === "tags"
                        ? "bg-purple-500 text-white"
                        : "text-purple-300 hover:text-white"
                    }`}
                  >
                    인기태그
                  </button>
                  <button
                    onClick={() => setShowType("posts")}
                    className={`px-3 py-1 rounded-md text-xs ${
                      showType === "posts"
                        ? "bg-yellow-500/30 text-yellow-200"
                        : "text-yellow-300 hover:text-white"
                    }`}
                  >
                    인기글
                  </button>
                </div>
              )}
            </div>

            {/* 트렌드 아이템들 */}
            <div className="flex items-center gap-1 overflow-hidden flex-wrap">
              {showType === "tags" ? (
                trendingTags && trendingTags.length > 0 ? (
                  <motion.div
                    key={`tag-${currentIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-1 flex-wrap"
                  >
                    {trendingTags
                      .slice(0, isMobile ? 2 : 5)
                      .map((item, index) => (
                        <motion.button
                          key={item.tag || index}
                          onClick={() => onTagClick(item.tag)}
                          className={`px-1.5 py-0.5 rounded-full transition-all duration-300 text-xs ${
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
                  className="flex items-center gap-1 max-w-full overflow-hidden flex-wrap"
                >
                  {trendingPosts
                    .slice(0, isMobile ? 1 : 3)
                    .map((post, index) => (
                      <motion.button
                        key={post.id || post.board_id || index}
                        onClick={() => onPostClick(post.id || post.board_id)}
                        className={`px-1.5 py-0.5 rounded-lg transition-all duration-300 truncate text-xs ${
                          isMobile ? "max-w-24" : "max-w-xs"
                        } ${
                          index === currentIndex % trendingPosts.length
                            ? "bg-yellow-500/20 text-yellow-300 font-bold scale-105"
                            : "bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="truncate">
                          {post.title || "제목 없음"}
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
      </div>
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
              className={`w-10 h-10 rounded-full border-2 transition-colors ${
                isOwner ? "border-purple-300" : "border-purple-400"
              }`}
              onError={(e) => {
                e.target.src = "/img/default_profile_img.png";
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-sm ${
                    isOwner
                      ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      : "text-white"
                  }`}
                >
                  {post.user_name || post.author || "익명"}
                </span>
                {post.created_at &&
                  new Date() - new Date(post.created_at) <
                    24 * 60 * 60 * 1000 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded">
                      New
                    </span>
                  )}
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
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm("게시글을 삭제하시겠습니까?")) {
                          try {
                            await deletePost(post.id || post.board_id);
                            onPostDelete &&
                              onPostDelete(post.id || post.board_id);
                            alert("게시글이 삭제되었습니다.");
                          } catch (error) {
                            console.error("삭제 실패:", error);
                            alert("삭제에 실패했습니다.");
                          }
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
          )}{" "}
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
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-400/30 truncate whitespace-nowrap"
                >
                  {String(tag).trim()}
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
                      className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs truncate whitespace-nowrap"
                    >
                      {String(tag).trim()}
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
            <span
              className={`text-sm font-medium ${
                isOwner
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-white"
              }`}
            >
              {post.user_name || post.author || "익명"}
            </span>
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

// Live Seoul 섹션 컴포넌트
const LiveSeoulSection = ({ isMobile, liveAreas = [] }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const places = liveAreas.length > 0 ? liveAreas : DEFAULT_SEOUL_AREAS;

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollTo = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = isMobile ? 120 : 150;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleScroll = () => checkScrollButtons();

    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll);
      return () => {
        if (scrollRef.current) {
          scrollRef.current.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [places]);

  return (
    <div className={`${isMobile ? "mb-6 mt-6" : "mb-8"}`}>
      {/* 통합된 박스 */}
      <div>
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
          <div className="px-3 py-1.5 bg-red-600 rounded-full border border-red-400 shadow-lg">
            <span className="text-white text-xs font-bold">● LIVE </span>
          </div>
          <span className="text-white font-medium">인기 여행지</span>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className={`flex gap-3 pb-2 flex-nowrap ${
              isMobile
                ? "gap-3 mobile-horizontal-scroll"
                : "gap-4 overflow-x-auto scrollbar-hide"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
          >
            {(isMobile ? places.slice(0, 8) : places).map((place) => (
              <Link
                key={place.areaName}
                to={`/popular-places/${encodeURIComponent(place.areaName)}`}
                className="flex-shrink-0"
              >
                <NeonCard
                  variant="success"
                  className={`text-center hover:scale-105 transition-all duration-300 cursor-pointer border  ${
                    isMobile ? "py-2 px-2 w-16 min-w-16" : "py-4 w-24"
                  }`}
                >
                  <div
                    className={`${isMobile ? "text-lg mb-1" : "text-2xl mb-2"}`}
                  >
                    {place.icon}
                  </div>
                  <div
                    className={`text-xs text-white font-medium leading-tight truncate whitespace-nowrap`}
                  >
                    {place.name}
                  </div>
                </NeonCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
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
        <table className="w-full table-fixed">
          {/* table-fixed 추가 */}
          <thead>
            <tr className="border-b border-white/20 bg-white/5">
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium w-16">
                번호
              </th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium w-96">
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

export default function CommunitySocial() {
  const { t } = useTranslation("common");
  const { profile, logout } = useAuth();
  //  const isMobile = useMediaQuery("(max-width: 768px)");
  const isMobile = useIsMobile();

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
  const [liveAreas, setLiveAreas] = useState([]);
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
  const [selectedTab, setSelectedTab] = useState("official");

  const currentUserId = profile?.sub || profile?.id || profile?.user_id;

  // 공식(정보) 탭 mock 데이터 다국어 매핑
  const getTranslatedTitle = (post) => {
    const keyId = post.id || post.board_id;
    if (post.category === "official") {
      return t(`community.info.posts.${keyId}.title`, {
        defaultValue: post.title || "제목 없음",
      });
    }
    return post.title || "제목 없음";
  };

  const getTranslatedContent = (post) => {
    const keyId = post.id || post.board_id;
    if (post.category === "official") {
      return t(`community.info.posts.${keyId}.content`, {
        defaultValue: post.content || "",
      });
    }
    return post.content || "";
  };

  const loadPosts = async (searchParams = {}, category = "all", page = 1) => {
    setLoading(true);
    setError(null);

    let newSearchParams = { ...searchParams };
    if (category !== "all") {
      newSearchParams = { ...newSearchParams, category };
    }

    // 후기탭일 때는 3개씩, 정보탭일 때는 4개씩 로드
    const limit = category === "travel" ? 3 : 4;

    try {
      const result = await fetchPosts(page, limit, newSearchParams);

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
    loadPosts({}, "official", 1);
    loadTrendingData();
    // 실시간 서울 지역 데이터 로드
    const loadLiveAreas = async () => {
      try {
        const results = await Promise.all(
          DEFAULT_SEOUL_AREAS.map(async (area) => {
            try {
              const res = await fetch(
                `${CITY_API_BASE}?areaName=${encodeURIComponent(area.areaName)}`
              );
              if (!res.ok) throw new Error("city api error");
              const data = await res.json();
              const ppltnMax = Number(
                data?.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_PPLTN_MAX?._text ||
                  0
              );
              const lvl =
                data?.LIVE_PPLTN_STTS?.LIVE_PPLTN_STTS?.AREA_CONGEST_LVL
                  ?._text || "";
              return { ...area, ppltnMax, lvl };
            } catch (e) {
              return { ...area, ppltnMax: 0, lvl: "" };
            }
          })
        );
        // 인구 최대값 기준 내림차순 정렬
        results.sort((a, b) => b.ppltnMax - a.ppltnMax);
        setLiveAreas(results);
      } catch (e) {
        setLiveAreas([]);
      }
    };
    loadLiveAreas();
  }, []);

  // 로그인 상태 변경 시 모달 닫기
  useEffect(() => {
    if (profile) {
      setShowLoginModal(false);
      console.log("로그인 완료, 모달 닫기");
    }
  }, [profile]);

  const handleSearch = (searchParams) => {
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
    // 현재 선택된 탭 유지
    loadPosts(searchFilters, selectedTab, 1);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setShowPostDetailModal(true);
  };

  //닫고나서 해당 탭에 그대로 상태 유지하고 새로고침할수있도록
  const handleClosePostDetailModal = () => {
    setShowPostDetailModal(false);
    setSelectedPostId(null);
    // 현재 탭과 페이지를 유지하면서 새로고침
    loadPosts(searchFilters, selectedTab, pagination.currentPage);
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
    <BackgroundEffect className="flex-1 min-h-screen neon-scrollbar overflow-y-auto overflow-x-hidden">
      <NeonScrollbarStyles />
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .swipe-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        .swipe-scroll::-webkit-scrollbar {
          display: none;
        }
        .mobile-horizontal-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
        .mobile-horizontal-scroll > * {
          flex-shrink: 0;
        }
      `}</style>

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
      <div className="relative z-10 p-6 pt-12 md:pt-16 w-full max-w-7xl mx-auto">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* 왼쪽 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 헤더: Tour와 동일한 톤의 제목/부제 */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
                Klover Community
              </h1>
              <p className="text-gray-400 text-sm sm:text-base mt-1">
                {t("community.subtitle", {
                  defaultValue:
                    " Editor's Pick과 실시간 정보들, 서울을 여행하는 여행자들과 함께해보세요",
                })}
              </p>
            </div>

            {/* 상단 검색 입력 (모바일 전용) */}
            <div className="mb-4 md:hidden">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder={t("community.search_placeholder", {
                    defaultValue: "검색...",
                  })}
                  value={currentSearchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCurrentSearchTerm(value);
                    if (window.searchTimeout) {
                      clearTimeout(window.searchTimeout);
                    }
                    window.searchTimeout = setTimeout(() => {
                      if (value.trim()) {
                        handleSearch({ query: value.trim() });
                      } else {
                        handleSearch({});
                      }
                    }, 400);
                  }}
                  className="w-full bg-white/10 text-white placeholder-white/50 pl-9 pr-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-purple-400 text-sm"
                />
                <Search className="w-4 h-4 text-purple-300 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* 탭 메뉴 + 검색 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              {/* 탭 메뉴 */}
              <div className="flex justify-start gap-1 sm:gap-6 w-full sm:w-auto">
                <button
                  onClick={() => handleTabChange("official")}
                  className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex-1 sm:flex-none ${
                    selectedTab === "official"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  정보
                </button>
                <button
                  onClick={() => handleTabChange("travel")}
                  className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all flex-1 sm:flex-none ${
                    selectedTab === "travel"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  후기
                </button>
              </div>

              {/* 검색 + 글쓰기 버튼 */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* 데스크톱 검색 입력 (탭 우측 정렬) */}
                <div className="hidden md:block ml-auto">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder={t("community.search_placeholder", {
                        defaultValue: "검색...",
                      })}
                      value={currentSearchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCurrentSearchTerm(value);
                        if (window.searchTimeout) {
                          clearTimeout(window.searchTimeout);
                        }
                        window.searchTimeout = setTimeout(() => {
                          if (value.trim()) {
                            handleSearch({ query: value.trim() });
                          } else {
                            handleSearch({});
                          }
                        }, 400);
                      }}
                      className="w-full bg-white/10 text-white placeholder-white/50 pl-9 pr-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-purple-400 text-sm"
                    />
                    <Search className="w-4 h-4 text-purple-300 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 실시간 트렌드 바 - 후기탭에서만 표시 */}
            {selectedTab === "travel" && (
              <TrendingBar
                trendingTags={trendingTags}
                trendingPosts={trendingPosts}
                onTagClick={handleTagClick}
                onPostClick={handleTrendPostClick}
                isMobile={isMobile}
              />
            )}

            {/* 게시글 목록 - 반응형 */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {selectedTab === "official" ? (
                // 정보 탭일 때는 공지사항을 구분해서 표시
                posts.length > 0 ? (
                  <div className="space-y-6">
                    {/* 모바일 */}
                    <div className="block md:hidden">
                      {/* 공지사항 - 모바일용 간략 버전 */}
                      {posts.filter((post) => post.priority === "notice")
                        .length > 0 && (
                        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-yellow-500/20 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-5 animate-pulse mr-1">📌</div>
                            <h3 className="text-base font-semibold text-white">
                              공지사항
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {posts
                              .filter((post) => post.priority === "notice")
                              .slice(0, 3) // 모바일에서는 최대 3개 표시
                              .map((post, index) => (
                                <div
                                  key={post.id || post.board_id}
                                  className="bg-gray-900/50 rounded-lg border border-gray-600/30 p-3"
                                >
                                  <h4
                                    className="text-white font-medium hover:text-purple-300 transition-colors cursor-pointer text-sm mb-1"
                                    onClick={() =>
                                      handlePostClick(post.id || post.board_id)
                                    }
                                  >
                                    {getTranslatedTitle(post)}
                                  </h4>
                                  <p className="text-gray-300 text-xs line-clamp-1">
                                    {getTranslatedContent(post)?.substring(
                                      0,
                                      50
                                    )}
                                    ...
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* LIVE Seoul - 모바일용 가로 스크롤 */}
                      <LiveSeoulSection isMobile={true} />

                      {/* Editor's Pick 섹션 */}
                      {posts.filter((post) => post.priority !== "notice")
                        .length > 0 && (
                        <div className="mt-6">
                          <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-purple-500/30 hover:border-purple-400/50 hover:shadow-purple-500/20 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-2 h-5 animate-pulse mr-1">
                                ✨
                              </div>
                              <h3 className="text-base font-semibold text-white">
                                Klover Editor's Pick!
                              </h3>
                            </div>
                            <div className="space-y-3">
                              {posts
                                .filter((post) => post.priority !== "notice")
                                .slice(0, 2) // 모바일에서는 2개만 표시
                                .map((post, index) => (
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

                            {/* 정보탭 페이지네이션 - Editor's Pick 안에 */}
                            {pagination.totalPages > 1 && (
                              <div className="mt-6 flex justify-center items-center gap-2">
                                <button
                                  onClick={() =>
                                    handlePageChange(pagination.currentPage - 1)
                                  }
                                  disabled={!pagination.hasPrev}
                                  className={`p-2 rounded-lg transition-colors ${
                                    !pagination.hasPrev
                                      ? "text-gray-500 cursor-not-allowed"
                                      : "text-white hover:bg-white/10"
                                  }`}
                                >
                                  <ArrowLeft className="w-5 h-5" />
                                </button>

                                <span className="px-4 py-2 text-sm text-gray-300">
                                  {pagination.currentPage} /{" "}
                                  {pagination.totalPages}
                                </span>

                                <button
                                  onClick={() =>
                                    handlePageChange(pagination.currentPage + 1)
                                  }
                                  disabled={!pagination.hasNext}
                                  className={`p-2 rounded-lg transition-colors ${
                                    !pagination.hasNext
                                      ? "text-gray-500 cursor-not-allowed"
                                      : "text-white hover:bg-white/10"
                                  }`}
                                >
                                  <ArrowUp className="w-5 h-5 rotate-90" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 데스크톱: 공지사항 → 실시간인기여행지 → Editor's Pick 순서 */}
                    <div className="hidden md:block">
                      {/* 공지사항 섹션 */}
                      {posts.filter((post) => post.priority === "notice")
                        .length > 0 && (
                        <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-yellow-500/20 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-6 mb-8">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-5 animate-pulse mr-1">📌</div>
                            <h3 className="text-lg font-semibold text-white">
                              공지사항
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {posts
                              .filter((post) => post.priority === "notice")
                              .slice(0, 3) // 데스크톱에서도 최대 3개 표시
                              .map((post, index) => (
                                <div
                                  key={post.id || post.board_id}
                                  className="bg-gray-900/50 rounded-lg border border-gray-600/30 p-4"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4
                                          className="text-white font-medium hover:text-purple-300 transition-colors cursor-pointer"
                                          onClick={() =>
                                            handlePostClick(
                                              post.id || post.board_id
                                            )
                                          }
                                        >
                                          {getTranslatedTitle(post)}
                                        </h4>
                                      </div>
                                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                                        {getTranslatedContent(post)?.substring(
                                          0,
                                          100
                                        )}
                                        ...
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>{post.user_name}</span>
                                        <span>👀 {post.likes_count || 0}</span>
                                        <span>
                                          ❤️ {post.comments_count || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* 실시간 인기 여행지 - 데스크톱용 가로 스크롤 */}
                      <LiveSeoulSection
                        isMobile={false}
                        liveAreas={liveAreas}
                      />

                      {/* Editor's Pick 섹션 */}
                      {posts.filter((post) => post.priority !== "notice")
                        .length > 0 && (
                        <div>
                          <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-purple-500/30 hover:border-purple-400/50 hover:shadow-purple-500/20 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-6">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-2 h-5 animate-pulse mr-1">
                                ✨
                              </div>
                              <h3 className="text-lg font-semibold text-white">
                                Editor's Pick!
                              </h3>
                            </div>

                            {/* 데스크톱: 매거진 카드 형식 */}
                            <div className="grid grid-cols-3 gap-6">
                              {posts
                                .filter((post) => post.priority !== "notice")
                                .slice(0, 3)
                                .map((post, index) => {
                                  const cover =
                                    post.image_url ||
                                    post.cover_image ||
                                    post.thumbnail_url ||
                                    post.image ||
                                    null;
                                  return (
                                    <NeonCard
                                      key={post.id || post.board_id}
                                      variant="primary"
                                      className="relative group overflow-hidden cursor-pointer h-full"
                                      onClick={() =>
                                        handlePostClick(
                                          post.id || post.board_id
                                        )
                                      }
                                    >
                                      {cover && (
                                        <div className="relative h-32 w-full overflow-hidden">
                                          <img
                                            src={cover}
                                            alt="cover"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                              e.currentTarget.style.display =
                                                "none";
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        </div>
                                      )}
                                      <div className="relative z-10 p-5 flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-3">
                                          <img
                                            src={
                                              post.user_profile_image ||
                                              "/img/default_profile_img.png"
                                            }
                                            alt="프로필"
                                            className="w-8 h-8 rounded-full border border-purple-400/50"
                                            onError={(e) => {
                                              e.currentTarget.src =
                                                "/img/default_profile_img.png";
                                            }}
                                          />
                                          <div className="text-xs text-gray-300">
                                            <div className="font-medium text-white/90">
                                              {post.user_name ||
                                                post.author ||
                                                "익명"}
                                            </div>
                                            <div className="text-gray-400">
                                              {post.created_at
                                                ? new Date(
                                                    post.created_at
                                                  ).toLocaleDateString()
                                                : ""}
                                            </div>
                                          </div>
                                        </div>
                                        <h4 className="text-lg font-extrabold leading-snug bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1 line-clamp-2">
                                          {getTranslatedTitle(post)}
                                        </h4>
                                        <p className="text-xs text-gray-300/90 line-clamp-2 mb-2">
                                          {getTranslatedContent(post) ||
                                            "내용이 없습니다."}
                                        </p>
                                        {post.tags && (
                                          <div className="mt-auto flex flex-wrap gap-2">
                                            {(Array.isArray(post.tags)
                                              ? post.tags
                                              : post.tags.split(",")
                                            )
                                              .slice(0, 3)
                                              .map((tag, i) => (
                                                <span
                                                  key={i}
                                                  className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-purple-200 border border-white/20 truncate whitespace-nowrap"
                                                >
                                                  {String(tag).trim()}
                                                </span>
                                              ))}
                                          </div>
                                        )}
                                      </div>
                                    </NeonCard>
                                  );
                                })}
                            </div>

                            {/* 정보탭 페이지네이션 - Editor's Pick 안에 */}
                            {pagination.totalPages > 1 && (
                              <div className="mt-6 flex justify-center items-center gap-2">
                                <button
                                  onClick={() =>
                                    handlePageChange(pagination.currentPage - 1)
                                  }
                                  disabled={!pagination.hasPrev}
                                  className={`p-2 rounded-lg transition-colors ${
                                    !pagination.hasPrev
                                      ? "text-gray-500 cursor-not-allowed"
                                      : "text-white hover:bg-white/10"
                                  }`}
                                >
                                  <ArrowLeft className="w-5 h-5" />
                                </button>

                                <span className="px-4 py-2 text-sm text-gray-300">
                                  {pagination.currentPage} /{" "}
                                  {pagination.totalPages}
                                </span>

                                <button
                                  onClick={() =>
                                    handlePageChange(pagination.currentPage + 1)
                                  }
                                  disabled={!pagination.hasNext}
                                  className={`p-2 rounded-lg transition-colors ${
                                    !pagination.hasNext
                                      ? "text-gray-500 cursor-not-allowed"
                                      : "text-white hover:bg-white/10"
                                  }`}
                                >
                                  <ArrowUp className="w-5 h-5 rotate-90" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                        : "정보 게시글이 없습니다"}
                    </GradientText>
                    <p className="text-white/70 mb-6">
                      {isSearchMode
                        ? "다른 검색어로 시도해보세요!"
                        : "정보성 게시글을 확인해보세요!"}
                    </p>
                    {/* 정보 탭에서는 글쓰기 버튼 제거 */}
                  </NeonCard>
                )
              ) : // 다른 탭일 때는 기존 로직
              posts.length > 0 ? (
                <>
                  {/* 후기 게시글 섹션 */}
                  <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-lg border border-blue-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20 rounded-2xl shadow-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-5 animate-pulse mr-1">💬</div>
                      <h3 className="text-base md:text-lg font-semibold text-white">
                        여행 후기
                      </h3>
                    </div>

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

                    {/* 글쓰기 버튼 - 후기탭에서만 표시 */}
                    {profile && (
                      <div className="mt-6 flex justify-center">
                        <NeonButton
                          onClick={handleCreatePostClick}
                          variant="primary"
                          size="base"
                          className="flex items-center gap-2 px-6 py-3"
                        >
                          <Plus className="w-5 h-5" />새 게시글 작성
                        </NeonButton>
                      </div>
                    )}

                    {/* 후기탭 페이지네이션 - 글 목록 섹션 안에 */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-6 flex justify-center items-center gap-2">
                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          disabled={!pagination.hasPrev}
                          className={`p-2 rounded-lg transition-colors ${
                            !pagination.hasPrev
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>

                        <span className="px-4 py-2 text-sm text-gray-300">
                          {pagination.currentPage} / {pagination.totalPages}
                        </span>

                        <button
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          disabled={!pagination.hasNext}
                          className={`p-2 rounded-lg transition-colors ${
                            !pagination.hasNext
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
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
          </div>
        </div>
      </div>

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
