import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flame,
  Star,
  Hash,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { NeonCard, GradientText, NeonButton } from "../ui/NeonTheme";

const TrendModal = ({
  type,
  trendingTags,
  trendingPosts,
  onClose,
  onTagClick,
  onPostClick,
}) => {
  const renderTags = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <GradientText variant="primary" size="2xl" className="font-bold">
          🔥 전체 인기 태그
        </GradientText>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trendingTags.map((item, index) => (
          <motion.button
            key={item.tag}
            onClick={() => {
              onTagClick(item.tag);
              onClose();
            }}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/10 hover:border-purple-400/50"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                <span className="text-white font-bold text-sm">
                  #{index + 1}
                </span>
              </div>
              <div className="text-left">
                <p className="text-white group-hover:text-purple-300 font-medium">
                  #{item.tag}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>{item.count}개 게시글</span>
                </div>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-400 opacity-60 group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>

      <div className="text-center pt-6">
        <p className="text-white/60 text-sm">
          총{" "}
          <span className="text-purple-400 font-bold">
            {trendingTags.length}
          </span>
          개의 인기 태그가 있습니다
        </p>
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <GradientText variant="secondary" size="2xl" className="font-bold">
          ⭐ 전체 인기 글
        </GradientText>
      </div>

      <div className="space-y-4">
        {trendingPosts.map((post, index) => (
          <motion.button
            key={post.id}
            onClick={() => {
              onPostClick(post.id);
              onClose();
            }}
            className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group border border-white/10 hover:border-yellow-400/50"
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex-shrink-0">
                <span className="text-white font-bold">#{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white text-lg font-bold mb-2 group-hover:text-yellow-300 line-clamp-2">
                  {post.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="text-white/80">by {post.user_name}</span>

                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>{post.likes_count}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span>{post.comments_count || 0}</span>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>HOT</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-center pt-6">
        <p className="text-white/60 text-sm">
          가장 많은 관심을 받는
          <span className="text-yellow-400 font-bold">
            {" "}
            {trendingPosts.length}개
          </span>
          의 인기 글입니다
        </p>
      </div>
    </div>
  );

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
          className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto neon-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {type === "tags" ? (
                <>
                  <Hash className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    인기 태그 전체보기
                  </h2>
                </>
              ) : (
                <>
                  <Star className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">
                    인기 글 전체보기
                  </h2>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="space-y-6">
            {type === "tags" ? renderTags() : renderPosts()}
          </div>

          {/* 푸터 */}
          <div className="flex justify-center pt-6 border-t border-white/10 mt-8">
            <NeonButton onClick={onClose} variant="secondary" size="md">
              닫기
            </NeonButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrendModal;
