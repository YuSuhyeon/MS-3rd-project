import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  User,
  Send,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PostDetailModal = ({ postId, onClose, isOpen }) => {
  const { profile, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [showCommentOptions, setShowCommentOptions] = useState({});

  const API_BASE_URL = "/api";

  // 사용자 ID 가져오기
  const currentUserId = profile?.sub || profile?.id || profile?.user_id;

  // 게시글 상세 조회
  const fetchPostDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const headers = { "Content-Type": "application/json" };
      const response = await fetch(`${API_BASE_URL}/boards/${postId}`, {
        headers,
        credentials: "include", // 세션 쿠키 포함
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("게시글을 찾을 수 없습니다.");
        }
        if (response.status === 403) {
          throw new Error("게시글에 접근할 권한이 없습니다.");
        }
        throw new Error(`서버 오류: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error("서버에서 올바르지 않은 응답을 받았습니다.");
      }

      const data = await response.json();

      if (data.success) {
        setPost(data.post || data);
        setComments(data.comments || []);
        setIsLiked(data.post?.is_liked_by_current_user || false);
        setLikesCount(data.post?.likes_count || 0);
      } else {
        throw new Error(data.error || "게시글을 불러올 수 없습니다.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 게시글 데이터 로드 useEffect (중복 제거됨)
  useEffect(() => {
    if (isOpen && postId) {
      console.log("🎯 useEffect 실행 - 게시글 상세 로드");
      fetchPostDetail();
      setCurrentImageIndex(0);
    }
  }, [isOpen, postId]);

  // 댓글 옵션 토글
  const toggleCommentOptions = (commentId) => {
    setShowCommentOptions((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 댓글 수정
  const updateComment = async (commentId, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 수정에 실패했습니다.");
      }

      return await response.json();
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      throw error;
    }
  };

  // 댓글 수정 시작
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditingContent(comment.content);
    setShowCommentOptions({});
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // 댓글 수정 완료
  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;

    try {
      await updateComment(commentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent("");
      fetchPostDetail(); // 댓글 목록 새로고침
    } catch (error) {
      alert(error.message);
    }
  };

  // 댓글 삭제
  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 세션 쿠키 포함
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 삭제에 실패했습니다.");
      }

      return await response.json();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      throw error;
    }
  };

  // 댓글 삭제 시작
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        await deleteComment(commentId);
        fetchPostDetail(); // 댓글 목록 새로고침
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const nextImage = () => {
    if (post?.pictures?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === post.pictures.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (post?.pictures?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? post.pictures.length - 1 : prev - 1
      );
    }
  };

  // 좋아요 처리 수정
  const handleLike = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const originalLiked = isLiked;
    const originalCount = likesCount;

    console.log(
      `💗 PostDetailModal 좋아요 클릭: postId=${postId}, 현재상태=${originalLiked}`
    );

    try {
      const method = isLiked ? "DELETE" : "POST";

      // 토큰 확인
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      console.log("🔑 사용할 토큰:", token ? "있음" : "없음");

      const fetchOptions = {
        method: method,
        credentials: "include",
      };

      // POST 요청일 때만 JSON 헤더와 body 추가
      if (method === "POST") {
        fetchOptions.headers = {
          "Content-Type": "application/json",
        };

        // 토큰이 있으면 Authorization 헤더 추가
        if (token) {
          fetchOptions.headers["Authorization"] = `Bearer ${token}`;
        }

        fetchOptions.body = JSON.stringify({});
      } else {
        // DELETE 요청에도 Authorization 헤더가 필요할 수 있음
        if (token) {
          fetchOptions.headers = {
            Authorization: `Bearer ${token}`,
          };
        }
      }

      console.log("📤 요청 옵션:", fetchOptions);

      const response = await fetch(
        `${API_BASE_URL}/boards/${postId}/like`,
        fetchOptions
      );

      console.log("📡 PostDetailModal 좋아요 API 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("💗 PostDetailModal 좋아요 API 응답 데이터:", data);

        if (data.success) {
          setLikesCount(data.likes_count);
          setIsLiked(data.is_liked);
        } else {
          throw new Error(data.error || "좋아요 처리에 실패했습니다.");
        }
      } else {
        // 에러 응답의 내용도 확인
        const errorData = await response.json().catch(() => ({}));
        console.log("❌ 에러 응답 데이터:", errorData);
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("💥 PostDetailModal 좋아요 처리 실패:", error);

      // 에러 시 원래 상태로 복구
      setIsLiked(originalLiked);
      setLikesCount(originalCount);

      alert(`좋아요 처리에 실패했습니다: ${error.message}`);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUserId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/boards/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (response.ok) {
        setNewComment("");
        fetchPostDetail(); // 댓글 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(errorData.error || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  // 인증 로딩 상태 처리
  if (authLoading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="text-white text-lg">인증 확인 중...</div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">게시글 상세</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 내용 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-gradient-to-br from-purple-900 via-black to-pink-900">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader className="w-12 h-12 text-purple-400" />
                </motion.div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-red-400">
                <p className="mb-4">{error}</p>
                <button
                  onClick={fetchPostDetail}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : post ? (
              <div className="p-6 space-y-6">
                {/* 작성자 정보 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {post.user_profile_image ? (
                      <img
                        src={post.user_profile_image}
                        alt={post.user_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {post.user_name}
                    </h3>
                    {/* <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                    </div> */}
                  </div>
                </div>

                {/* 제목 */}
                <h1 className="text-2xl font-bold text-white">{post.title}</h1>

                {/* 태그 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 이미지 갤러리 */}
                {post.pictures && post.pictures.length > 0 && (
                  <div className="relative">
                    <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden">
                      <img
                        src={post.pictures[currentImageIndex]}
                        alt={`게시글 이미지 ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {post.pictures.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* 이미지 인디케이터 */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {post.pictures.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50 hover:bg-white/70"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 내용 */}
                <div className="text-white whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "hover:bg-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span>{likesCount}</span>
                  </button>

                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                    <span>{comments.length}</span>
                  </div>

                  {/* <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>공유</span>
                  </button> */}
                </div>

                {/* 댓글 섹션 */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    댓글 {comments.length}개
                  </h4>

                  {/* 댓글 작성 */}
                  {currentUserId && (
                    <div className="mb-6">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleCommentSubmit(e);
                              }
                            }}
                            placeholder="댓글을 입력하세요..."
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                          />
                        </div>
                        <button
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {!currentUserId && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        댓글을 작성하려면 로그인이 필요합니다.
                      </p>
                    </div>
                  )}

                  {/* 댓글 목록 */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.comment_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-4 bg-white/5 rounded-lg relative"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {comment.user_profile_image ? (
                            <img
                              src={comment.user_profile_image}
                              alt={comment.user_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">
                              {comment.user_name}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {new Date(comment.created_at).toLocaleString()}
                            </span>
                          </div>

                          {editingCommentId === comment.comment_id ? (
                            // 댓글 수정 모드
                            <div className="space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm resize-none"
                                rows="2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleUpdateComment(comment.comment_id)
                                  }
                                  className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            // 일반 댓글 표시
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {comment.content}
                            </p>
                          )}
                        </div>

                        {/* 댓글 작성자인 경우 수정/삭제 버튼 */}
                        {currentUserId && comment.can_edit && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                toggleCommentOptions(comment.comment_id)
                              }
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {showCommentOptions[comment.comment_id] && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-6 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[80px] z-50"
                                >
                                  <button
                                    onClick={() => {
                                      handleEditComment(comment);
                                      setShowCommentOptions({});
                                    }}
                                    className="w-full px-3 py-1 text-left text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <Edit className="w-3 h-3" />
                                    수정
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteComment(comment.comment_id);
                                      setShowCommentOptions({});
                                    }}
                                    className="w-full px-3 py-1 text-left text-xs text-red-400 hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    삭제
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center text-gray-400 py-8">
                        첫 번째 댓글을 작성해보세요!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* 댓글 옵션 메뉴 배경 클릭 감지 */}
        {Object.values(showCommentOptions).some((show) => show) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCommentOptions({})}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PostDetailModal;
