import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  LogIn,
  LogOut,
  Play,
  Plus,
  X,
  Search,
  Filter,
  Sparkles,
  Volume2,
  Users,
  Shuffle,
  Heart,
  Share2,
  Download,
  Loader2,
  ChevronDown,
  Star,
  Headphones,
  Mic,
  Radio,
  ExternalLink,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NeonButton, GradientText } from "../ui/NeonTheme";
import { NeonCard } from "../ui/NeonTheme";

const SpotifyIcon = ({ className = "", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12 12-5.372 12-12S18.627 0 12 0Zm5.476 17.344c-.217.338-.67.44-1.008.223-2.759-1.74-6.233-2.133-10.325-1.167-.389.092-.781-.151-.873-.541a.705.705 0 0 1 .54-.872c4.49-1.047 8.34-.6 11.353 1.277.337.217.44.668.223 1.005Zm1.44-3.209c-.273.424-.838.55-1.262.277-3.158-1.938-7.98-2.5-11.734-1.367-.476.14-.977-.135-1.118-.611-.14-.475.135-.977.611-1.118 4.3-1.27 9.6-.64 13.195 1.545.424.272.55.838.308 1.274Zm.124-3.338c-3.784-2.246-10.042-2.453-13.64-1.34-.566.179-1.166-.142-1.345-.708-.18-.566.142-1.166.708-1.345C7.426 6.228 14.38 6.46 18.686 9c.528.313.702.99.388 1.518-.313.527-.99.701-1.518.388Z" />
  </svg>
);

// 1. 비디오 플레이어 모달 컴포넌트
const VideoPlayerModal = ({ video, onClose }) => {
  if (!video || !video.videoId) return null;

  let srcUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
  if (video.startTime > 0) {
    srcUrl += `&start=${video.startTime}`;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            src={srcUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          ></iframe>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 2. 비디오 카드 컴포넌트 (클릭 이벤트 핸들러 추가)
const YouTubeVideoCard = ({ video, onCardClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onCardClick(video)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-red-500/30 bg-black/35 transition-all duration-300 backdrop-blur-sm hover:-translate-y-2 hover:border-red-400/50"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={video.thumbnail || video.image}
          alt={video.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/70" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
          <div className="rounded-full bg-red-600/90 p-4 shadow-[0_20px_40px_rgba(220,38,38,0.35)]">
            <Play className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {video.publishedAt && (
            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              {video.publishedAt}
            </div>
          )}
        </div>
        {video.views && (
          <div className="absolute top-4 right-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            {video.views}
          </div>
        )}
      </div>
      <div className="space-y-2 p-6">
        <p className="line-clamp-2 text-lg font-semibold text-white">
          {video.title}
        </p>
        {video.description && (
          <p className="text-sm text-purple-100/70">{video.description}</p>
        )}
      </div>
    </motion.div>
  );
};

const SpotifyPlaylistGenerator = () => {
  const { t } = useTranslation("playlists");
  const { t: tNav } = useTranslation("Navigation");
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const API_BASE_URL = "http://127.0.0.1:5001";

  // 테마 설정
  const THEMES = {
    [t("themes1")]: {
      icon: "🏙️",
      color: "from-blue-500 to-purple-600",
      description: t("themes1_desc"),
    },
    [t("themes2")]: {
      icon: "🏖️",
      color: "from-yellow-400 to-orange-500",
      description: t("themes2_desc"),
    },
    [t("themes3")]: {
      icon: "🎪",
      color: "from-pink-500 to-red-500",
      description: t("themes3_desc"),
    },
    [t("themes4")]: {
      icon: "🍃",
      color: "from-green-400 to-teal-500",
      description: t("themes4_desc"),
    },
    [t("themes5")]: {
      icon: "💪",
      color: "from-red-500 to-orange-600",
      description: t("themes5_desc"),
    },
    [t("themes6")]: {
      icon: "☕",
      color: "from-amber-400 to-yellow-600",
      description: t("themes6_desc"),
    },
  };

  // K-pop 아티스트 분류
  const KPOP_ARTISTS = {
    [t("kpop_artists1")]: [
      "NewJeans",
      "IVE",
      "aespa",
      "LE SSERAFIM",
      "ITZY",
      "(G)I-DLE",
      "NMIXX",
      "STAYC",
    ],
    [t("kpop_artists2")]: [
      "Stray Kids",
      "ENHYPEN",
      "TXT",
      "ATEEZ",
      "RIIZE",
      "TREASURE",
    ],
    [t("kpop_artists3")]: [
      "BTS",
      "BLACKPINK",
      "TWICE",
      "Red Velvet",
      "SEVENTEEN",
      "NCT",
      "MAMAMOO",
    ],
    [t("kpop_artists4")]: [
      "IU",
      "태연",
      "ROSÉ",
      "제니",
      "리사",
      "지민",
      "정국",
      "RM",
    ],
  };

  // 테마별 그라디언트 효과
  const glowGradients = {
    [t("themes1")]: "from-cyan-500/30 via-blue-500/20 to-purple-500/30",
    [t("themes2")]: "from-yellow-400/30 via-orange-400/20 to-pink-400/30",
    [t("themes3")]: "from-pink-400/30 via-red-400/20 to-orange-400/30",
    [t("themes4")]: "from-green-400/30 via-teal-400/20 to-blue-400/30",
    [t("themes5")]: "from-red-400/30 via-orange-400/20 to-yellow-400/30",
    [t("themes6")]: "from-amber-400/30 via-yellow-400/20 to-orange-400/30",
  };

  // Mock 플레이리스트 (로그인 전 표시용)
  const mockPlaylists = [
    {
      id: 1,
      title: t("mock_playlists1") + " 🌃",
      description: t("mock_playlists1_desc"),
      image: "/img/seoul_night.png",
      songs: [
        { title: "Shoot Me", artist: "Day6", duration: "3:32" },
        { title: "APT.", artist: "ROSÉ & Bruno Mars", duration: "2:49" },
        { title: "소우주(Mikrosmos)", artist: "BTS", duration: "3:04" },
      ],
      totalDuration: "45분",
      followers: 12500,
      theme: t("themes1"),
      isLocked: true,
    },
    {
      id: 2,
      title: t("mock_playlists2") + " ☀️",
      description: t("mock_playlists2_desc"),
      image: "/img/aespa.jpg",
      songs: [
        { title: "Rich Man", artist: "aespa", duration: "3:15" },
        { title: "좋은걸 뭐 어떡해", artist: "Day6", duration: "3:52" },
        { title: "After LIKE", artist: "IVE", duration: "2:58" },
      ],
      totalDuration: "52분",
      followers: 8930,
      theme: t("themes2"),
      isLocked: true,
    },
  ];

  //  모달에 띄울 비디오 객체를 저장할 상태
  const [selectedVideo, setSelectedVideo] = useState(null);

  // videoId, startTime 등이 포함된 최종 데이터
  const youtubeVideos = [
    {
      id: "1",
      title: "IVE - XOXZ",
      //publishedAt: "1주 전",
      views: "2.1M",
      thumbnail: "https://img.youtube.com/vi/B1ShLiq3EVc/maxresdefault.jpg",
      videoId: "B1ShLiq3EVc",
      startTime: 2,
    },
    {
      id: "2",
      title: "Blakpink - Jump ",
      //publishedAt: "3일 전",
      views: "1.2M",
      thumbnail: "https://img.youtube.com/vi/CgCVZdcKcqY/maxresdefault.jpg",
      videoId: "CgCVZdcKcqY",
      startTime: 0,
    },
    {
      id: "3",
      title: "Sajaboys - Soda POP",
      //publishedAt: "2주 전",
      views: "980K",
      thumbnail: "https://img.youtube.com/vi/hAyPTJFgFEs/maxresdefault.jpg",
      videoId: "hAyPTJFgFEs",
      startTime: 0,
    },
  ];

  // 컴포넌트가 로드될 때 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/spotify/user`, {
          credentials: "include",
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setSpotifyUser(null);
          return;
        }

        const data = await response.json();

        if (response.ok && data.is_logged_in) {
          setSpotifyUser(data.user);
          // 로그인된 경우 실제 플레이리스트 로드
          loadUserPlaylists();
        } else {
          setSpotifyUser(null);
        }
      } catch (error) {
        console.error("Error checking Spotify login status:", error);
        setSpotifyUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const loadUserPlaylists = async () => {
    // 실제 사용자 플레이리스트 로드 API 호출
    try {
      const response = await fetch(`${API_BASE_URL}/api/spotify/playlists`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Spotify 플레이리스트를 프론트엔드 형식에 맞게 변환
        const formattedPlaylists = data.playlists.map((playlist, index) => ({
          id: playlist.id,
          title: playlist.name,
          description: playlist.description || "",
          image:
            playlist.images && playlist.images.length > 0
              ? playlist.images[0].url
              : "/img/default-playlist.png",
          songs: [], // Spotify API에서는 플레이리스트의 트랙 목록을 별도로 조회해야 함
          totalDuration: "0분", // 계산 필요
          followers: playlist.followers ? playlist.followers.total : 0,
          theme: "사용자 플레이리스트",
          isLocked: false,
          external_urls: playlist.external_urls,
        }));

        setPlaylists(formattedPlaylists);
      } else {
        console.error("Error loading playlists:", data.error);
        // 오류 시 mock 데이터 사용
        setPlaylists(mockPlaylists.map((p) => ({ ...p, isLocked: false })));
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      // 오류 시 mock 데이터 사용
      setPlaylists(mockPlaylists.map((p) => ({ ...p, isLocked: false })));
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spotify/login`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        window.location.href = `${API_BASE_URL}/spotify/login`;
        return;
      }
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        window.location.href = `${API_BASE_URL}/spotify/login`;
      }
    } catch (error) {
      console.error("Error initiating Spotify login:", error);
      window.location.href = `${API_BASE_URL}/spotify/login`;
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spotify/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setSpotifyUser(null);
        setPlaylists([]);
      }
    } catch (error) {
      console.error("Error logging out from Spotify:", error);
    }
  };

  // 플레이리스트 생성 모달
  const PlaylistGeneratorModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedTheme, setSelectedTheme] = useState("");
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [selectedArtistCategory, setSelectedArtistCategory] =
      useState("4세대 걸그룹");
    const [playlistSettings, setPlaylistSettings] = useState({
      name: "",
      trackCount: 20,
      includePopular: true,
      includeRecent: true,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTracks, setGeneratedTracks] = useState([]);

    const handleArtistToggle = (artist) => {
      setSelectedArtists((prev) =>
        prev.includes(artist)
          ? prev.filter((a) => a !== artist)
          : prev.length < 5
          ? [...prev, artist]
          : prev
      );
    };

    const generatePlaylist = async () => {
      setIsGenerating(true);
      setStep(4);

      try {
        // 실제 API 호출
        const response = await fetch(
          `${API_BASE_URL}/api/spotify/generate-playlist`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              theme: selectedTheme,
              artists: selectedArtists,
              trackCount: playlistSettings.trackCount,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setGeneratedTracks(data.tracks);
        } else {
          throw new Error(data.error || "플레이리스트 생성에 실패했습니다.");
        }

        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating playlist:", error);
        alert(`플레이리스트 생성 중 오류가 발생했습니다: ${error.message}`);
        setIsGenerating(false);
      }
    };

    const saveToSpotify = async () => {
      try {
        // 실제 Spotify 저장 API 호출
        const response = await fetch(
          `${API_BASE_URL}/api/spotify/create-playlist`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: playlistSettings.name || `${selectedTheme} 플레이리스트`,
              description: `${selectedTheme} 테마의 K-pop 플레이리스트`,
              tracks: generatedTracks,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          alert(
            `플레이리스트 "${data.playlist.name}"이 Spotify에 저장되었습니다!`
          );
          onClose();
          loadUserPlaylists(); // 플레이리스트 목록 새로고침
        } else {
          throw new Error(data.error || "플레이리스트 저장에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error saving to Spotify:", error);
        alert(`플레이리스트 저장 중 오류가 발생했습니다: ${error.message}`);
      }
    };

    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="relative w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <NeonCard
            variant="primary"
            className="relative overflow-hidden p-6 sm:p-8"
            delay={0}
          >
            <div className="space-y-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <GradientText
                      variant="primary"
                      size="2xl"
                      className="leading-tight"
                    >
                      AI 플레이리스트 생성
                    </GradientText>
                    <p className="text-sm text-purple-100/80">
                      {step === 1 && "여행 테마를 선택하세요"}
                      {step === 2 && "선호 아티스트를 선택하세요"}
                      {step === 3 && "플레이리스트 설정을 완료하세요"}
                      {step === 4 &&
                        (isGenerating
                          ? "플레이리스트 생성 중..."
                          : "플레이리스트가 완성되었습니다!")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-purple-200 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 진행 단계 표시 */}
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step >= stepNumber
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-white/10 text-purple-200/60"
                    }`}
                  >
                    {stepNumber}
                  </div>
                ))}
              </div>

              {/* 컨텐츠 영역 */}
              <div className="min-h-[400px]">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-purple-100/80">
                        선택한 테마에 맞는 K-pop 플레이리스트를 생성합니다
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(THEMES).map(([theme, config]) => (
                        <motion.button
                          key={theme}
                          onClick={() => setSelectedTheme(theme)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all duration-300 ${
                            selectedTheme === theme
                              ? "border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.35)]"
                              : "hover:border-purple-300/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                          }`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${
                              glowGradients[theme] ||
                              "from-purple-500/10 via-pink-500/10 to-blue-500/10"
                            } opacity-0 transition-opacity duration-500 group-hover:opacity-60 ${
                              selectedTheme === theme ? "opacity-80" : ""
                            }`}
                          />
                          <div className="relative z-10 flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl border border-white/10 p-2 transition-colors ${
                                selectedTheme === theme
                                  ? "bg-white/10 text-white"
                                  : "bg-black/30 text-purple-100"
                              }`}
                            >
                              <span className="text-2xl">{config.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-white mb-2">
                                {theme}
                              </h4>
                              <p className="text-sm text-purple-100/80 leading-relaxed">
                                {config.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-purple-100/80">
                        최대 5명까지 선택 가능합니다
                      </p>
                    </div>

                    {/* 카테고리 선택 */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.keys(KPOP_ARTISTS).map((category) => (
                        <motion.button
                          key={category}
                          onClick={() => setSelectedArtistCategory(category)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            selectedArtistCategory === category
                              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                              : "bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>

                    {/* 선택된 아티스트 표시 */}
                    {selectedArtists.length > 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h4 className="font-medium text-white mb-3">
                          선택된 아티스트 ({selectedArtists.length}/5)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedArtists.map((artist) => (
                            <span
                              key={artist}
                              className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm rounded-full"
                            >
                              {artist}
                              <button
                                onClick={() => handleArtistToggle(artist)}
                                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 아티스트 그리드 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {KPOP_ARTISTS[selectedArtistCategory].map((artist) => (
                        <motion.button
                          key={artist}
                          onClick={() => handleArtistToggle(artist)}
                          disabled={
                            !selectedArtists.includes(artist) &&
                            selectedArtists.length >= 5
                          }
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            selectedArtists.includes(artist)
                              ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                              : selectedArtists.length >= 5
                              ? "bg-white/5 text-purple-200/40 cursor-not-allowed"
                              : "bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white"
                          }`}
                        >
                          {artist}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          플레이리스트 이름
                        </label>
                        <input
                          type="text"
                          value={playlistSettings.name}
                          onChange={(e) =>
                            setPlaylistSettings({
                              ...playlistSettings,
                              name: e.target.value,
                            })
                          }
                          placeholder={`${selectedTheme} 플레이리스트`}
                          className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-purple-200/60 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          트랙 수: {playlistSettings.trackCount}곡
                        </label>
                        <div className="relative">
                          <input
                            type="range"
                            min="10"
                            max="30"
                            value={playlistSettings.trackCount}
                            onChange={(e) =>
                              setPlaylistSettings({
                                ...playlistSettings,
                                trackCount: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-purple-200/60 mt-2">
                            <span>10곡</span>
                            <span>30곡</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-white">
                          추가 옵션
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={playlistSettings.includePopular}
                              onChange={(e) =>
                                setPlaylistSettings({
                                  ...playlistSettings,
                                  includePopular: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-purple-600 rounded border-white/20 bg-white/5 focus:ring-purple-500/20"
                            />
                            <span className="text-sm text-white">
                              인기 곡 우선 포함
                            </span>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={playlistSettings.includeRecent}
                              onChange={(e) =>
                                setPlaylistSettings({
                                  ...playlistSettings,
                                  includeRecent: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-purple-600 rounded border-white/20 bg-white/5 focus:ring-purple-500/20"
                            />
                            <span className="text-sm text-white">
                              최신 곡 포함
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="text-center py-8">
                    {isGenerating ? (
                      <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                          <Loader2 className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            플레이리스트 생성 중...
                          </h3>
                          <p className="text-purple-100/80">
                            AI가 완벽한 조합을 찾고 있어요
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                          <Music className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            플레이리스트 완성!
                          </h3>
                          <p className="text-purple-100/80 mb-6">
                            총 {generatedTracks.length}곡이 포함된
                            플레이리스트가 생성되었습니다
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 max-h-60 overflow-y-auto">
                          {generatedTracks.map((track, index) => (
                            <div
                              key={track.id}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-white">
                                  {track.name}
                                </p>
                                <p className="text-sm text-purple-200/70">
                                  {track.artist}
                                </p>
                              </div>
                              <span className="text-sm text-purple-200/60">
                                {track.duration}
                              </span>
                            </div>
                          ))}
                        </div>

                        <NeonButton
                          variant="success"
                          size="md"
                          onClick={saveToSpotify}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Spotify에 저장
                        </NeonButton>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 하단 버튼 영역 */}
              <div className="flex justify-between pt-6 border-t border-white/10">
                <NeonButton variant="secondary" size="sm" onClick={onClose}>
                  취소
                </NeonButton>

                <div className="flex gap-3">
                  {step > 1 && step < 4 && (
                    <NeonButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setStep(step - 1)}
                    >
                      이전
                    </NeonButton>
                  )}

                  {step < 3 && (
                    <NeonButton
                      variant="primary"
                      size="sm"
                      onClick={() => setStep(step + 1)}
                      disabled={step === 1 && !selectedTheme}
                    >
                      다음
                    </NeonButton>
                  )}

                  {step === 3 && (
                    <NeonButton
                      variant="primary"
                      size="sm"
                      onClick={generatePlaylist}
                    >
                      생성하기
                    </NeonButton>
                  )}
                </div>
              </div>
            </div>
          </NeonCard>
        </motion.div>
      </motion.div>
    );
  };

  // 플레이리스트 카드 컴포넌트
  const PlaylistCard = ({ playlist }) => {
    const theme = THEMES[playlist.theme];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-gray-900/90 to-black/95 backdrop-blur-xl transition-all duration-300 ${
          playlist.isLocked
            ? "opacity-75"
            : "hover:-translate-y-2 hover:shadow-[0_40px_120px_-40px_rgba(236,72,153,0.45)]"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.25),_transparent_55%)] opacity-60" />
        <div className="relative">
          <div className="relative h-48 overflow-hidden rounded-3xl">
            <img
              src={playlist.image}
              alt={playlist.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {theme?.icon && (
                <span className="text-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
                  {theme.icon}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg ${
                  theme?.color
                    ? `bg-gradient-to-r ${theme.color}`
                    : "bg-purple-600/80"
                }`}
              >
                {playlist.theme}
              </span>
            </div>
            {playlist.isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/80">
                  {t("login")}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-5 p-6">
          <div>
            <GradientText size="xl" variant="primary" className="leading-tight">
              {playlist.title}
            </GradientText>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-purple-100/80">
              {playlist.description}
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4">
            {playlist.songs.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 text-sm text-purple-100/80"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-purple-200/80">
                    <Music className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white/90">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-purple-200/70">
                      {song.artist}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-purple-200/60">
                  {song.duration}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-purple-200/70">
            <span className="uppercase tracking-[0.3em]">
              {playlist.totalDuration}
            </span>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-200" />
              <span className="font-medium text-white/80">
                {playlist.followers.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeonButton
              variant="success"
              size="sm"
              disabled={playlist.isLocked}
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Play className="h-4 w-4" />
              {t("play")}
            </NeonButton>
            <button
              type="button"
              disabled={playlist.isLocked}
              className={`rounded-2xl border border-white/10 bg-white/5 p-2 text-purple-200 transition-all duration-200 ${
                playlist.isLocked
                  ? "cursor-not-allowed opacity-40"
                  : "hover:border-purple-300/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // 유튜브 비디오 카드 컴포넌트
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-black/30 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-3xl blur-xl"></div>
        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-100/80">
              <Sparkles className="h-4 w-4 text-purple-200" />
              {t("ai_custom_recommend")}
            </div>
            <p>
              <GradientText
                size="3xl"
                variant="primary"
                className="leading-tight"
              >
                {t("title")}
              </GradientText>
            </p>
            <p className="text-sm text-purple-100/85 sm:text-base">
              {t("description")}
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.35em] text-purple-200/80">
              {[
                t("ai_custom_recommend"),
                t("unlimited_creation"),
                t("spotify_auto_save"),
              ].map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {spotifyUser ? (
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-black/35 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                {spotifyUser.avatar ? (
                  <img
                    src={spotifyUser.avatar}
                    alt="Spotify avatar"
                    className="h-14 w-14 rounded-full border border-white/20"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/40 text-[#1DB954]">
                    <SpotifyIcon className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-purple-200/70">
                    {t("my_playlist")}
                  </p>
                  <p className="text-xl font-semibold text-white">
                    {spotifyUser.display_name}
                  </p>
                  <p className="text-sm text-purple-200/70">
                    {t("your_playlist")}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => setIsGeneratorOpen(true)}
                  className="flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("create_new_playlist")}
                </NeonButton>
                <NeonButton
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {tNav("log_out")}
                </NeonButton>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-black/35 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black/40 text-[#1DB954]">
                  <SpotifyIcon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <GradientText size="xl" variant="primary">
                    {t("title")}
                  </GradientText>
                  <p className="text-sm text-purple-100/80">
                    {t("make_playlist")}
                  </p>
                </div>
              </div>
              <NeonButton
                variant="primary"
                size="md"
                onClick={handleLogin}
                className="mt-6 flex w-full items-center justify-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                {tNav("log_in")}
              </NeonButton>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-black/30 p-6 sm:p-8 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-3xl blur-xl" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <GradientText
                  size="2xl"
                  variant="primary"
                  className="leading-tight"
                >
                  {spotifyUser ? t("my_playlist") : t("playlist_preview")}
                </GradientText>
                <p className="text-sm text-purple-100/80 sm:text-base">
                  {spotifyUser ? t("your_playlist") : t("make_playlist")}
                </p>
              </div>
              {!spotifyUser && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-purple-200/80">
                  {t("preview")}
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {(spotifyUser ? playlists : mockPlaylists).map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}

              {spotifyUser && playlists.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-purple-500/50 bg-black/35 p-8 text-center backdrop-blur-sm"
                >
                  <Sparkles className="h-10 w-10 text-purple-300" />
                  <GradientText size="lg" variant="primary">
                    {t("create_playlist")}
                  </GradientText>
                  <p className="text-sm text-purple-100/80">
                    {t("create_playlist_description")}
                  </p>
                  <NeonButton
                    variant="primary"
                    size="sm"
                    onClick={() => setIsGeneratorOpen(true)}
                    className="flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    {t("start_now")}
                  </NeonButton>
                </motion.div>
              )}

              {spotifyUser && playlists.length > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setIsGeneratorOpen(true)}
                  className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-purple-400/60 bg-black/30 p-8 text-center text-purple-100/80 transition-all duration-300 hover:-translate-y-2 hover:border-purple-300 hover:bg-black/40"
                >
                  <Plus className="h-10 w-10" />
                  <GradientText size="lg" variant="primary">
                    {t("create_new_playlist")}
                  </GradientText>
                  <p className="text-sm text-purple-100/70">
                    {t("create_new_playlist_description")}
                  </p>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-red-500/30 bg-black/30 p-6 sm:p-8 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-red-500/10 to-orange-500/10 rounded-3xl blur-xl" />
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600/80">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <GradientText size="2xl" variant="danger">
                    {t("featured_youtube_mix")}
                  </GradientText>
                </div>
                <p className="text-sm text-purple-100/80 sm:text-base">
                  {t("latest_k_pop_travel_playlists")}
                </p>
              </div>
              <a
                href="https://www.youtube.com/playlist?list=PLA91TLEzZINsQDpAkhMAFuDj5C-vJHziT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-red-200 transition-colors duration-200 hover:border-red-400/60 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
                {t("view_full_playlist")}
              </a>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {youtubeVideos.map((video) => (
                <YouTubeVideoCard
                  key={video.id}
                  video={video}
                  onCardClick={setSelectedVideo}
                />
              ))}
            </div>

            {!spotifyUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-purple-600/70 via-pink-600/70 to-purple-700/70 p-8 text-center text-white backdrop-blur-sm"
              >
                <Headphones className="mx-auto h-14 w-14" />
                <h3 className="mt-4 text-2xl font-semibold">
                  {t("create_your_own_playlist")}
                </h3>
                <p className="mt-3 text-sm text-purple-100/85 md:text-base">
                  {t("create_your_own_playlist_description")}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] uppercase tracking-[0.35em] text-purple-100/80">
                  {[
                    t("ai_custom_recommend"),
                    t("unlimited_creation"),
                    t("spotify_auto_save"),
                  ].map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <NeonButton
                  variant="primary"
                  size="md"
                  onClick={handleLogin}
                  className="mt-6 inline-flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  {t("start_now")}
                </NeonButton>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGeneratorOpen && spotifyUser && (
          <PlaylistGeneratorModal
            isOpen={isGeneratorOpen}
            onClose={() => setIsGeneratorOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider {
          background: linear-gradient(to right, #8b5cf6 0%, #ec4899 100%);
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SpotifyPlaylistGenerator;
