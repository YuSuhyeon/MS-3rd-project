import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  Wand2,
  Map,
  Edit3,
  Heart,
  Star,
  MapPin,
  Camera,
  Music,
  Plane,
  ChevronRight,
  Globe,
  Users,
  Clock,
  Award,
  Play,
  Pause,
} from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "components/BrandLogo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const KPopTravelHome = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redirectOnLogin, setRedirectOnLogin] = useState(false);

  // 랜덤 이름과 애니메이션을 위한 상태들
  const [displayName, setDisplayName] = useState("'s");
  const [isNameAnimating, setIsNameAnimating] = useState(false);

  const { scrollY } = useScroll();
  const { profile, login, logout } = useAuth();

  // 랜덤 이름 배열
  const randomNames = [
    "Tom",
    "Sarah",
    "Alex",
    "Emma",
    "David",
    "Lisa",
    "Ryan",
    "Kate",
    "Mike",
    "Anna",
    "Chris",
    "Julia",
    "Daniel",
    "Sophie",
    "Matt",
    "Grace",
    "Kevin",
    "Maya",
    "Jordan",
    "Nicole",
    "Tyler",
    "Chloe",
    "Austin",
    "Zoe",
  ];
  // 실시간 인기 여행지 목록 (API areaName 포함)
  const places = [
    {
      id: "place1",
      name: "명동",
      icon: "🛍️",
      areaName: "명동 관광특구",
    },
    {
      id: "place2",
      name: "광화문",
      icon: "🏛️",
      areaName: "광화문·덕수궁",
    },
    {
      id: "place3",
      name: "이태원",
      icon: "🌍",
      areaName: "이태원 관광특구",
    },
    {
      id: "place4",
      name: "잠실",
      icon: "🎡",
      areaName: "잠실 관광특구",
    },
  ];

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const navigate = useNavigate();

  // 랜덤 이름 선택 함수
  const getRandomName = () => {
    return randomNames[Math.floor(Math.random() * randomNames.length)];
  };

  // 컴포넌트 마운트 시 랜덤 이름으로 시작
  useEffect(() => {
    if (!profile) {
      const timer = setTimeout(() => {
        setDisplayName(`${getRandomName()}'s`);
      }, 1000); // 1초 후 랜덤 이름으로 변경

      return () => clearTimeout(timer);
    }
  }, []);

  // 주기적으로 랜덤 이름 변경 (로그인 전에만)
  useEffect(() => {
    if (!profile && displayName !== "'s") {
      const interval = setInterval(() => {
        setIsNameAnimating(true);

        setTimeout(() => {
          setDisplayName(`${getRandomName()}'s`);
          setIsNameAnimating(false);
        }, 300); // 애니메이션 중간에 이름 변경
      }, 3000); // 3초마다 변경

      return () => clearInterval(interval);
    }
  }, [profile, displayName]);

  // 로그인 성공 시 사용자 이름으로 변경
  useEffect(() => {
    if (profile && profile.name) {
      setIsNameAnimating(true);

      setTimeout(() => {
        // 사용자 이름에서 첫 번째 이름만 추출 (공백 기준으로 분리)
        const firstName = profile.name.split(" ")[0];
        setDisplayName(`${firstName}'s`);
        setIsNameAnimating(false);
      }, 300);
    }
  }, [profile]);

  // 로그인 성공 시 처리 로직 (기존 코드에 딜레이 추가)
  useEffect(() => {
    if (profile && showLoginModal) {
      setShowLoginModal(false);

      if (redirectOnLogin) {
        // 이름 애니메이션이 완료된 후 페이지 이동
        setTimeout(() => {
          navigate("/persona");
          setRedirectOnLogin(false);
        }, 2000); // 2초 후 이동하여 사용자가 이름 변경을 볼 수 있게 함
      }
    }
  }, [profile, showLoginModal, redirectOnLogin, navigate]);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStartClick = () => {
    if (profile) {
      navigate("/persona");
    } else {
      setRedirectOnLogin(true);
      setShowLoginModal(true);
    }
  };

  // 이름 애니메이션 변형
  const nameVariants = {
    initial: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)",
    },
    animating: {
      opacity: 0.3,
      scale: 0.95,
      rotateY: 90,
      filter: "blur(2px)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    complete: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        delay: 0.1,
      },
    },
  };

  // Floating animation variants
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI 페르소나 분석",
      description: "5가지 질문으로 당신만의 여행 스타일 발견",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "맞춤 코스 추천",
      description: "AI가 실시간으로 생성하는 완벽한 여행 루트",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "K-Pop 플레이리스트",
      description: "여행지별 분위기에 맞는 나만의 K-Pop 음악",
      gradient: "from-pink-500 to-red-500",
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "AI 도슨트",
      description: "RAG 기반 챗봇으로 현지 문화 깊이 체험",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const stats = [
    {
      number: "10K+",
      label: "맞춤 여행 생성",
      icon: <Globe className="w-5 h-5" />,
    },
    { number: "98%", label: "만족도", icon: <Heart className="w-5 h-5" /> },
    { number: "24/7", label: "AI 지원", icon: <Clock className="w-5 h-5" /> },
    { number: "5★", label: "평균 평점", icon: <Star className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full"
          variants={floatingVariants}
          animate="animate"
          style={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-3 h-3 bg-pink-400 rounded-full"
          variants={floatingVariants}
          animate="animate"
          style={{
            x: mousePosition.x * -0.03,
            y: mousePosition.y * 0.01,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/4 w-4 h-4 bg-blue-400 rounded-full"
          variants={floatingVariants}
          animate="animate"
          style={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * -0.02,
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(147 51 234) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TravelK
                </h1>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  AI 맞춤형 여행 플래너
                </p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => {
                  window.featuresSection?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                기능
              </button>
              <button
                onClick={() => {
                  window.howItWorksSection?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                사용법
              </button>
              <button
                onClick={() => {
                  // Community 섹션이 없으므로 페이지 하단으로 스크롤
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  });
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                커뮤니티
              </button>
            </div>

            {/* Login/Profile section */}
            {profile ? (
              <div className="flex items-center gap-4">
                <img
                  src={profile.picture || "https://via.placeholder.com/40"}
                  alt="profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white/90 font-semibold hidden sm:block">
                  {profile.name}님 환영합니다!
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl font-semibold text-white/90 border border-white/30 hover:bg-white/10 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-white shadow-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                로그인
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm">
                AI 기반 맞춤형 여행 플래너
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {/* 애니메이션이 적용된 이름 부분 */}
              <motion.span
                variants={nameVariants}
                initial="initial"
                animate={isNameAnimating ? "animating" : "complete"}
                className="inline-block"
                style={{ transformStyle: "preserve-3d" }}
              >
                {displayName}
              </motion.span>{" "}
              <motion.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300%"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                K-여행
              </motion.span>
              을
              <br />
              AI가 만들어드려요
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              5가지 질문으로 여행 스타일을 분석하고, K-Pop과 함께하는 완벽한
              코스를 추천받으세요. 복잡한 계획은 AI에게, 당신은 설렘만
              준비하세요.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.button
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-lg shadow-2xl flex items-center gap-3 justify-center"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartClick}
              >
                <Wand2 className="w-5 h-5" />
                {profile ? "페르소나 분석 시작" : "시작하기"}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Cards */}
        <motion.div
          className="absolute top-20 right-10 hidden lg:block"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">Now Playing</div>
                <div className="text-xs text-gray-300">BTS - Spring Day</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-32 left-10 hidden lg:block"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-pink-400" />
              <div>
                <div className="text-sm font-semibold">추천 스팟</div>
                <div className="text-xs text-gray-300">홍대 K-Pop 스퀘어</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              AI가 만드는{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                특별한 경험
              </span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              혁신적인 AI 기술로 당신만의 완벽한 한국 여행을 설계합니다
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 text-white`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>

                  <h3 className="text-xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  <motion.div
                    className="mt-4 text-purple-400 flex items-center gap-2 cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-sm font-medium">자세히 보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative py-32 px-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              간단한 3단계로{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                완성
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                //  step: "01",
                title: "페르소나 분석",
                description: "5가지 질문으로 여행 스타일 분석",
                icon: <Sparkles className="w-8 h-8" />,
                gradient: "from-purple-500 to-blue-500",
              },
              {
                // step: "02",
                title: "AI 맞춤 추천",
                description: "분석 결과 기반 완벽한 코스 생성",
                icon: <Wand2 className="w-8 h-8" />,
                gradient: "from-blue-500 to-pink-500",
              },
              {
                // step: "03",
                title: "자유로운 편집",
                description: "드래그 & 드롭으로 나만의 플랜 완성",
                icon: <Edit3 className="w-8 h-8" />,
                gradient: "from-pink-500 to-purple-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <motion.div
                  className="relative mb-8"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white shadow-2xl`}
                  >
                    {item.icon}
                  </div>
                  {/* 숫자 동그라미 부분 
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>*/}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 실시간 인기 여행지 Section */}
      <section className="relative py-32 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
              실시간 인기{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                여행지
              </span>
              를<br />
              만나보세요
            </h2>

            <p className="text-gray-300 text-lg mb-10 relative z-10 max-w-2xl mx-auto">
              다른 여행자들이 선택한 인기 코스를 확인해보세요
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 relative z-10">
              {places.map((place) => (
                <Link
                  to={`/popular-places/${encodeURIComponent(place.areaName)}`}
                  key={place.id}
                >
                  <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center cursor-pointer"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 0px 15px rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <div className="text-4xl mb-3">{place.icon}</div>
                    <h3 className="font-semibold text-lg">{place.name}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>
      {/* Footer */}
      <footer className="relative border-t border-white/10 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TravelK
                </h1>
                <p className="text-sm text-gray-400">AI 여행 플래너</p>
              </div>
            </motion.div>
          </div>

          <p className="text-gray-400 mb-8">
            AI와 함께하는 완벽한 한국 여행을 경험해보세요
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-white transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-white transition-colors">
              고객센터
            </a>
            <a href="#" className="hover:text-white transition-colors">
              파트너십
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-gray-500 text-sm">
            © 2024 TravelK. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
            />

            <motion.div
              className="relative bg-gray-900 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  TravelK에 오신 것을 환영합니다
                </h2>
                <p className="text-gray-300">
                  AI 맞춤 여행 플래너를 시작하려면 로그인하세요
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  onClick={() => login("google")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C44.591,35.021,48,29.412,48,24C48,22.659,47.862,21.35,47.611,20.083z"
                    />
                  </svg>
                  Google로 계속하기
                </motion.button>
                <motion.button
                  onClick={() => login("microsoft")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 23 23"
                  >
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  Microsoft로 계속하기
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  계속 진행하시면{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    이용약관
                  </a>
                  과{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    개인정보처리방침
                  </a>
                  에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KPopTravelHome;
