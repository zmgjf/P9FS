// components/AppNavigation.tsx

"use client";

import React from "react";
import type { AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home, Users, Settings, BarChart3, History } from "lucide-react";

interface Props {
  currentPhase: AppPhase;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
}

const phaseConfig: Record<AppPhase, {
  title: string;
  subtitle?: string;
  backPhase?: AppPhase;
  showBackButton: boolean;
}> = {
  matchManagement: {
    title: "풋살 매니저",
    subtitle: "경기를 생성하고 관리하세요",
    showBackButton: false,
  },
  teamManagement: {
    title: "팀 관리",
    subtitle: "팀과 선수를 추가하고 관리하세요",
    backPhase: "matchManagement",
    showBackButton: true,
  },
  setSetup: {
    title: "세트 설정",
    subtitle: "경기 세트를 구성하고 팀을 배정하세요",
    backPhase: "teamManagement",
    showBackButton: true,
  },
  formationSetup: {
    title: "포메이션 설정",
    subtitle: "선수 배치와 전술을 설정하세요",
    backPhase: "setSetup",
    showBackButton: true,
  },
  gameReady: {
    title: "경기 준비",
    subtitle: "경기 시작 준비가 완료되었습니다",
    backPhase: "formationSetup",
    showBackButton: true,
  },
  playing: {
    title: "경기 진행",
    subtitle: "실시간 경기 중",
    backPhase: "formationSetup",
    showBackButton: true,
  },
  paused: {
    title: "경기 일시정지",
    subtitle: "경기가 일시정지 상태입니다",
    backPhase: "playing",
    showBackButton: false,
  },
  finished: {
    title: "경기 종료",
    subtitle: "경기가 완료되었습니다",
    backPhase: "matchHistory",
    showBackButton: true,
  },
  matchHistory: {
    title: "경기 기록",
    subtitle: "경기별, 세트별 상세 기록을 확인하세요",
    backPhase: "matchManagement",
    showBackButton: true,
  },
  statistics: {
    title: "경기 통계",
    subtitle: "전체 경기의 상세 통계를 확인하세요",
    backPhase: "matchManagement",
    showBackButton: true,
  },
  tournament: {
    title: "토너먼트",
    subtitle: "토너먼트를 관리하세요",
    backPhase: "matchManagement",
    showBackButton: true,
  },
  playerProfile: {
    title: "선수 프로필",
    subtitle: "선수별 상세 정보",
    backPhase: "statistics",
    showBackButton: true,
  },
  settings: {
    title: "설정",
    subtitle: "앱 설정을 관리하세요",
    backPhase: "matchManagement",
    showBackButton: true,
  },
};

export default function AppNavigation({ 
  currentPhase, 
  setAppPhase, 
  onBack, 
  title, 
  subtitle 
}: Props) {
  const config = phaseConfig[currentPhase];
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (config.backPhase) {
      setAppPhase(config.backPhase);
    }
  };

  const getPhaseIcon = (phase: AppPhase) => {
    switch (phase) {
      case 'matchManagement': return <Home className="w-4 h-4" />;
      case 'teamManagement': return <Users className="w-4 h-4" />;
      case 'statistics': return <BarChart3 className="w-4 h-4" />;
      case 'matchHistory': return <History className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 뒤로가기 버튼과 제목 */}
          <div className="flex items-center gap-4">
            {config.showBackButton && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {getPhaseIcon(currentPhase)}
                {displayTitle}
              </h1>
              {displaySubtitle && (
                <p className="text-sm text-slate-300 mt-1">{displaySubtitle}</p>
              )}
            </div>
          </div>

          {/* 오른쪽: 빠른 네비게이션 버튼들 */}
          <div className="flex items-center gap-2">
            {currentPhase !== 'matchManagement' && (
              <Button
                onClick={() => setAppPhase('matchManagement')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700"
              >
                <Home className="w-4 h-4 mr-1" />
                홈
              </Button>
            )}
            
            {currentPhase !== 'statistics' && (
              <Button
                onClick={() => setAppPhase('statistics')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                통계
              </Button>
            )}
            
            {currentPhase !== 'matchHistory' && (
              <Button
                onClick={() => setAppPhase('matchHistory')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700"
              >
                <History className="w-4 h-4 mr-1" />
                기록
              </Button>
            )}
          </div>
        </div>

        {/* 진행상황 표시 (특정 단계에서만) */}
        {['teamManagement', 'setSetup', 'formationSetup', 'playing'].includes(currentPhase) && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-1 ${
                ['teamManagement', 'setSetup', 'formationSetup', 'playing'].includes(currentPhase) 
                  ? 'text-green-400' : 'text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-current rounded-full"></div>
                팀 관리
              </div>
              <div className="w-6 h-px bg-slate-600"></div>
              <div className={`flex items-center gap-1 ${
                ['setSetup', 'formationSetup', 'playing'].includes(currentPhase) 
                  ? 'text-green-400' : 'text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-current rounded-full"></div>
                세트 설정
              </div>
              <div className="w-6 h-px bg-slate-600"></div>
              <div className={`flex items-center gap-1 ${
                ['formationSetup', 'playing'].includes(currentPhase) 
                  ? 'text-green-400' : 'text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-current rounded-full"></div>
                포메이션
              </div>
              <div className="w-6 h-px bg-slate-600"></div>
              <div className={`flex items-center gap-1 ${
                currentPhase === 'playing' 
                  ? 'text-green-400' : 'text-slate-500'
              }`}>
                <div className="w-2 h-2 bg-current rounded-full"></div>
                경기 진행
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}