interface Stat {
    label: string;
    value: string;
    diff: string;
    detail?: string;
    diffType?: 'positive' | 'negative' | 'neutral' | string; // 차이 타입 (양수/음수/중립)
}

interface EfficiencyData {
    daily: { 
        efficiency: number; 
        target: number; 
        unit: string;
        details?: {
            energyEfficiency: number;
            capacityUtilization: number;
        };
    };
    weekly: { 
        efficiency: number; 
        target: number; 
        unit: string;
        details?: {
            consistency: number;
            stability: number;
        };
    };
    monthly: { 
        efficiency: number; 
        target: number; 
        unit: string;
        details?: {
            growth: number;
            predictionAccuracy: number;
        };
    };
}

interface DashboardStatsProps {
    stats: Stat[];
    efficiencyData?: EfficiencyData;
}

export default function DashboardStats({ stats, efficiencyData }: DashboardStatsProps) {
    // 기본 효율 지표 데이터 (실제 데이터가 없을 때 사용)
    const defaultEfficiencyData = {
        daily: { 
            efficiency: 0, 
            target: 50, 
            unit: "%",
            details: {
                energyEfficiency: 0,
                capacityUtilization: 0
            }
        },
        weekly: { 
            efficiency: 0, 
            target: 300, 
            unit: "%",
            details: {
                consistency: 0,
                stability: 0
            }
        },
        monthly: { 
            efficiency: 0, 
            target: 1000, 
            unit: "%",
            details: {
                growth: 0,
                predictionAccuracy: 0
            }
        }
    };

    // 실제 데이터가 있으면 사용, 없으면 기본값 사용
    const currentEfficiencyData = efficiencyData || defaultEfficiencyData;

    return (
        <div className="mb-6">
            {/* 기존 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => {
                    // 차이 타입에 따른 색상 결정
                    const getDiffColor = () => {
                        switch (stat.diffType) {
                            case 'positive':
                                return 'text-green-600 dark:text-green-400'; // 목표 초과 (좋음)
                            case 'negative':
                                return 'text-red-600 dark:text-red-400'; // 목표 미달 (나쁨)
                            case 'neutral':
                            default:
                                return 'text-gray-500 dark:text-gray-400'; // 기본 색상
                        }
                    };

                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</p>
                            <p className={`text-xs font-medium ${getDiffColor()}`}>{stat.diff}</p>
                            {stat.detail && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.detail}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 효율 지표 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">효율 지표</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 일간 효율 */}
                    <div className="text-center">
                        <div className="mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">일간 평균 효율</span>
                        </div>
                        <div className="relative w-24 h-24 mx-auto mb-2">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                {/* 배경 원 */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                {/* 효율 원 */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#10b981"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(currentEfficiencyData.daily.efficiency / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-white">
                                    {currentEfficiencyData.daily.efficiency.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            목표: {(currentEfficiencyData.daily.target / 1000).toFixed(2)}t
                        </div>
                    </div>

                    {/* 주간 효율 */}
                    <div className="text-center">
                        <div className="mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">주간 평균 효율</span>
                        </div>
                        <div className="relative w-24 h-24 mx-auto mb-2">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#3b82f6"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(currentEfficiencyData.weekly.efficiency / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-white">
                                    {currentEfficiencyData.weekly.efficiency.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            목표: {(currentEfficiencyData.weekly.target / 1000).toFixed(2)}t
                        </div>
                    </div>

                    {/* 월간 효율 */}
                    <div className="text-center">
                        <div className="mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">월간 평균 효율</span>
                        </div>
                        <div className="relative w-24 h-24 mx-auto mb-2">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#f59e0b"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(currentEfficiencyData.monthly.efficiency / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-white">
                                    {currentEfficiencyData.monthly.efficiency.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            목표: {(currentEfficiencyData.monthly.target / 1000).toFixed(2)}t
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}