import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Route } from "Entities/Route";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Filter,
  Music,
  MapPin,
  ShoppingBag,
  Play,
  Plus,
  Star,
  Eye,
  Calendar,
  Users,
  ExternalLink,
  Bookmark,
  Camera,
  Film,
  Globe,
} from "lucide-react";

// Mock 데이터
const mockGoods = [
  {
    id: 1,
    title: "Squid Game 촬영지 투어",
    location: "강남역, 홍대, 명동",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvgS_upvUlNBu-lYY0zA_pjG8TvxnAgX2sEA&s",
    price: "₩35,000",
    category: "location",
    kpopGroup: "NewJeans",
    description: "오징어게임에 등장한 서울의 핫플레이스들을 직접 방문해보세요!",
    tags: ["뮤비촬영지", "서울", "squid game"],
    rating: 4.8,
    reviews: 247,
  },
  {
    id: 2,
    title: "IVE 'XOXZ' 아크릴 스탠드",
    location: "온라인 배송",
    image:
      "https://www.chosun.com/resizer/v2/WEX5U35HPIURB6TVS47V45FXRM.jpg?auth=bf6b1a51face01ab138fbf0ffee75db210edf897483487b15fb05f6f1fd8f41b&width=616",
    price: "₩15,000",
    category: "goods",
    kpopGroup: "IVE",
    description: "고화질 홀로그램 효과가 적용된 프리미엄 아크릴 스탠드",
    tags: ["굿즈", "아크릴", "컬렉션"],
    rating: 4.9,
    reviews: 156,
  },
  {
    id: 3,
    title: "BTS 댄스 클래스",
    location: "홍대 댄스 스튜디오",
    image:
      "https://www.msd-korea.com/wp-content/uploads/sites/30/2023/08/%EC%B0%B8%EA%B3%A0%EC%82%AC%EC%A7%841-%ED%95%9C%EA%B5%ADMSD-%EA%B7%B8%EB%A3%B9-%EC%84%B8%EB%B8%90%ED%8B%B4-HPV-%EC%98%88%EB%B0%A9-%EC%BA%A0%ED%8E%98%EC%9D%B8-%EA%B8%80%EB%A1%9C%EB%B2%8C-%EC%97%A0%EB%B2%A0%EC%84%9C%EB%8D%94%EB%A1%9C-%EC%84%A0%EC%A0%95.jpg",
    price: "₩25,000",
    category: "experience",
    kpopGroup: "BTS",
    description: "스우파 전문 댄서와 함께 배우는 안무 클래스",
    tags: ["댄스", "체험", "홍대"],
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 4,
    title: "케이팝데몬헌터스 먹방 투어",
    location: "케이팝 데몬헌터스, 먹방",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLiWcK_wdHqPO36POy7O1MfKRO8XSs-EEzbA&s",
    price: "₩89,000",
    category: "location",
    kpopGroup: "기타",
    description:
      "화제의 영화 '케이팝데몬헌터스'에 나온 먹거리들과 함께하는 1일 투어",
    tags: ["영화", "케이팝데몬헌터스", "먹방"],
    rating: 4.6,
    reviews: 134,
  },
];

const mockPlaylists = [
  {
    id: 1,
    title: "Seoul City Vibes 🌃",
    description: "서울 도심 여행할 때 듣기 좋은 어반 K-pop",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    songs: [
      { title: "APT.", artist: "ROSÉ & Bruno Mars", duration: "2:49" },
      { title: "Supernova", artist: "aespa", duration: "3:04" },
      { title: "How Sweet", artist: "NewJeans", duration: "3:32" },
      { title: "SPOT!", artist: "ZICO (Feat. JENNIE)", duration: "2:54" },
    ],
    totalDuration: "45분",
    followers: 12500,
    theme: "도시여행",
  },
  {
    id: 2,
    title: "SM Town과 함께하는 여름 바캉스 🏖️",
    description: "청량한 K-pop",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    songs: [
      { title: "Summer Breeze", artist: "IVE", duration: "3:15" },
      { title: "Cookie", artist: "NewJeans", duration: "3:54" },
      { title: "After LIKE", artist: "IVE", duration: "2:58" },
      { title: "Feel My Rhythm", artist: "Red Velvet", duration: "3:27" },
    ],
    totalDuration: "52분",
    followers: 8930,
    theme: "여름 바캉스",
  },
  {
    id: 3,
    title: "Seoul  Night Market 🎪",
    description: "야시장 분위기에 맞는 신나는 K-pop",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    songs: [
      { title: "Dynamite", artist: "BTS", duration: "3:19" },
      { title: "How You Like That", artist: "BLACKPINK", duration: "3:01" },
      { title: "God of Music", artist: "SEVENTEEN", duration: "2:55" },
      { title: "FEARLESS", artist: "LE SSERAFIM", duration: "2:48" },
    ],
    totalDuration: "38분",
    followers: 15200,
    theme: "야시장",
  },
];

const mockPosts = [
  {
    id: 1,
    user: {
      name: "한이",
      avatar:
        "https://i.namu.wiki/i/pkrc9k8vwJI4qamZDrSfomv_a7RQdnV0bXdYYGYLoefgelu2bWdecklN7WrxkybI-P3FH962rT2ge9dYDHQR_RoosTJmfuNJn0nkDl7Pj__NxDoHqFDMhhAohXPHarBXonaX_ApSlT3voDVqzgl6RA.webp",
      verified: true,
    },
    content:
      "NewJeans 자컨 촬영했던 은평 한옥마을 다녀왔어요! 전통과 현대가 어우러진 멋진 장소였어요.",
    images: [],
    location: "은평 한옥마을",
    tags: ["NewJeans", "은평 한옥마을", "한옥", "늊지순례"],
    timestamp: "2시간 전",
    likes: 1247,
    comments: 89,
    shares: 23,
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: 2,
    user: {
      name: "i_luv_sajaboys",
      avatar:
        "https://i.namu.wiki/i/KyMYfG5JCvJ3YnJHD4NttSIdk3UlXALqpJebjN0urteqo3j-LHhhn2Qcl9wTUFsccTsVVSEv2GjGB2XbtAFbMGp3lQLjz2EvJCKqndcqCBVmHFJvz-FQUF9wS9FSonnsgafR4AVUYlpCouSSLa7EGQ.webp",
      verified: false,
    },
    content:
      "My daughter recently went on a KPop Demon Hunters-themed trip which she's obsessed with. We spent the whole day listening to Golden and exploring Namsan.🤣",
    images: [
      "https://lh3.googleusercontent.com/gps-cs-s/AC9h4no3KDwxEhtLAfkvdsXgjvw7ZzXLgmqETFEVf5X7B6fZ-IW_CqwiKx-QsytpHmyfedVPhocaz40RM3s4z-WYiFLYxTLw0jZ5IMEgfZA1-y9FXIHCGvE1ezpJONC2_DwSmZyEOUcZ=w223-h373-n-k-no-nu",
    ],
    location: "Namsan",
    tags: ["KPop Demon Hunters", "Namsan Tower", "Golden", "FamilyTrip"],
    timestamp: "5시간 전",
    likes: 856,
    comments: 45,
    shares: 12,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 3,
    user: {
      name: "apt_fan123",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      verified: true,
    },
    content:
      "After listening to APT, I went to a rooftop bar in Gangnam and it was a perfect combination with the song... Rosé and Bruno Mars, who thought of this combination? Aren't they geniuses? 🍻",
    images: [],
    location: "Gangnam Rooftop Bar",
    tags: ["APT", "ROSÉ", "BrunoMars", "Gangnam", "rooftop"],
    timestamp: "1일 전",
    likes: 2341,
    comments: 156,
    shares: 67,
    isLiked: true,
    isBookmarked: true,
  },
];

// 굿즈/체험 카드 컴포넌트
const GoodsCard = ({ item }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isBookmarked
                ? "bg-yellow-500 text-white"
                : "bg-white/80 text-gray-700 hover:bg-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              item.category === "location"
                ? "bg-purple-500/90 text-white"
                : item.category === "goods"
                ? "bg-pink-500/90 text-white"
                : "bg-blue-500/90 text-white"
            }`}
          >
            {item.category === "location"
              ? "📍 촬영지"
              : item.category === "goods"
              ? "🛍️ 굿즈"
              : "🎭 체험"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-purple-600">
            {item.kpopGroup}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {item.rating}
            <span>({item.reviews})</span>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4" />
          {item.location}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-purple-600">
            {item.price}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-lg transition-colors ${
                isLiked
                  ? "bg-red-50 text-red-500"
                  : "hover:bg-gray-50 text-gray-400"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium">
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 플레이리스트 카드 컴포넌트
const PlaylistCard = ({ playlist }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useTranslation(); // 추가

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative overflow-hidden">
        <img
          src={playlist.image}
          alt={playlist.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Play className="w-6 h-6 text-purple-600 ml-1" />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
            🎵 {playlist.theme}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{playlist.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {playlist.description}
        </p>

        <div className="space-y-2 mb-4">
          {playlist.songs.slice(0, 2).map((song, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Music className="w-3 h-3 text-gray-400" />
                <span className="font-medium">{song.title}</span>
                <span className="text-gray-500">- {song.artist}</span>
              </div>
              <span className="text-gray-400">{song.duration}</span>
            </div>
          ))}
          {playlist.songs.length > 2 && (
            <div className="text-xs text-gray-500">
              {t("community.more.songs", { count: playlist.songs.length - 2 })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span>{playlist.totalDuration}</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {playlist.followers.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            data-i18n-ignore="true"
          >
            <ExternalLink className="w-4 h-4" />
            {t("community.open.spotify")}
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// 소셜 포스트 컴포넌트
const SocialPost = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
    >
      {/* 사용자 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {post.user.name}
              </span>
              {post.user.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{post.timestamp}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? "bg-yellow-50 text-yellow-600"
              : "hover:bg-gray-50 text-gray-400"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
          />
        </button>
      </div>

      {/* 포스트 내용 */}
      <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

      {/* 이미지 */}
      {post.images.length > 0 && (
        <div
          className={`mb-4 rounded-xl overflow-hidden ${
            post.images.length === 1 ? "" : "grid grid-cols-2 gap-2"
          }`}
        >
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          ))}
        </div>
      )}

      {/* 태그 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full hover:bg-purple-200 transition-colors cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 transition-colors ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{post.likes.toLocaleString()}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments}</span>
          </button>

          <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">{post.shares}</span>
          </button>
        </div>

        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// 메인 컴포넌트
export default function KpopTravelPlatform() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("goods");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const tabs = [
    { id: "goods", label: "굿즈 & 체험", icon: ShoppingBag },
    { id: "playlists", label: "여행 플레이리스트", icon: Music },
    { id: "community", label: "커뮤니티", icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "goods":
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {mockGoods.map((item) => (
                <GoodsCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        );

      case "playlists":
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {mockPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </AnimatePresence>
          </div>
        );

      case "community":
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <AnimatePresence>
              {mockPosts.map((post) => (
                <SocialPost key={post.id} post={post} />
              ))}
            </AnimatePresence>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {t("community.title")}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {t("community.subtitle")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("community.search.placeholder")}
                  className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-colors w-64"
                />
              </div>
              <button className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-purple-600"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 필터 (굿즈 탭에서만 표시) */}
      {activeTab === "goods" && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2">
              {["all", "location", "goods", "experience"].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterCategory === category
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 hover:bg-purple-50"
                  }`}
                >
                  {category === "all"
                    ? t("community.category.all")
                    : category === "location"
                    ? t("community.category.location")
                    : category === "goods"
                    ? t("community.category.goods")
                    : t("community.category.experience")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">{renderContent()}</div>
    </div>
  );
}
