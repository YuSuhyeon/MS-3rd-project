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
        className="relative w-full max-w-[92vw] sm:max-w-3xl lg:max-w-4xl"
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
      // API 호출 예시 (실제 구현 시 사용)
      // const response = await fetch(`${API_BASE_URL}/api/spotify/playlists`, {
      //   credentials: "include",
      // });
      // const data = await response.json();
      // setPlaylists(data.playlists);

      // 임시로 mock 데이터 사용
      setPlaylists(mockPlaylists.map((p) => ({ ...p, isLocked: false })));
    } catch (error) {
      console.error("Error loading playlists:", error);
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
        // 실제 API 호출 (예시)
        // const response = await fetch(`${API_BASE_URL}/api/spotify/generate-playlist`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   credentials: 'include',
        //   body: JSON.stringify({
        //     theme: selectedTheme,
        //     artists: selectedArtists,
        //     settings: playlistSettings
        //   })
        // });

        // 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setGeneratedTracks([
          {
            id: 1,
            name: "APT.",
            artist: "ROSÉ & Bruno Mars",
            duration: "2:49",
            popularity: 95,
          },
          {
            id: 2,
            name: "Supernova",
            artist: "aespa",
            duration: "3:04",
            popularity: 88,
          },
          {
            id: 3,
            name: "How Sweet",
            artist: "NewJeans",
            duration: "3:32",
            popularity: 92,
          },
        ]);

        setIsGenerating(false);
      } catch (error) {
        console.error("Error generating playlist:", error);
        setIsGenerating(false);
      }
    };

    const saveToSpotify = async () => {
      try {
        // 실제 Spotify 저장 API 호출
        // const response = await fetch(`${API_BASE_URL}/api/spotify/create-playlist`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   credentials: 'include',
        //   body: JSON.stringify({
        //     name: playlistSettings.name || `${selectedTheme} 플레이리스트`,
        //     tracks: generatedTracks
        //   })
        // });

        alert("플레이리스트가 Spotify에 저장되었습니다!");
        onClose();
        loadUserPlaylists(); // 플레이리스트 목록 새로고침
      } catch (error) {
        console.error("Error saving to Spotify:", error);
      }
    };

    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI 플레이리스트 생성</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    여행 테마를 선택하세요
                  </h3>
                  <p className="text-gray-600">
                    선택한 테마에 맞는 K-pop 플레이리스트를 생성합니다
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(THEMES).map(([theme, config]) => (
                    <button
                      key={theme}
                      onClick={() => setSelectedTheme(theme)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedTheme === theme
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center text-lg`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{theme}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Mic className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    선호 아티스트 선택 (선택사항)
                  </h3>
                  <p className="text-gray-600">최대 5명까지 선택 가능합니다</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.keys(KPOP_ARTISTS).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedArtistCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedArtistCategory === category
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {selectedArtists.length > 0 && (
                  <div className="bg-pink-50 rounded-lg p-4">
                    <h4 className="font-medium text-pink-900 mb-2">
                      선택된 아티스트 ({selectedArtists.length}/5)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtists.map((artist) => (
                        <span
                          key={artist}
                          className="flex items-center gap-1 px-2 py-1 bg-pink-600 text-white text-sm rounded-full"
                        >
                          {artist}
                          <button onClick={() => handleArtistToggle(artist)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {KPOP_ARTISTS[selectedArtistCategory].map((artist) => (
                    <button
                      key={artist}
                      onClick={() => handleArtistToggle(artist)}
                      disabled={
                        !selectedArtists.includes(artist) &&
                        selectedArtists.length >= 5
                      }
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selectedArtists.includes(artist)
                          ? "bg-pink-600 text-white"
                          : selectedArtists.length >= 5
                          ? "bg-gray-50 text-gray-400"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Radio className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">플레이리스트 설정</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
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
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      트랙 수: {playlistSettings.trackCount}곡
                    </label>
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
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={playlistSettings.includePopular}
                        onChange={(e) =>
                          setPlaylistSettings({
                            ...playlistSettings,
                            includePopular: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm">인기 곡 우선 포함</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={playlistSettings.includeRecent}
                        onChange={(e) =>
                          setPlaylistSettings({
                            ...playlistSettings,
                            includeRecent: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm">최신 곡 포함</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-8">
                {isGenerating ? (
                  <div>
                    <Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold mb-2">
                      플레이리스트 생성 중...
                    </h3>
                    <p className="text-gray-600">
                      AI가 완벽한 조합을 찾고 있어요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <Music className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        플레이리스트 완성!
                      </h3>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {generatedTracks.map((track, index) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 p-2"
                        >
                          <span className="text-gray-400 w-6">{index + 1}</span>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{track.name}</p>
                            <p className="text-sm text-gray-600">
                              {track.artist}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {track.duration}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={saveToSpotify}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Spotify에 저장
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>

            <div className="flex gap-3">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </button>
              )}

              {step < 3 && (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !selectedTheme}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  다음
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={generatePlaylist}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  생성하기
                </button>
              )}
            </div>
          </div>
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
    <div className="space-y-10">
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
    </div>
  );
};

export default SpotifyPlaylistGenerator;
