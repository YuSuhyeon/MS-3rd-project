import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BrandLogo from "components/BrandLogo";
import { useAuth } from "context/AuthContext";
import { LogOut, LogIn } from "lucide-react";

const navigationItems = [
  { title: "페르소나 분석", url: "/persona", icon: null },
  { title: "결과 대시보드", url: "/result", icon: null },
  { title: "일정 플래너", url: "/itinerary", icon: null },
  { title: "경로 편집", url: "/directions", icon: null },
  { title: "AI 도슨트", url: "/docent", icon: null },
  { title: "커뮤니티", url: "/community", icon: null },
  { title: "VisionOcr", url: "/visionocr", icon: null, exact: true },
  { title: "AI 사진인식", url: "/vision", icon: null, exact: true },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { profile, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); // mobile 기본 닫힘

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/") // prefix 매칭은 하위 path만
    );
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      {/* 모바일: 슬라이드 인/아웃, 데스크톱: 고정 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-sm
                    border-r border-white/20 flex flex-col transform transition-transform duration-200
                    ${menuOpen ? "translate-x-0" : "-translate-x-full"}
                    md:static md:translate-x-0`}
      >
        {/* Header */}
        <div className="border-b border-gray-200/50 p-6">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-95 transition-opacity"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <BrandLogo size={40} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                AI 여행 플래너
              </h2>
              <p className="text-xs text-gray-500">맞춤형 여행 계획 서비스</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="p-3 flex-1 overflow-auto">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            메뉴
          </div>
          <nav className="px-2">
            {navigationItems.map((item) => {
              const active = isActive(item.url, item.exact);
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMenuOpen(false)} // 모바일에서 자동 닫힘
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1
                              hover:bg-pink-50 hover:text-pink-700
                              ${
                                active
                                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                                  : ""
                              }`}
                >
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/50 p-6 mt-auto">
          {profile ? (
            // 로그인 했을 때
            <div className="flex items-center gap-3">
              <img
                src={profile.picture}
                alt={profile.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.email}
                </p>
              </div>
              {/* 로그아웃 버튼  */}
              <button
                onClick={logout}
                title="로그아웃"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            // 로그인 안 했을 때
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-medium text-sm">?</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  여행자님, 환영합니다!
                </p>
                <p className="text-xs text-gray-500 truncate">
                  AI와 함께 여행 계획
                </p>
              </div>
              <button
                onClick={() => login()}
                title="로그인"
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
              >
                <LogIn size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
      {/* 모바일 오버레이 (열렸을 때만) */}
      {menuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="사이드바 닫기"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 md:hidden sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200"
              aria-label="메뉴"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="#444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">AI 여행 플래너</h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
