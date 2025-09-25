import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Navigation, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
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
  BookOpen,
} from "lucide-react";
import {
  BackgroundEffect,
  NeonCard,
  NeonButton,
  GradientText,
  ResponsiveGrid,
} from "../components/ui/NeonTheme";
import SpotifyPlaylistGenerator from "components/community/SpotifyPlaylistGenerator";
import SurvivalKit from "components/community/SurvivalKit";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      const updateMatches = () => setMatches(media.matches);
      updateMatches();
      media.addEventListener("change", updateMatches);
      return () => media.removeEventListener("change", updateMatches);
    }
  }, [query]);

  return matches;
};

const PlaylistCard = ({ playlist }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group ${
        isMobile ? "mx-4" : ""
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={playlist.image}
          alt={playlist.title}
          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isMobile ? "h-32" : "h-48"
          }`}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${
              isMobile ? "w-12 h-12" : "w-16 h-16"
            }`}
          >
            <Play
              className={`text-purple-600 ml-1 ${
                isMobile ? "w-4 h-4" : "w-6 h-6"
              }`}
            />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
            🎵 {playlist.theme}
          </span>
        </div>
      </div>

      <div className={`p-4 ${isMobile ? "p-3" : "p-4"}`}>
        <h3
          className={`font-bold text-gray-900 mb-2 ${
            isMobile ? "text-sm" : "text-base"
          }`}
        >
          {playlist.title}
        </h3>
        <p
          className={`text-gray-600 mb-3 line-clamp-2 ${
            isMobile ? "text-xs" : "text-sm"
          }`}
        >
          {playlist.description}
        </p>

        <div className="space-y-2 mb-4">
          {playlist.songs.slice(0, isMobile ? 1 : 2).map((song, index) => (
            <div
              key={index}
              className={`flex items-center justify-between ${
                isMobile ? "text-xs" : "text-sm"
              }`}
            >
              <div className="flex items-center gap-2">
                <Music
                  className={`text-gray-400 ${
                    isMobile ? "w-2 h-2" : "w-3 h-3"
                  }`}
                />
                <span className="font-medium truncate">{song.title}</span>
                <span className="text-gray-500 hidden sm:inline">
                  - {song.artist}
                </span>
              </div>
              <span className="text-gray-400 hidden sm:inline">
                {song.duration}
              </span>
            </div>
          ))}
          {playlist.songs.length > (isMobile ? 1 : 2) && (
            <div
              className={`text-gray-500 ${isMobile ? "text-xs" : "text-xs"}`}
            >
              +{playlist.songs.length - (isMobile ? 1 : 2)}곡 더 보기
            </div>
          )}
        </div>

        <div className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}>
          <button
            className={`flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 ${
              isMobile ? "text-sm min-h-[44px]" : "text-sm"
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Spotify에서 열기
          </button>
          {!isMobile && (
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CommunityMain() {
  const { t } = useTranslation("Navigation");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 컨테이너 너비 고정을 위한 스타일
  const containerStyle = {
    width: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const tabs = [
    {
      id: "survival",
      label: t("survival_kit"),
      Icon: ShoppingBag,
      variant: "primary",
    },
    {
      id: "playlists",
      label: t("playlists"),
      Icon: Music,
      variant: "success",
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab(tabs[0].id);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [tabs]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;

    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

    if (info.offset.x < -swipeThreshold || swipePower < -10000) {
      const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
      if (nextIndex !== activeIndex) {
        handleTabClick(tabs[nextIndex].id);
      }
    } else if (info.offset.x > swipeThreshold || swipePower > 10000) {
      const prevIndex = Math.max(activeIndex - 1, 0);
      if (prevIndex !== activeIndex) {
        handleTabClick(tabs[prevIndex].id);
      }
    }
  };

  const renderTabContent = (tabId) => {
    const contentStyle = {
      width: "100%",
      minWidth: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    };

    const innerContentStyle = {
      width: "100%",
      minWidth: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    };

    switch (tabId) {
      case "survival":
        return (
          <div className="w-full h-full overflow-hidden" style={contentStyle}>
            <div style={innerContentStyle}>
              <SurvivalKit />
            </div>
          </div>
        );
      case "playlists":
        return (
          <div className="w-full h-full overflow-hidden" style={contentStyle}>
            <div style={innerContentStyle}>
              <div
                className="w-full max-w-full overflow-hidden"
                style={innerContentStyle}
              >
                <SpotifyPlaylistGenerator />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    return renderTabContent(activeTab);
  };

  return (
    <BackgroundEffect className="flex-1 min-h-screen overflow-y-auto overflow-x-hidden">
      <style jsx>{`
        .fixed-width-container {
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
        .fixed-width-container * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 fixed-width-container"
        style={containerStyle}
      >
        {/* 상단 탭 헤더 (CommunitySocial과 동일한 스타일) */}
        {isMobile ? (
          <div className="sticky top-0 z-40 px-2 py-2">
            <div className="flex p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`${
                    activeTab === tab.id ? "" : "hover:bg-white/5"
                  } relative flex-1 text-sm font-semibold text-white p-2 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="mobile-active-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    <tab.Icon
                      className="h-5 w-5 md:h-6 md:w-6"
                      aria-label={tab.label}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="sticky top-0 z-50">
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 pt-4"
              style={{
                borderBottom: "none",
              }}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {tabs.map((tab) => {
                    const Icon = tab.Icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabClick(tab.id)}
                        aria-pressed={isActive}
                        className={`relative -mb-px pb-3 pt-2 text-sm font-semibold transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-purple-100/80 hover:text-white"
                        }`}
                        style={{
                          borderBottom: isActive
                            ? "2px solid rgba(168, 85, 247, 0.9)"
                            : "2px solid transparent",
                          filter:
                            "drop-shadow(0 0 1px rgba(236,72,153,0.5)) drop-shadow(0 0 2px rgba(168,85,247,0.6)) drop-shadow(0 0 4px rgba(168,85,247,0.4))",
                        }}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon
                            className="h-5 w-5 md:h-6 md:w-6"
                            aria-label={tab.label}
                          />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="hidden md:block ml-auto" />
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 - 고정된 레이아웃 */}
        <div className="relative z-10 px-2 py-4 md:p-6 md:pt-16 w-full max-w-7xl mx-auto">
          <div className="w-full relative z-10">
            {isMobile ? (
              // 모바일: 스와이프 가능한 고정 컨테이너
              <div className="overflow-hidden h-[calc(100vh-200px)] min-h-[600px] w-full">
                <motion.div
                  className="flex h-full w-full"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                  animate={{
                    x: `-${
                      tabs.findIndex((tab) => tab.id === activeTab) * 100
                    }%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {tabs.map((tab) => (
                    <motion.div
                      key={tab.id}
                      className="w-full flex-shrink-0 px-4 py-6 h-full overflow-y-auto"
                      style={{ width: "100vw", maxWidth: "100%" }}
                      initial={false}
                    >
                      <div className="h-full w-full max-w-full">
                        {renderTabContent(tab.id)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              // 데스크톱: 고정 높이와 너비 컨테이너
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="min-h-[800px] h-[calc(100vh-250px)] w-full max-w-7xl mx-auto"
                style={{ width: "100%", minWidth: "100%", maxWidth: "100%" }}
              >
                <div className="h-full w-full overflow-y-auto overflow-x-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="h-full w-full"
                      style={{
                        width: "100%",
                        minWidth: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      <div className="w-full max-w-full overflow-hidden">
                        {renderContent()}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </BackgroundEffect>
  );
}
