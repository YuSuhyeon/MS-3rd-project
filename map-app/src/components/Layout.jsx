import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "components/BrandLogo";
import { useAuth } from "context/AuthContext";
import { LogOut, LogIn, Bot, BarChart2, Compass, LayoutGrid, MessageSquare, ScanLine, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  { title: "페르소나 분석", url: "/persona", icon: <Bot size={18} /> },
  { title: "결과 대시보드", url: "/result", icon: <BarChart2 size={18} /> },
  { title: "경로 편집", url: "/directions", icon: <Compass size={18} /> },
  { title: "일정 플래너", url: "/itinerary", icon: <LayoutGrid size={18} /> },
  { title: "AI 도슨트", url: "/docent", icon: <MessageSquare size={18} /> },
  { title: "커뮤니티", url: "/community", icon: <MessageSquare size={18} /> },
  { title: "VisionOCR", url: "/visionocr", icon: <ScanLine size={18} /> },
];

const SidebarContent = () => {
  const location = useLocation();
  const { profile, login, logout } = useAuth();

  return (
    <>
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-slate-800">
            <BrandLogo size={32} />
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">TravelK</h2>
            <p className="text-xs text-slate-400">AI 여행 플래너</p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <div className="p-3 flex-1 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navigationItems.map((item) => {
            const active = location.pathname.startsWith(item.url);
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm border-l-2 ${
                  active
                    ? "bg-slate-800 text-white font-semibold border-indigo-400"
                    : "text-slate-400 border-transparent hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4 mt-auto">
        {profile ? (
          <div className="flex items-center gap-3">
            <img src={profile.picture} alt={profile.name} className="w-9 h-9 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{profile.name}</p>
              <p className="text-xs text-slate-400 truncate">{profile.email}</p>
            </div>
            <button onClick={logout} title="로그아웃" className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => login("google")} className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
            <LogIn size={18} className="text-slate-400" />
            <span className="font-semibold text-sm text-white">로그인</span>
          </button>
        )}
      </div>
    </>
  );
};

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900/50 backdrop-blur-lg border-r border-slate-800 flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-slate-900/50 backdrop-blur-lg border-b border-slate-800 px-4 py-3 md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
              aria-label="메뉴 열기"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2">
                <BrandLogo size={24} />
                <h1 className="text-md font-bold text-white">TravelK</h1>
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
