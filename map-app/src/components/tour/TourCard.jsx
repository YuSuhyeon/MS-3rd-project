"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, Bookmark, Eye } from "lucide-react";

const TourCard = ({ item, onDetailClick, onLikeToggle, isLiked = false }) => {
  const { t } = useTranslation("tourDetail");
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getCategoryInfo = (category) => {
    switch (category) {
      case "location":
        return {
          emoji: "📍",
          label: "촬영지",
          gradient: "from-purple-500 to-pink-500",
        };
      case "goods":
        return {
          emoji: "🛍️",
          label: "굿즈",
          gradient: "from-pink-500 to-fuchsia-500",
        };
      case "experience":
        return {
          emoji: "🎭",
          label: "체험",
          gradient: "from-indigo-500 to-purple-500",
        };
      case "food":
        return {
          emoji: "🍜",
          label: "먹방",
          gradient: "from-orange-500 to-pink-500",
        };
      case "it":
        return {
          emoji: "🖥️",
          label: "IT",
          gradient: "from-blue-500 to-cyan-500",
        };
      case "sports":
        return {
          emoji: "⚾",
          label: "스포츠",
          gradient: "from-green-500 to-blue-500",
        };
      case "beauty":
        return {
          emoji: "💄",
          label: "뷰티",
          gradient: "from-pink-500 to-rose-500",
        };
      case "culture":
        return {
          emoji: "🏛️",
          label: "문화",
          gradient: "from-purple-500 to-indigo-500",
        };
      case "adventure":
        return {
          emoji: "🏔️",
          label: "모험",
          gradient: "from-emerald-500 to-teal-500",
        };
      case "entertainment":
        return {
          emoji: "🎢",
          label: "엔터",
          gradient: "from-yellow-500 to-orange-500",
        };
      default:
        return {
          emoji: "🎵",
          label: "기타",
          gradient: "from-gray-500 to-gray-600",
        };
    }
  };

  const categoryInfo = getCategoryInfo(item.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-xl border border-purple-500/30 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/20 hover:border-pink-500/50 group transition-all duration-300 cursor-pointer"
      onClick={() => onDetailClick(item)}
    >
      {/* 컴팩트한 이미지 섹션 */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* 카테고리 뱃지 */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-1 bg-gradient-to-r ${categoryInfo.gradient} text-white text-xs font-semibold rounded-full backdrop-blur-sm shadow-lg`}
          >
            {categoryInfo.emoji} {categoryInfo.label}
          </span>
        </div>

        {/* 북마크 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isBookmarked
              ? "bg-yellow-500 text-white shadow-lg"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {/* K-pop 그룹/파트너십 배지 */}
        {(() => {
          const partnershipPrimary = t(`data.${item.id}.partnership.primary`, {
            defaultValue: "",
          });
          const hasPartnership = Boolean(partnershipPrimary);
          const hasKpopGroup = Boolean(item.kpopGroup);
          if (!hasPartnership && !hasKpopGroup) return null;
          return (
            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
              {hasPartnership && (
                <span className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                  {partnershipPrimary}
                </span>
              )}
              {hasKpopGroup && (
                <span className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                  {t(`data.${item.id}.kpopGroup`, {
                    defaultValue: item.kpopGroup,
                  })}
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* 컴팩트한 컨텐츠 섹션 */}
      <div className="p-3 space-y-2">
        {/* 제목과 평점 */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white line-clamp-1">
            {item.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-300">
                {item.rating || "4.5"}
              </span>
              <span className="text-xs text-gray-500">
                ({item.reviews || "0"})
              </span>
            </div>

            {/* 위치 정보 - 컴팩트 */}
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500 truncate max-w-20">
                  {item.location}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 설명 - 더 간결하게 */}
        <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>

        {/* 태그 - 최대 2개만 */}
        <div className="flex gap-1 flex-wrap">
          {item.tags?.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-800/80 text-gray-400 text-xs rounded-full border border-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 가격과 액션 버튼 */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {item.price}
          </span>

          <div className="flex items-center gap-1">
            {/* 좋아요 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeToggle && onLikeToggle(item);
              }}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isLiked
                  ? "bg-red-500/20 text-red-400 shadow-md"
                  : "hover:bg-gray-800/80 text-gray-500 hover:text-gray-300"
              }`}
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
            </button>

            {/* 자세히 보기 버튼 - 더 작게 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetailClick(item);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-xs font-semibold shadow-md"
              aria-label={`${item.title} 상세보기`}
            >
              <Eye size={12} />
              보기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TourCard;
