import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Home, Route, Compass, Sparkles, Calendar } from "lucide-react";
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
    url: createPageUrl("CommunityMain"),
    icon: Compass,
  },
  {
    title: "Vision OCR",
    url: createPageUrl("VisionOCR"),
    icon: Compass,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <Sidebar className="border-r border-white/20 backdrop-blur-sm bg-white/80">
          <SidebarHeader className="border-b border-gray-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  AI 투어 플래너
                </h2>
                <p className="text-xs text-gray-500">맞춤형 여행 계획 서비스</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                메뉴
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-pink-50 hover:text-pink-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                            : ""
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  여행자
                </p>
                <p className="text-xs text-gray-500 truncate">
                  AI와 함께 여행 계획
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold">AI 투어 플래너</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
