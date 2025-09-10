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
  Clock,
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

// 1. 비디오 플레이어 모달 컴포넌트
const VideoPlayerModal = ({ video, onClose }) => {
  if (!video || !video.videoId) return null;

  let srcUrl = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
  if (video.startTime > 0) {
    srcUrl += `&start=${video.startTime}`;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={srcUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 2. 비디오 카드 컴포넌트 (클릭 이벤트 핸들러 추가)
const YouTubeVideoCard = ({ video, onCardClick }) => {
  // video.thumbnail은 실제 데이터의 'image' 속성과 같아야 합니다.
  // 이 컴포넌트는 첫 질문의 코드를 기반으로 합니다.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onCardClick(video)} // 클릭 시 비디오 객체 전달
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      <div className="relative">
        <img
          src={video.thumbnail || video.image} // 데이터 속성에 맞춰 image 또는 thumbnail 사용
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-red-600 rounded-full p-3">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
          {video.title}
        </h4>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{video.publishedAt || "Recently"}</span>
          </div>
          <span>{video.views || ""}</span>
        </div>
      </div>
    </motion.div>
  );
};

const SpotifyPlaylistGenerator = () => {
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  const API_BASE_URL = "http://127.0.0.1:5001";

  // 테마 설정
  const THEMES = {
    도시여행: {
      icon: "🏙️",
      color: "from-blue-500 to-purple-600",
      description: "활기찬 도심 탐험을 위한 에너지 넘치는 K-pop",
    },
    "여름 바캉스": {
      icon: "🏖️",
      color: "from-yellow-400 to-orange-500",
      description: "시원한 바다와 따뜻한 햇살을 느낄 수 있는 청량한 음악",
    },
    야시장: {
      icon: "🎪",
      color: "from-pink-500 to-red-500",
      description: "화려한 네온사인 아래 흥겨운 밤거리 분위기",
    },
    "차분한 여행": {
      icon: "🍃",
      color: "from-green-400 to-teal-500",
      description: "마음을 편안하게 하는 잔잔하고 감성적인 멜로디",
    },
    "운동/워크아웃": {
      icon: "💪",
      color: "from-red-500 to-orange-600",
      description: "강렬한 비트로 운동 효과를 극대화하는 파워풀한 음악",
    },
    "카페/독서": {
      icon: "☕",
      color: "from-amber-400 to-yellow-600",
      description: "집중력을 높이는 차분하고 감각적인 어쿠스틱 사운드",
    },
  };

  // K-pop 아티스트 분류
  const KPOP_ARTISTS = {
    "4세대 걸그룹": [
      "NewJeans",
      "IVE",
      "aespa",
      "LE SSERAFIM",
      "ITZY",
      "(G)I-DLE",
      "NMIXX",
      "STAYC",
    ],
    "4세대 보이그룹": [
      "Stray Kids",
      "ENHYPEN",
      "TXT",
      "ATEEZ",
      "RIIZE",
      "TREASURE",
    ],
    "3세대 레전드": [
      "BTS",
      "BLACKPINK",
      "TWICE",
      "Red Velvet",
      "SEVENTEEN",
      "NCT",
      "MAMAMOO",
    ],
    "솔로 아티스트": [
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
      title: "Seoul City Vibes 🌃",
      description: "서울 도심 여행할 때 듣기 좋은 어반 K-pop",
      image: "/img/seoul_night.png",
      songs: [
        { title: "Shoot Me", artist: "Day6", duration: "3:32" },
        { title: "APT.", artist: "ROSÉ & Bruno Mars", duration: "2:49" },
        { title: "소우주(Mikrosmos)", artist: "BTS", duration: "3:04" },
      ],
      totalDuration: "45분",
      followers: 12500,
      theme: "도시여행",
      isLocked: true,
    },
    {
      id: 2,
      title: "Summer Breeze ☀️",
      description: "청량한 여름 바캉스 K-pop",
      image: "/img/aespa.jpg",
      songs: [
        { title: "Rich Man", artist: "aespa", duration: "3:15" },
        { title: "좋은걸 뭐 어떡해", artist: "Day6", duration: "3:52" },
        { title: "After LIKE", artist: "IVE", duration: "2:58" },
      ],
      totalDuration: "52분",
      followers: 8930,
      theme: "여름 바캉스",
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
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all ${
          playlist.isLocked ? "opacity-75" : ""
        }`}
      >
        <div className="relative">
          <img
            src={playlist.image}
            alt={playlist.title}
            className="w-full h-40 object-cover"
          />

          {/* 
          {playlist.isLocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <LogIn className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">로그인 필요</p>
              </div>
            </div>
          )} */}

          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 text-white text-xs rounded-full ${
                THEMES[playlist.theme]
                  ? `bg-gradient-to-r ${THEMES[playlist.theme].color}`
                  : "bg-gray-500"
              }`}
            >
              {playlist.theme}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2">{playlist.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {playlist.description}
          </p>

          <div className="space-y-2 mb-4">
            {playlist.songs.map((song, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Music className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="font-medium truncate">{song.title}</span>
                  <span className="text-gray-500">- {song.artist}</span>
                </div>
                <span className="text-gray-400">{song.duration}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{playlist.totalDuration}</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {playlist.followers.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              disabled={playlist.isLocked}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                playlist.isLocked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              <Play className="w-4 h-4" />
              재생
            </button>
            <button
              disabled={playlist.isLocked}
              className={`p-2 border rounded-lg ${
                playlist.isLocked
                  ? "border-gray-200 text-gray-400"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // 유튜브 비디오 카드 컴포넌트
  const YouTubeCard = ({ video, onCardClick }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => !video.isLocked && onCardClick(video)} // 비디오 '객체' 전체를 전달
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
      >
        <div className="relative">
          <img
            src={video.image}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white fill-current" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1">{video.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {video.description}
          </p>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 로그인 상태 헤더 */}
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
        <div className="flex items-center justify-between">
          {spotifyUser ? (
            <div className="flex items-center gap-4">
              {spotifyUser.avatar && (
                <img
                  src={spotifyUser.avatar}
                  alt="Spotify avatar"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Hello, {spotifyUser.display_name} 💖
                </h2>
                <p className="text-gray-600">
                  Now, Make a k-pop list just for you🎵
                </p>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Sparkles className="w-5 h-5" />
                create playlist
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-white/50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                logout
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    K-pop travel playlist
                  </h2>
                  <p className="text-gray-600">
                    Log in to Spotify and make a playlist made by AI. Go ahead
                    and experience it✨
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  Spotify Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 플레이리스트 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {spotifyUser ? "My playlist" : "Playlist preview"}
            </h3>
            <p className="text-gray-600 mt-1">
              {spotifyUser
                ? "Your own special playlist created by AI"
                : "Make your own playlist after logging in to Spotify"}
            </p>
          </div>

          {!spotifyUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <p className="text-sm text-yellow-700 font-medium">Preview</p>
            </div>
          )}
        </div>

        {/* 플레이리스트 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(spotifyUser ? playlists : mockPlaylists).map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}

          {/* 빈 상태 또는 추가 생성 카드 */}
          {spotifyUser && playlists.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-xl p-8 text-center"
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">
                첫 번째 플레이리스트 만들기
              </h4>
              <p className="text-gray-600 mb-4">
                AI가 당신의 취향에 맞는 완벽한 K-pop 플레이리스트를 생성합니다
              </p>
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                지금 시작하기
              </button>
            </motion.div>
          )}

          {spotifyUser && playlists.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer"
              onClick={() => setIsGeneratorOpen(true)}
            >
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">
                새 플레이리스트 생성
              </h4>
              <p className="text-gray-600">
                다른 테마나 아티스트로 새로운 플레이리스트를 만들어보세요
              </p>
            </motion.div>
          )}
        </div>
      </div>
      {/*youtube */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-current" />
              </div>
              Featured YouTube Mix
            </h3>
            <p className="text-gray-600 mt-1">
              Latest K-pop travel playlists curated for your journey
            </p>
          </div>
          <a
            href="https://www.youtube.com/playlist?list=PLA91TLEzZINsQDpAkhMAFuDj5C-vJHziT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Playlist
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youtubeVideos.map((video) => (
            <YouTubeVideoCard
              key={video.id}
              video={video}
              onCardClick={setSelectedVideo}
            />
          ))}
        </div>

        {/* 로그인 촉진 섹션 (비로그인 시) */}
        {!spotifyUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white"
          >
            <Headphones className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              나만의 플레이리스트 만들기
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              AI가 당신의 취향과 여행 테마에 맞는 완벽한 K-pop 플레이리스트를
              생성합니다. 수천 곡의 데이터베이스에서 최적의 조합을 찾아
              Spotify에 바로 저장하세요.
            </p>
            <div className="flex items-center justify-center gap-8 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>AI 맞춤 추천</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                <span>무제한 생성</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Spotify 자동 저장</span>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 mx-auto text-lg"
            >
              <LogIn className="w-6 h-6" />
              지금 시작하기
            </button>
          </motion.div>
        )}
      </div>

      {/* 플레이리스트 생성 모달 */}
      <AnimatePresence>
        {isGeneratorOpen && spotifyUser && (
          <PlaylistGeneratorModal
            isOpen={isGeneratorOpen}
            onClose={() => setIsGeneratorOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* youtube모달  */}
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
