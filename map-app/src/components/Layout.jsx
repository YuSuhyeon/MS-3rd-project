import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from 'components/BrandLogo';

const navigationItems = [
  { title: '페르소나 분석', url: '/persona', icon: null },
  { title: '결과 대시보드', url: '/result', icon: null },
  { title: '일정 플래너', url: '/itinerary', icon: null },
  { title: '경로 편집', url: '/directions', icon: null },
  { title: 'AI 도슨트', url: '/docent', icon: null },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-sm border-r border-white/20 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200/50 p-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <BrandLogo size={40} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">AI 여행 플래너</h2>
              <p className="text-xs text-gray-500">맞춤형 여행 계획 서비스</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <div className="p-3 flex-1 overflow-auto">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">메뉴</div>
          <nav className="px-2">
            {navigationItems.map((item) => {
              const active = location.pathname === item.url || (item.url !== '/' && location.pathname.startsWith(item.url));
              return (
                <Link key={item.title} to={item.url} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 hover:bg-pink-50 hover:text-pink-700 ${active ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : ''}`}>
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200/50 p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">여행자</p>
              <p className="text-xs text-gray-500 truncate">AI와 함께 여행 계획</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 md:hidden">
          <div className="flex items-center gap-4">
            <button className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" aria-label="메뉴">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="#444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-semibold">AI 여행 플래너</h1>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

