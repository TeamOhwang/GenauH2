import { StatItem } from '@/types/dashboard';

interface Stat {
    label: string;
    value: string;
    diff: string;
}

interface DashboardStatsProps {
    stats: Stat[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    // 효율 지표 계산 (예시 데이터)
    const efficiencyData = {
        daily: { efficiency: 78.1, target: 80, unit: "%" },
        weekly: { efficiency: 75.3, target: 78, unit: "%" },
        monthly: { efficiency: 72.8, target: 75, unit: "%" }
    };

    return (
        <div className="mb-6">
            {/* 기존 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.diff}</p>
                    </div>
                ))}
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
                                    strokeDasharray={`${(efficiencyData.daily.efficiency / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-white">
                                    {efficiencyData.daily.efficiency}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            목표: {efficiencyData.daily.target}%
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
                                    strokeDasharray={`${(efficiencyData.weekly.efficiency / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-white">
                                    {efficiencyData.weekly.efficiency}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            목표: {efficiencyData.weekly.target}%
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
                                    strokeDasharray={`${(efficiencyData.monthly.efficiency / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-800 dark:text-white">
                                    {efficiencyData.monthly.efficiency}%
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            목표: {efficiencyData.monthly.target}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}