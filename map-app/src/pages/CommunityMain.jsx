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
    switch (tabId) {
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

  const renderContent = () => {
    return renderTabContent(activeTab);
  };

  return (
    <BackgroundEffect>
      {isMobile ? (
        <>
          <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-purple-500/30 z-40 px-2 py-2">
            <div className="flex bg-gray-900/50 p-1 rounded-lg">
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
                      className="absolute inset-0 bg-purple-600/50 rounded-md"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <tab.Icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-hidden">
            <motion.div
              className="flex"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={{
                x: `-${tabs.findIndex((tab) => tab.id === activeTab) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {tabs.map((tab) => (
                <motion.div
                  key={tab.id}
                  className="w-full flex-shrink-0 px-4 py-6"
                  initial={false}
                >
                  {renderTabContent(tab.id)}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </>
      ) : (
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
