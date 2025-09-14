import React from 'react';
import { Button } from 'components/ui/button';
import { Info, MapPin, Navigation, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function POIDetails({ poi, userLocation, onPlayTTS, isDocentActive }) {
  // 1. 장소가 선택되지 않았을 때의 화면을 시각적으로 개선
  if (!poi) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
        <Info size={32} className="mb-4 text-slate-600" />
        <h3 className="font-semibold text-slate-300">장소를 선택하세요</h3>
        <p className="text-sm mt-1">목록에서 장소를 선택하면 AI 도슨트가 상세 정보를 알려드립니다.</p>
      </div>
    );
  }

  // 2. 카카오맵 길찾기 URL 생성 함수
  const openKakaoDirections = () => {
    // 사용자 위치가 없으면 길찾기 비활성화 (버튼 자체를 disabled 처리)
    if (!userLocation || !poi.location) return;
    const sName = '내 위치';
    const eName = poi.name || '도착지';
    // 카카오맵 URL은 도착지의 좌표도 함께 넘겨주는 것이 더 정확합니다.
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(eName)},${poi.location.lat},${poi.location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    // 3. 레이아웃을 flex-col로 구성하여 헤더, 콘텐츠(스크롤), 푸터(버튼)로 분리
    <div className="h-full flex flex-col overflow-hidden">
      {/* 헤더: 장소 이름과 주소 */}
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <motion.h2 
          key={poi.id} // POI가 바뀔 때마다 애니메이션 효과 적용
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-white"
        >
          {poi.name}
        </motion.h2>
        {poi.address && (
          <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin size={12} />
            {poi.address}
          </p>
        )}
      </div>

      {/* 콘텐츠: 스크롤 가능한 설명 영역 */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        <motion.p 
          key={`${poi.id}-desc`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed"
        >
          {poi.description || "상세 정보가 없습니다."}
        </motion.p>
      </div>

      {/* 푸터: 액션 버튼 영역 */}
      <div className="p-4 border-t border-slate-800 mt-auto flex-shrink-0">
        <div className="flex gap-2">
          {isDocentActive && (
            <Button onClick={() => onPlayTTS?.(poi)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20">
              <Volume2 className="w-4 h-4 mr-2" />
              음성 안내
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={openKakaoDirections} 
            disabled={!userLocation}
            className="flex-1 bg-slate-700/50 border-slate-600 hover:bg-slate-700 disabled:opacity-50"
          >
            <Navigation className="w-4 h-4 mr-2" />
            길찾기
          </Button>
        </div>
      </div>
    </div>
  );
}/*  */