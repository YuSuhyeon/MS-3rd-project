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
import LanguageButtons from "components/ui/LanguageButtons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

import {
  BackgroundEffect,
  NeonCard,
  GradientText,
  NeonButton,
  ResponsiveGrid,
  DataDisplay,
  NeonScrollbarStyles,
} from "../components/ui/NeonTheme";
import "../styles/custom_detail.css";

const KPopTravelHome = () => {
  const { t } = useTranslation("common");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [redirectOnLogin, setRedirectOnLogin] = useState(false);
  const { profile, login, logout } = useAuth();

  // 랜덤 이름과 애니메이션을 위한 상태들
  const [displayName, setDisplayName] = useState("'s");
  const [isNameAnimating, setIsNameAnimating] = useState(false);

  // 스크롤 기반 버튼 상태 추가
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  // 랜덤 이름 배열
  const randomNames = [
    "Tom",
    "진희",
    "Alex",
    "정훈",
    "David",
    "Jenny",
    "Lisa",
    "연수",
    "주영",
    "영현",
    "Rose",
    "도운",
    "원필",
    "Chris",
  ];

  // 실시간 인기 여행지 목록
  const places = [
    {
      id: "place1",
      name: t("place1"),
      icon: "🛍️",
      areaName: "명동 관광특구",
    },
    {
      id: "place2",
      name: t("place2"),
      icon: "🏛️",
      areaName: "광화문·덕수궁",
    },
    {
      id: "place3",
      name: t("place3"),
      icon: "🌍",
      areaName: "이태원 관광특구",
    },
    {
      id: "place4",
      name: t("place4"),
      icon: "🎡",
      areaName: "잠실 관광특구",
    },
  ];

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
      }, 1000);
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
        }, 300);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [profile, displayName]);

  // 로그인 성공 시 사용자 이름으로 변경
  useEffect(() => {
    if (profile && profile.name) {
      setIsNameAnimating(true);
      setTimeout(() => {
        const firstName = profile.name.split(" ")[0];
        setDisplayName(`${firstName}'s`);
        setIsNameAnimating(false);
      }, 300);
    }
  }, [profile]);

  // 로그인 성공 시 처리 로직
  useEffect(() => {
    if (profile && showLoginModal) {
      setShowLoginModal(false);
      if (redirectOnLogin) {
        setTimeout(() => {
          navigate("/persona");
          setRedirectOnLogin(false);
        }, 2000);
      }
    }
  }, [profile, showLoginModal, redirectOnLogin, navigate]);

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

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t("features.title1"),
      description: t("features.desc1"),
      variant: "default",
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: t("features.title2"),
      description: t("features.desc2"),
      variant: "primary",
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: t("features.title3"),
      description: t("features.desc3"),
      variant: "danger",
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: t("features.title4"),
      description: t("features.desc4"),
      variant: "primary",
    },
  ];

  const stats = [
    {
      number: "10K+",
      label: t("stats.label1"),
      icon: <Globe className="w-5 h-5" />,
      variant: "primary",
    },
    {
      number: "98%",
      label: t("stats.label2"),
      icon: <Heart className="w-5 h-5" />,
      variant: "success",
    },
    {
      number: "24/7",
      label: t("stats.label3"),
      icon: <Clock className="w-5 h-5" />,
      variant: "info",
    },
    {
      number: "5★",
      label: t("stats.label4"),
      icon: <Star className="w-5 h-5" />,
      variant: "warning",
    },
  ];

  // 스크롤 80%에서 버튼 나타나게 하는 효과
  useEffect(() => {
    const updateButtonVisibility = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const totalDocScrollLength = docHeight - windowHeight;
      const scrollPosition = Math.floor(
        (scrollTop / totalDocScrollLength) * 100
      );

      // 디버깅용 콘솔 로그 (나중에 제거)
      console.log("Scroll Debug:", {
        scrollTop,
        windowHeight,
        docHeight,
        totalDocScrollLength,
        scrollPosition,
      });

      if (scrollPosition >= 80) {
        console.log("Button should show!");
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    // 초기 설정
    updateButtonVisibility();

    // 스크롤 이벤트 리스너 직접 추가 (Framer Motion과 병행)
    window.addEventListener("scroll", updateButtonVisibility);

    // Framer Motion의 scrollY도 함께 사용
    const unsubscribe = scrollY.onChange(updateButtonVisibility);

    return () => {
      window.removeEventListener("scroll", updateButtonVisibility);
      unsubscribe();
    };
  }, [scrollY]); // scrollY 의존성 추가

  return (
    <BackgroundEffect className="min-h-screen neon-scrollbar">
      {/* NeonTheme 스크롤바 스타일 */}
      <NeonScrollbarStyles />

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "transparent",
          backdropFilter: "none",
          borderBottom: "none",
          outline: "none",
        }}
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
                <GradientText variant="primary" size="lg" className="font-bold">
                  TravelK
                </GradientText>
                <p className="text-xs text-gray-300 whitespace-nowrap">
                  {t("main.badge")}
                </p>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <LanguageButtons />
            </div>
            {/* Login/Profile section 
            {profile ? (
              <div className="flex items-center gap-4">
                <LanguageButtons />
                <img
                  src={profile.picture || "https://via.placeholder.com/40"}
                  alt="profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-400"
                />
                <span className="text-white/90 font-semibold hidden sm:block">
                  {t("login.welcome", { name: profile.name })}
                </span>
                <NeonButton onClick={logout} variant="secondary" size="sm">
                  {t("login.logout")}
                </NeonButton>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <LanguageButtons />
                <NeonButton
                  onClick={() => setShowLoginModal(true)}
                  variant="primary"
                  size="md"
                >
                  {t("login.login")}
                </NeonButton>
              </div>
            )}*/}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
        style={{
          y: heroY,
          opacity: heroOpacity,
          border: "none",
          outline: "none",
          margin: 0,
        }}
      >
        <div className="max-w-4xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-6 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.span
                variants={nameVariants}
                initial="initial"
                animate={isNameAnimating ? "animating" : "complete"}
                className="inline-block"
                style={{ transformStyle: "preserve-3d" }}
              >
                {displayName}
              </motion.span>{" "}
              <GradientText variant="primary" size="6xl">
                {t("main.title.k_travel")}
              </GradientText>
              {t("main.title.connector")}
              <br />
              {t("main.title.ai_creates")}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {t("main.subtitle")}
            </motion.p>

            {/* AnimatePresence 없이 직접 애니메이션 */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.div
                animate={{
                  opacity: showButton ? 1 : 0,
                  y: showButton ? 0 : 50,
                  scale: showButton ? 1 : 0.8,
                  pointerEvents: showButton ? "auto" : "none",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.6,
                }}
              >
                <NeonButton
                  onClick={handleStartClick}
                  variant="primary"
                  size="lg"
                  className="flex items-center gap-3"
                >
                  <Wand2 className="w-5 h-5" />
                  {profile ? t("main.start.persona") : t("main.start.start")}
                  <ChevronRight className="w-5 h-5" />
                </NeonButton>
              </motion.div>
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
                <DataDisplay
                  value={stat.number}
                  label={stat.label}
                  variant={stat.variant}
                  size="lg"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-32 px-6"
        style={{
          border: "none",
          outline: "none",
          margin: 0,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GradientText variant="primary" size="5xl" className="mb-6 block">
              {t("main.title.ai_action")} {t("main.title.experience")}
            </GradientText>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {t("main.subtitle.ai_action")}
            </p>
          </motion.div>

          <ResponsiveGrid>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <NeonCard
                  icon={feature.icon}
                  title={feature.title}
                  variant={feature.variant}
                  delay={index * 0.1}
                  className="h-full"
                >
                  <p className="leading-relaxed mb-4">{feature.description}</p>
                  <motion.div
                    className="text-purple-400 flex items-center gap-2 cursor-pointer"
                    whileHover={{ x: 5 }}
                  >
                    <span className="text-sm font-medium">
                      {t("main.more.view")}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </NeonCard>
              </motion.div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative py-32 px-6"
        style={{
          border: "none",
          outline: "none",
          margin: 0,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GradientText variant="primary" size="5xl" className="mb-6 block">
              {t("steps.title")} {t("steps.completion")}
            </GradientText>
          </motion.div>

          <ResponsiveGrid className="md:grid-cols-3">
            {[
              {
                title: t("steps.step1.title"),
                description: t("steps.step1.description"),
                icon: <Sparkles className="w-8 h-8" />,
                variant: "default",
              },
              {
                title: t("steps.step2.title"),
                description: t("steps.step2.description"),
                icon: <Wand2 className="w-8 h-8" />,
                variant: "primary",
              },
              {
                title: t("steps.step3.title"),
                description: t("steps.step3.description"),
                icon: <Edit3 className="w-8 h-8" />,
                variant: "danger",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <NeonCard
                  icon={item.icon}
                  title={item.title}
                  variant={item.variant}
                  delay={index * 0.2}
                  className="text-center h-full"
                >
                  <p className="leading-relaxed">{item.description}</p>
                </NeonCard>
              </motion.div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>

      {/* 실시간 인기 여행지 Section */}
      <section
        className="relative py-32 px-6"
        style={{
          border: "none",
          outline: "none",
          margin: 0,
        }}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <NeonCard variant="primary" className="text-center" delay={0.3}>
            <GradientText variant="primary" size="4xl" className="mb-6 block">
              {t("popular.title")} {t("popular.highlight")}
              {t("popular.action.join")}
            </GradientText>
            <GradientText variant="secondary" size="2xl" className="mb-6 block">
              {t("popular.action")}
            </GradientText>

            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              {t("popular.description")}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {places.map((place, index) => (
                <Link
                  to={`/popular-places/${encodeURIComponent(place.areaName)}`}
                  key={place.id}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NeonCard
                      variant="success"
                      delay={index * 0.1}
                      className="text-center hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="text-4xl mb-3">{place.icon}</div>
                      <h3 className="font-semibold text-lg text-white">
                        {place.name}
                      </h3>
                    </NeonCard>
                  </motion.div>
                </Link>
              ))}
            </div>
          </NeonCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="relative py-16 px-6"
        style={{
          borderTop: "none", // 기존 border-t 제거
          border: "none",
          outline: "none",
          margin: 0,
        }}
      >
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
                <GradientText
                  variant="primary"
                  size="2xl"
                  className="font-bold"
                >
                  TravelK
                </GradientText>
                <p className="text-sm text-gray-400">{t("main.badge")}</p>
              </div>
            </motion.div>
          </div>

          <p className="text-gray-400 mb-8">{t("footer.slogan")}</p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-purple-300 transition-colors">
              {t("footer.privacy_policy")}
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              {t("footer.terms_of_service")}
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              {t("footer.customer_center")}
            </a>
            <a href="#" className="hover:text-purple-300 transition-colors">
              {t("footer.partnership")}
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-purple-500/30 text-gray-500 text-sm">
            {t("footer.copyright")}
          </div>
        </div>
      </footer>

      {/* Login Modal 
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
                  {t("modal.welcome")}
                </h2>
                <p className="text-gray-300">{t("modal.instruction")}</p>
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
                  {t("modal.continue_google")}
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
                  {t("modal.continue_microsoft")}
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  {t("modal.disclaimer.prefix")}{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    {t("modal.disclaimer.terms")}
                  </a>
                  {t("modal.disclaimer.and")}{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300">
                    {t("modal.disclaimer.privacy")}
                  </a>
                  {t("modal.disclaimer.suffix")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>*/}
    </BackgroundEffect>
  );
};

export default KPopTravelHome;
