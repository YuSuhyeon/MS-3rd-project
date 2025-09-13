import React, { useState, useEffect, useRef } from "react";
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
  BookOpen, // SurvivalKit에서 사용하기 위해 추가
} from "lucide-react";

import SpotifyPlaylistGenerator from "components/community/SpotifyPlaylistGenerator";

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

// 플레이리스트 카드 컴포넌트
const PlaylistCard = ({ playlist }) => {
  const [isPlaying, setIsPlaying] = useState(false);

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
              +{playlist.songs.length - 2}곡 더 보기
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
          <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Spotify에서 열기
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

// Survival Kit Component
function SurvivalKit() {
  const [activeSection, setActiveSection] = useState("translate");
  const [translateText, setTranslateText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!translateText.trim()) return;

    setIsTranslating(true);
    // Simulate translation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const translations = {
      안녕하세요: "Hello / こんにちは / 你好",
      감사합니다: "Thank you / ありがとうございます / 谢谢",
      "화장실이 어디에 있나요?":
        "Where is the bathroom? / トイレはどこですか？ / 洗手间在哪里？",
      "얼마예요?": "How much is it? / いくらですか？ / 多少钱？",
      도와주세요: "Help me / 助けてください / 请帮助我",
    };

    setTranslatedText(
      translations[translateText] || "Translation not available"
    );
    setIsTranslating(false);
  };

  const quickPhrases = [
    { korean: "안녕하세요", english: "Hello", category: "인사" },
    { korean: "감사합니다", english: "Thank you", category: "인사" },
    { korean: "죄송합니다", english: "Sorry", category: "인사" },
    {
      korean: "화장실이 어디에 있나요?",
      english: "Where is the bathroom?",
      category: "필수",
    },
    { korean: "얼마예요?", english: "How much is it?", category: "쇼핑" },
    { korean: "메뉴 주세요", english: "Menu please", category: "음식" },
    { korean: "도와주세요", english: "Help me", category: "응급" },
    { korean: "길을 잃었어요", english: "I'm lost", category: "응급" },
  ];

  const cultureGuide = [
    {
      title: "인사 예절",
      content:
        "한국에서는 나이가 많은 사람에게 먼저 인사하고, 고개를 숙여 인사합니다.",
      icon: "🙇‍♀️",
    },
    {
      title: "식사 예절",
      content:
        "어른이 먼저 수저를 들고, 밥그릇을 들고 먹지 않습니다. 술은 양손으로 받습니다.",
      icon: "🍽️",
    },
    {
      title: "대중교통",
      content: "지하철에서는 노약자석을 양보하고, 큰 소리로 통화하지 않습니다.",
      icon: "🚇",
    },
    {
      title: "팁 문화",
      content: "한국은 팁 문화가 없습니다. 서비스 요금이 이미 포함되어 있어요.",
      icon: "💰",
    },
    {
      title: "신발 벗기",
      content: "한국 가정이나 일부 식당에서는 신발을 벗고 들어갑니다.",
      icon: "👟",
    },
    {
      title: "선물 예절",
      content:
        "선물을 받을 때는 양손으로 받고, 바로 뜯지 않는 것이 예의입니다.",
      icon: "🎁",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
        {[
          { id: "translate", label: "빠른 통역", icon: Globe },
          { id: "culture", label: "한국 문화 가이드", icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeSection === id
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeSection === "translate" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Translator */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">실시간 번역기</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  한국어 입력
                </label>
                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="번역할 텍스트를 입력하세요..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleTranslate}
                disabled={!translateText.trim() || isTranslating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isTranslating ? "번역중..." : "번역하기"}
              </Button>
              {translatedText && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    번역 결과
                  </label>
                  <p className="text-gray-900">{translatedText}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Phrases */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">자주 쓰는 표현</h3>
            <div className="space-y-3">
              {quickPhrases.map((phrase, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => setTranslateText(phrase.korean)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">
                      {phrase.korean}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {phrase.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {phrase.english}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeSection === "culture" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cultureGuide.map((guide, index) => (
            <Card key={index} className="p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{guide.icon}</div>
                <h3 className="font-bold text-lg text-gray-900">
                  {guide.title}
                </h3>
              </div>
              <p className="text-gray-600 text-center">{guide.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// 메인 컴포넌트
export default function CommunityMain() {
  const tabs = [
    { id: "survival", label: "survival kit", icon: ShoppingBag },
    { id: "playlists", label: "playlists", icon: Music },
    { id: "social", label: "social", icon: Users },
  ];

  const [activeTab, setActiveTab] = useState(() => {
    // 초기 로드 시 URL 파라미터 확인
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["survival", "playlists", "social"].includes(tabParam)) {
        return tabParam;
      }
    }
    return "survival";
  });

  // URL 파라미터 확인하여 탭 설정
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["survival", "playlists", "social"].includes(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab("survival");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // 탭 클릭 핸들러
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // URL 업데이트 (페이지 리로드 없이)
    const url = new URL(window.location);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "survival":
        return <SurvivalKit />; // SurvivalKit 컴포넌트를 렌더링하도록 수정
      case "playlists":
        return (
          <div>
            <SpotifyPlaylistGenerator />{" "}
          </div>
        );
      case "social":
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

      {/* 탭 네비게이션 */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)} // 수정된 핸들러 사용
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

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">{renderContent()}</div>
    </div>
  );
}
