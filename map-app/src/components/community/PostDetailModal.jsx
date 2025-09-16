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
} from "lucide-react";

const PostDetailModal = ({ postId, onClose, isOpen }) => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  //  API 경로 일관성 있게 수정
  const API_BASE_URL = "/api"; // process.env는 제거하고 통일

  //  게시글 상세 정보 가져오기 - 데이터 설정 추가
  const fetchPostDetail = async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(`🔍 게시글 상세 조회 요청: ${API_BASE_URL}/boards/${postId}`);

      const response = await fetch(`${API_BASE_URL}/boards/${postId}`, {
        headers,
        credentials: "include",
      });

      // 응답 상태 확인
      if (!response.ok) {
        console.error(
          `❌ HTTP 오류: ${response.status} ${response.statusText}`
        );
        if (response.status === 404) {
          throw new Error("게시글을 찾을 수 없습니다.");
        }
        if (response.status === 403) {
          throw new Error("게시글에 접근할 권한이 없습니다.");
        }
        throw new Error(`서버 오류: ${response.status}`);
      }

      // Content-Type 확인
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ JSON이 아닌 응답:", contentType);
        const textResponse = await response.text();
        console.error("응답 내용:", textResponse.substring(0, 200));
        throw new Error("서버에서 올바르지 않은 응답을 받았습니다.");
      }

      const data = await response.json();
      console.log("✅ 게시글 상세 조회 성공:", data);

      setPost(data.post || data);
      setComments(data.comments || []);
      setIsLiked(data.is_liked || false);
      setLikesCount(data.likes_count || 0);
    } catch (error) {
      console.error("💥 게시글 상세 조회 실패:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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
  // 좋아요
  const handleLike = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/boards/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likes_count);
        setIsLiked(data.is_liked);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/boards/${postId}/comments`,
        {
          // /api 제거
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (response.ok) {
        setNewComment("");
        fetchPostDetail(); // 댓글 목록 새로고침
      }
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  useEffect(() => {
    if (isOpen && postId) {
      fetchPostDetail();
      setCurrentImageIndex(0);
    }
  }, [isOpen, postId]);

  if (!isOpen) return null;

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
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-red-400">
                <p>{error}</p>
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
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                    </div>
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

                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>공유</span>
                  </button>
                </div>

                {/* 댓글 섹션 */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    댓글 {comments.length}개
                  </h4>

                  {/* 댓글 작성 */}
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

                  {/* 댓글 목록 */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.comment_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 p-4 bg-white/5 rounded-lg"
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
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
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
      </motion.div>
    </AnimatePresence>
  );
};

export default PostDetailModal;
