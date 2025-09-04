import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TargetSettingState {
  // 수소 생산량 목표 비율 (기본값: 1.0 = 100%)
  hydrogenTargetRate: number;
  
  // 목표 비율 설정
  setHydrogenTargetRate: (rate: number) => void;
  
  // 목표 비율 리셋
  resetHydrogenTargetRate: () => void;
}

export const useTargetSettingStore = create<TargetSettingState>()(
  persist(
    (set) => ({
      // 기본값: 예측치의 100%를 목표로 설정
      hydrogenTargetRate: 1.0,
      
      // 목표 비율 설정
      setHydrogenTargetRate: (rate: number) => {
        set({ hydrogenTargetRate: rate });
      },
      
      // 목표 비율 리셋
      resetHydrogenTargetRate: () => {
        set({ hydrogenTargetRate: 1.0 });
      },
    }),
    {
      name: 'target-setting-storage', // localStorage 키
      partialize: (state) => ({ 
        hydrogenTargetRate: state.hydrogenTargetRate 
      }), // 저장할 상태만 선택
    }
  )
);
