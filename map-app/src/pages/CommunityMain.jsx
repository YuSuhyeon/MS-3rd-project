import React, { useState, useEffect, useRef } from "react";
import { Route } from "Entities/Route";
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

// 모바일 감지 훅
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

// playlist 카드 컴포넌트
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

// 메인 컴포넌트
export default function CommunityMain() {
  const { t } = useTranslation("Navigation");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

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

  const [activeTab, setActiveTab] = useState("survival");

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam && ["survival", "playlists"].includes(tabParam)) {
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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const url = new URL(window.location);
    url.searchParams.set("tab", tabId);
    window.history.pushState({}, "", url);
  };

  // 네온 테마 모바일 헤더
  const NeonMobileHeader = () => (
    <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-purple-500/30 z-40 px-4 py-3">
      <div className="flex items-center justify-between">
        <GradientText size="xl" variant="primary">
          Community
        </GradientText>
        <NeonButton
          variant="secondary"
          size="sm"
          onClick={() => setIsSideMenuOpen(true)}
          className="p-2 min-h-[44px] min-w-[44px]"
        >
          <Menu className="w-6 h-6" />
        </NeonButton>
      </div>
    </div>
  );

  const NeonSideDrawer = () => (
    <AnimatePresence>
      {isSideMenuOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSideMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* 드로어 - 네온 스타일 */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-lg border-l border-purple-500/30 z-50 shadow-2xl shadow-purple-500/20"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <GradientText size="2xl" variant="primary">
                  메뉴
                </GradientText>
                <NeonButton
                  variant="danger"
                  size="sm"
                  onClick={() => setIsSideMenuOpen(false)}
                  className="p-2 min-h-[44px] min-w-[44px]"
                >
                  <X className="w-6 h-6" />
                </NeonButton>
              </div>

              {/* 네온 메뉴 아이템들 */}
              <div className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.Icon;
                  return (
                    <NeonButton
                      key={tab.id}
                      variant={activeTab === tab.id ? tab.variant : "secondary"}
                      size="lg"
                      onClick={() => {
                        handleTabClick(tab.id);
                        setIsSideMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 justify-start min-h-[56px]"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium capitalize">
                        {tab.label}
                      </span>
                    </NeonButton>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "survival":
        return <SurvivalKit />;
      case "playlists":
        return (
          <div className={`${isMobile ? "pb-4" : ""}`}>
            <SpotifyPlaylistGenerator />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BackgroundEffect>
      {" "}
      {/* 네온 배경 효과 적용 */}
      {/* 모바일: 네온 헤더 + 사이드 메뉴 */}
      {isMobile ? (
        <>
          <NeonMobileHeader />
          <NeonSideDrawer />
          <div className="px-4 py-6">{renderContent()}</div>
        </>
      ) : (
        // 데스크톱: 네온 상단 탭
        <>
          <div className="bg-black/60 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-5">
              <div className="flex justify-center">
                <div className="relative inline-flex divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/40 shadow-[0_20px_60px_-40px_rgba(168,85,247,0.9)]">
                  {tabs.map((tab, index) => {
                    const Icon = tab.Icon;
                    const isActive = activeTab === tab.id;
                    const isFirst = index === 0;
                    const isLast = index === tabs.length - 1;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabClick(tab.id)}
                        aria-pressed={isActive}
                        className={`group relative flex min-w-[170px] items-center justify-center gap-3 px-7 py-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80 focus-visible:ring-offset-0 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500/80 via-pink-500/70 to-blue-500/70 text-white shadow-[0_18px_45px_-25px_rgba(236,72,153,0.8)]"
                            : "text-purple-100/80 hover:bg-white/10 hover:text-white"
                        } ${isFirst ? "rounded-l-2xl" : ""} ${
                          isLast ? "rounded-r-2xl" : ""
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition-colors duration-200 ${
                            isActive
                              ? "border-white/30 bg-black/20 text-white"
                              : "text-purple-200 group-hover:text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="whitespace-nowrap tracking-wide">
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-8">{renderContent()}</div>
        </>
      )}
    </BackgroundEffect>
  );
}
