import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Home,
  Route,
  Compass,
  Sparkles,
  Calendar,
  Camera,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "페르소나 분석",
    url: createPageUrl("Home"),
    icon: Sparkles,
  },
  {
    title: "결과 대시보드",
    url: createPageUrl("ResultDashboard"),
    icon: Home,
  },
  {
    title: "일정 플래너",
    url: createPageUrl("ItineraryPlanner"),
    icon: Calendar,
  },
  {
    title: "경로 편집",
    url: createPageUrl("DirectionsMantine"),
    icon: Route,
  },
  {
    title: "AI 도슨트",
    url: createPageUrl("DocentMantine"),
    icon: Compass,
  },
  {
    title: "커뮤니티",
    url: createPageUrl("CommunitySocial"), //게시판
    icon: Compass,
  },
  {
    title: "한국에서 살아남기",
    url: createPageUrl("CommunityMain"), //서바이벌키드
    icon: Compass,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // 사이드바 애니메이션 variants
  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
  };

  // 오버레이 애니메이션
  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="layout-container">
      {/* 네온 스타일 토글 버튼 */}
      <motion.button
        className="neon-menu-toggle"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <img src="/img/menu_150.png" alt="메뉴" className="menu-icon" />
        <div className="neon-glow" />
      </motion.button>

      {/* 오버레이 (모바일용) */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            className="sidebar-overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <SidebarProvider>
        {/* 네온 스타일 사이드바 */}
        <motion.div
          className="neon-sidebar"
          variants={sidebarVariants}
          initial="closed"
          animate={isSidebarOpen ? "open" : "closed"}
        >
          <Sidebar className="neon-sidebar-content">
            <SidebarHeader className="neon-sidebar-header">
              <div className="brand-section">
                <motion.div
                  className="brand-logo"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <div className="brand-text">
                  <h2 className="neon-text-primary">AI 투어 플래너</h2>
                  <p className="neon-text-secondary">맞춤형 여행 계획 서비스</p>
                </div>
              </div>

              {/* 닫기 버튼 (모바일에서만 표시) */}
              {isMobile && (
                <motion.button
                  className="close-button"
                  onClick={closeSidebar}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </SidebarHeader>

            <SidebarContent className="neon-sidebar-body">
              <SidebarGroup>
                <SidebarGroupLabel className="neon-group-label">
                  메뉴
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item, index) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                              opacity: isSidebarOpen ? 1 : 0,
                              x: isSidebarOpen ? 0 : -20,
                            }}
                            transition={{
                              duration: 0.3,
                              delay: isSidebarOpen ? index * 0.1 : 0,
                            }}
                          >
                            <Link
                              to={item.url}
                              className="neon-menu-item"
                              onClick={isMobile ? closeSidebar : undefined}
                            >
                              <motion.div
                                className="menu-icon-wrapper"
                                whileHover={{ scale: 1.2, rotate: 10 }}
                              >
                                <item.icon className="w-5 h-5" />
                              </motion.div>
                              <span className="menu-text">{item.title}</span>
                              <div className="neon-border" />
                            </Link>
                          </motion.div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="neon-sidebar-footer">
              <motion.div className="user-section" whileHover={{ scale: 1.02 }}>
                <div className="user-avatar neon-avatar">
                  <span>U</span>
                  <div className="avatar-glow" />
                </div>
                <div className="user-info">
                  <span className="user-name neon-text-primary">여행자</span>
                  <span className="user-desc neon-text-secondary">
                    AI와 함께 여행 계획
                  </span>
                </div>
              </motion.div>
            </SidebarFooter>
          </Sidebar>
        </motion.div>

        {/* 메인 콘텐츠 */}
        <motion.main
          className="main-content"
          animate={{
            marginLeft: !isMobile && isSidebarOpen ? "320px" : "0px",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 40,
          }}
        >
          {children}
        </motion.main>
      </SidebarProvider>

      <style jsx>{`
        /* 레이아웃 컨테이너 */
        .layout-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(
            135deg,
            #0c0c0c 0%,
            #1a0a2e 50%,
            #16213e 100%
          );
        }

        /* 네온 토글 버튼 */
        .neon-menu-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          backdrop-filter: blur(20px);
          border: 1px solid rgba(168, 85, 247, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .menu-icon {
          width: 24px;
          height: 24px;
          filter: brightness(0) invert(1);
          z-index: 2;
          position: relative;
        }

        .neon-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            45deg,
            #a855f7,
            #ec4899,
            #3b82f6,
            #a855f7
          );
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .neon-menu-toggle:hover .neon-glow {
          opacity: 0.6;
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes neon-pulse {
          from {
            box-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 15px #a855f7;
          }
          to {
            box-shadow: 0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #ec4899;
          }
        }

        /* 사이드바 컨테이너 */
        .neon-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 320px;
          z-index: 1000;
        }

        .neon-sidebar-content {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(12, 12, 12, 0.95) 0%,
            rgba(26, 10, 46, 0.95) 50%,
            rgba(22, 33, 62, 0.95) 100%
          );
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 0 50px rgba(168, 85, 247, 0.1),
            inset -1px 0 0 rgba(168, 85, 247, 0.1);
        }

        /* 사이드바 헤더 */
        .neon-sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(145deg, #a855f7, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
        }

        .brand-text h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .brand-text p {
          margin: 4px 0 0 0;
          font-size: 12px;
        }

        .neon-text-primary {
          background: linear-gradient(45deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .neon-text-secondary {
          color: rgba(255, 255, 255, 0.6);
        }

        .close-button {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          cursor: pointer;
        }

        /* 사이드바 바디 */
        .neon-sidebar-body {
          flex: 1;
          padding: 20px;
        }

        .neon-group-label {
          color: rgba(168, 85, 247, 0.8);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        /* 메뉴 아이템 */
        .neon-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          margin-bottom: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .neon-menu-item:hover {
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: white;
          transform: translateX(4px);
        }

        .menu-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(168, 85, 247, 0.1);
        }

        .menu-text {
          font-weight: 500;
          font-size: 14px;
        }

        .neon-border {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0%;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          transition: width 0.3s ease;
        }

        .neon-menu-item:hover .neon-border {
          width: 100%;
        }

        /* 사이드바 푸터 */
        .neon-sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(168, 85, 247, 0.2);
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          background: linear-gradient(
            145deg,
            rgba(168, 85, 247, 0.05),
            rgba(236, 72, 153, 0.05)
          );
          border: 1px solid rgba(168, 85, 247, 0.2);
        }

        .neon-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(145deg, #a855f7, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          position: relative;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
        }

        .avatar-glow {
          position: absolute;
          inset: -3px;
          background: linear-gradient(
            45deg,
            #a855f7,
            #ec4899,
            #3b82f6,
            #a855f7
          );
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .user-section:hover .avatar-glow {
          opacity: 0.6;
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
        }

        .user-desc {
          font-size: 12px;
        }

        /* 오버레이 */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        /* 메인 콘텐츠 */
        .main-content {
          width: 100%;
          min-height: 100vh;
          padding-top: 80px;
          transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 모바일 최적화 */
        @media (max-width: 767px) {
          .neon-menu-toggle {
            top: 15px;
            left: 15px;
            width: 45px;
            height: 45px;
          }

          .main-content {
            padding-top: 75px;
          }

          .neon-sidebar {
            width: 280px;
          }
        }

        /* 아주 작은 화면 */
        @media (max-width: 320px) {
          .neon-sidebar {
            width: calc(100vw - 40px);
          }
        }
      `}</style>
    </div>
  );
}
