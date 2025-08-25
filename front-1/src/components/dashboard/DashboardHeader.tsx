import { useRealTime } from "@/hooks/useRealTime";

interface DashboardHeaderProps {
    title: string;
    isUpdating: boolean;
    lastUpdateTime: Date | null;
    onRefresh: () => void;
}

export default function DashboardHeader({
    title,
    isUpdating,
    lastUpdateTime,
    onRefresh,
}: DashboardHeaderProps) {
    const realTime = useRealTime();

    return (
        <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-2xl">{title}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                    <span>현재 시간:</span>
                    <span className="font-mono font-semibold">
                        {realTime.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                        })}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <span>다음 갱신:</span>
                    <span className="font-mono font-semibold text-blue-600">
                        {new Date(Date.now() + (60 - new Date().getMinutes()) * 60 * 1000 - new Date().getSeconds() * 1000).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </span>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isUpdating}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        isUpdating 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                >
                    {isUpdating ? '갱신 중...' : '수동 갱신'}
                </button>
                {lastUpdateTime && (
                    <div className="text-xs text-gray-500">
                        마지막 갱신: {lastUpdateTime.toLocaleTimeString('ko-KR')}
                    </div>
                )}
            </div>
        </div>
    );
}
