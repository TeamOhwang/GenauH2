// 타입 정의
export type TimeFrame = "daily" | "weekly" | "monthly";
export type Plant = "plant1" | "plant2" | "plant3";

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        pointRadius?: number;
        borderDash?: number[];
        fill?: boolean;
        type?: string;
    }>;
}



export interface SolaDataStructure {
    [timeFrame: string]: {
        [plant: string]: ChartData;
    };
}

export interface ChartOptions {
    responsive: boolean;
    scales: {
        y: {
            type: string;
            display: boolean;
            position: string;
            min: number;
            max: number;
            ticks: {
                stepSize: number;
                callback: (value: number) => string;
            };
            grid: {
                drawOnChartArea: boolean;
            };
        };
    };
    plugins: {
        legend: {
            position: "bottom";
        };
        tooltip: {
            mode: "index";
            intersect: false;
            callbacks?: {
                label: (context: any) => string | null;
            };
        };
    };
    interaction: {
        mode: "index";
        intersect: false;
    };
    elements?: {
        line: {
            spanGaps: boolean;
        };
    };
}

export function buildSolaData(
    plant1: any[],
    plant2: any[],
    plant3: any[],
    currentHour: number,
    weeklyPlant1?: any[],
    weeklyPlant2?: any[],
    weeklyPlant3?: any[],
    weeklyAggregatedData?: any[],
    dailyAggregated?: any[],
    monthlyAggregated?: any[]
): SolaDataStructure {
    return {
        daily: {
            plant1: buildDailyPlantChartData(plant1, currentHour, dailyAggregated || [], "시간별 태양광 발전량"),
            plant2: buildDailyPlantChartData(plant2, currentHour, dailyAggregated || [], "시간별 태양광 발전량"),
            plant3: buildDailyPlantChartData(plant3, currentHour, dailyAggregated || [], "시간별 태양광 발전량"),
        },
        weekly: {
            plant1: buildWeeklyPlantChartData(weeklyPlant1 || [], weeklyAggregatedData || [], "요일별 태양광 발전량"),
            plant2: buildWeeklyPlantChartData(weeklyPlant2 || [], weeklyAggregatedData || [], "요일별 태양광 발전량"),
            plant3: buildWeeklyPlantChartData(weeklyPlant3 || [], weeklyAggregatedData || [], "요일별 태양광 발전량"),
        },
        monthly: {
            plant1: buildMonthlyPlantChartData(plant1, monthlyAggregated || [], "일별 태양광 발전량"),
            plant2: buildMonthlyPlantChartData(plant2, monthlyAggregated || [], "일별 태양광 발전량"),
            plant3: buildMonthlyPlantChartData(plant3, monthlyAggregated || [], "일별 태양광 발전량"),
        },
    };
}

// 일간 차트 데이터 생성 (시간별) - 발전량만 표시
function buildDailyPlantChartData(plantData: any[], currentHour: number, dailyAggregated: any[], label: string): ChartData {
    // 시간별 데이터 생성 (0~24시)
    const timeLabels = Array.from({ length: 25 }, (_, i) => `${i}시`);
    
    // 실제 발전량 데이터 (현재 시간까지만) 현재 시간 이후는 null로 설정하여 표시하지 않음
    const generationData = timeLabels.map((_, index) => {
        if (index > currentHour) {
            return null; // 현재 시간 이후는 null로 설정하여 표시하지 않음
        }
        const hourData = plantData.find(item => item.hour === index);
        return hourData ? (hourData.generation_Kw - 300) : 0;
    });
    
    // 예측 발전량 데이터 (전체 24시간)
    const forecastData = timeLabels.map((_, index) => {
        const hourData = plantData.find(item => item.hour === index);
        return hourData ? (hourData.forecast_Kwh - 300) : 0;
    });
    
    return {
        labels: timeLabels,
        datasets: [
            {
                label: "유휴 전력 발생량 (kWh)",
                data: generationData,
                borderColor: "rgba(255, 193, 7, 1)",
                backgroundColor: "rgba(255, 193, 7, 0.2)",
                pointRadius: 3,
                fill: true,
                type: "line"
            },
            {
                label: "유휴 전력 발생 예측량 (kWh)",
                data: forecastData,
                borderColor: "rgba(255, 193, 7, 0.6)",
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                pointRadius: 0,
                borderDash: [5, 5],
                type: "line"
            },
        ],
    };
}

// 주간 차트 데이터 생성 (요일별) - 막대 차트 + 라인
function buildWeeklyPlantChartData(plantData: any[], aggregatedData: any[], label: string): ChartData {
    console.log('🔧 buildWeeklyPlantChartData 시작:', label);

    const currentDate = new Date();
    
    const dateLabels = Array.from({ length: 14 }, (_, i) => `${i}`);

    const generationData = dateLabels.map(date => {
        const dateObj = new Date(date);

        if (dateObj > currentDate) {
            return null; // 현재 날짜 이후는 null로 설정하여 표시하지 않음
        }
        const dayData = plantData.find(item => item.date === date);
        return dayData ? (dayData.generation_Kw - 300) : 0;
    });

    // 예측 발전량 데이터 (전체 14일)
    const forecastData = dateLabels.map(date => {
        const dayData = plantData.find(item => item.date === date);
        return dayData ? (dayData.forecast_Kwh - 300) : 0;
    });
    
    if (aggregatedData.length === 0) {
        console.log('⚠️ 주간 집계 데이터가 비어있어 빈 차트 반환');
        return {
            labels: [],
            datasets: [
                {
                    label: "총 발전량",
                    data: generationData,
                    borderColor: "rgba(153,102,255,1)",
                    backgroundColor: "rgba(153,102,255,0.2)",
                    pointRadius: 4,
                },
                {
                    label: "예측 발전량",
                    data: forecastData,
                    borderColor: "rgba(76, 175, 80, 1)",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    pointRadius: 0,
                    borderDash: [5, 5],
                }
            ],
        };
    }
    
    // 날짜별로 정렬된 집계 데이터 사용
    const sortedData = aggregatedData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 요일별 라벨 생성
    const labels = sortedData.map((item: any) => {
        if (!item.date) return '날짜 없음';
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return '날짜 오류';
        
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        
        return `${month}/${day} (${dayOfWeek})`;
    });
    
    // 평균 발전량 계산
    const totalValues = sortedData.map(item => item.total || 0);
    const averageValue = totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length;
    const averageLine = Array(sortedData.length).fill(averageValue);
    
    const result = {
        labels: labels,
        datasets: [
            {
                label: "발전소 1 (1.2MW)",
                data: sortedData.map((item: any) => item.plant1 || 0),
                borderColor: "rgba(255, 193, 7, 1)",
                backgroundColor: "rgba(255, 193, 7, 0.2)",
                pointRadius: 4,
                type: "bar"
            },
            {
                label: "발전소 2 (800kW)",
                data: sortedData.map((item: any) => item.plant2 || 0),
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                pointRadius: 4,
                type: "bar"
            },
            {
                label: "발전소 3 (500kW)",
                data: sortedData.map((item: any) => item.plant3 || 0),
                borderColor: "rgba(255, 206, 86, 1)",
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                pointRadius: 4,
                type: "bar"
            },
            {
                label: "총 발전량",
                data: sortedData.map((item: any) => item.total || 0),
                borderColor: "rgba(153,102,255,1)",
                backgroundColor: "rgba(153,102,255,0.2)",
                pointRadius: 4,
                type: "bar"
            },
            {
                label: "평균 발전량",
                data: averageLine,
                borderColor: "rgba(76, 175, 80, 1)",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                pointRadius: 0,
                borderDash: [5, 5],
                type: "line"
            }
        ],
    };
    
    console.log('  - 생성된 차트 데이터:', result);
    return result;
}

// 월간 차트 데이터 생성 (일별) - 라인 차트
function buildMonthlyPlantChartData(plantData: any[], monthlyAggregated: any[], label: string): ChartData {
    if (monthlyAggregated && monthlyAggregated.length > 0) {
        console.log('🔧 buildMonthlyPlantChartData (집계 데이터 사용):', monthlyAggregated.length, '건');
        
        const currentMonthData = monthlyAggregated.filter(item => {
            const itemDate = new Date(item.date);
            const now = new Date();
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        });
        
        const lastMonthData = monthlyAggregated.filter(item => {
            const itemDate = new Date(item.date);
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
        });
        
        const labels = monthlyAggregated.map(item => {
            const date = new Date(item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        return {
            labels: labels,
            datasets: [
                {
                    label: "이번 달 발전량",
                    data: monthlyAggregated.map(item => {
                        const itemDate = new Date(item.date);
                        const now = new Date();
                        return (itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()) ? item.total : 0;
                    }),
                    borderColor: "rgba(255, 193, 7, 1)",
                    backgroundColor: "rgba(255, 193, 7, 0.2)",
                    pointRadius: 3,
                    fill: true,
                },
                {
                    label: "저번 달 발전량",
                    data: monthlyAggregated.map(item => {
                        const itemDate = new Date(item.date);
                        const now = new Date();
                        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        return (itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear()) ? item.total : 0;
                    }),
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    pointRadius: 3,
                    fill: true,
                }
            ],
        };
    }
    
    // 기존 방식
    return {
        labels: plantData.map((item: any) => item.hour),
        datasets: [
            {
                label: label,
                data: plantData.map((item: any) => item.generation_Kw),
                borderColor: "rgba(255, 193, 7, 1)",
                backgroundColor: "rgba(255, 193, 7, 0.2)",
                pointRadius: 0,
            }
        ],
    };
}

export function buildChartOptions(): Record<Plant, ChartOptions> {
    return {
        plant1: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 1300,
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => `${value}kW`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
        plant2: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 800,
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => `${value}kW`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
        plant3: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 500,
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => `${value}kW`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        }
    };
}

// 주간 차트를 위한 별도 옵션 생성
export function buildWeeklyChartOptions(): Record<Plant, ChartOptions> {
    return {
        plant1: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 25000, // 하루 최대 발전량 (1.2MW * 24시간 = 28,800kWh, 여유있게 25,000)
                    ticks: {
                        stepSize: 2000,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
        plant2: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 20000, // 하루 최대 발전량 (800kW * 24시간 = 19,200kWh, 여유있게 20,000)
                    ticks: {
                        stepSize: 2000,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
        plant3: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 12000, // 하루 최대 발전량 (500kW * 24시간 = 12,000kWh, 여유있게 12,000)
                    ticks: {
                        stepSize: 1000,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        }
    };
}

// 월간 차트를 위한 별도 옵션 생성
export function buildMonthlyChartOptions(): Record<Plant, ChartOptions> {
    return {
        plant1: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 30000, // 하루 최대 발전량 (1.2MW * 24시간 = 28,800kWh, 여유있게 30,000)
                    ticks: {
                        stepSize: 3000,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
        plant2: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 25000, // 하루 최대 발전량 (800kW * 24시간 = 19,200kWh, 여유있게 25,000)
                    ticks: {
                        stepSize: 2500,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
        plant3: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 15000, // 하루 최대 발전량 (500kW * 24시간 = 12,000kWh, 여유있게 15,000)
                    ticks: {
                        stepSize: 1500,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
        }
    };
}

// 일별 차트를 위한 단일축 차트 옵션 생성
export function buildDailyChartOptions(): Record<Plant, ChartOptions> {
    return {
        plant1: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 1000, // 최대 발전량
                    ticks: {
                        stepSize: 100,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: function(context: any) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (value === null) return null;
                            return `${label}: ${value.toFixed(2)}kWh`;
                        }
                    }
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
            elements: {
                line: {
                    spanGaps: true, // null 값 사이의 간격을 연결
                }
            }
        },
        plant2: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 600, // 최대 발전량
                    ticks: {
                        stepSize: 50,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: function(context: any) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (value === null) return null;
                            return `${label}: ${value.toFixed(2)}kWh`;
                        }
                    }
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
            elements: {
                line: {
                    spanGaps: true, // null 값 사이의 간격을 연결
                }
            }
        },
        plant3: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 300, // 최대 발전량
                    ticks: {
                        stepSize: 10,
                        callback: (value: number) => `${value}kWh`,
                    },
                    grid: {
                        drawOnChartArea: true,
                    },
                },
            },
            plugins: {
                legend: {
                    position: "bottom",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: function(context: any) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (value === null) return null;
                            return `${label}: ${value.toFixed(2)}kWh`;
                        }
                    }
                },
            },
            interaction: {
                mode: "index",
                intersect: false,
            },
            elements: {
                line: {
                    spanGaps: true, // null 값 사이의 간격을 연결
                }
            }
        }
    };
}

export function buildH2Data(currentHour?: number) {
    // 24시간 데이터 생성
    const timeLabels = Array.from({ length: 25 }, (_, i) => `${i}시`);
    
    // 수소 생산량 데이터 (태양광 발전량과 연관된 패턴)
    const productionData = timeLabels.map((_, index) => {
        // 현재 시간 이후는 null로 설정
        if (currentHour && index > currentHour) {
            return null;
        }
        
        // 태양광 발전량이 높은 시간대(10-16시)에 수소 생산량도 높음
        if (index >= 10 && index <= 16) {
            return Math.floor(Math.random() * 50) + 100; // 100-150 kg
        } else if (index >= 7 && index <= 9 || index >= 17 && index <= 19) {
            return Math.floor(Math.random() * 30) + 50; // 50-80 kg
        } else {
            return Math.floor(Math.random() * 20) + 10; // 10-30 kg
        }
    });
    
    return {
        labels: timeLabels,
        datasets: [
            {
                label: "시간별 수소 생산량 (kg)",
                data: productionData,
                borderColor: "rgba(33, 150, 243, 1)",
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                pointRadius: 3,
                fill: true,
            },
        ],
    };
}

export function buildTimeFrameData() {
    return {
        daily: {
            title: "데일리 모니터링",
            stats: [
                { label: "예측 유휴 전력량 vs 실제 유휴 전력량", value: "40,689", diff: "목표 대비" },
                { label: "현재 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "수소 1kg당 전력 소비량", value: "78.1%", diff: "전일 대비" },
                { label: "현재 설비 가동률", value: "80%", diff: "전일 대비" },
            ],
            chart1Title: "시간대별 태양광 발전량",
            chart2Title: "시간대별 수소 생산량"
        },
        weekly: {
            title: "위클리 모니터링",
            stats: [
                { label: "총 유휴 전력 발생 시간", value: "40,689", diff: "목표 대비" },
                { label: "주간 총 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "전주 대비 증감률", value: "80%", diff: "전주 대비" },
                { label: "주간 평균 효율", value: "78.1%", diff: "전주 대비" },
            ],
            chart1Title: "요일별 태양광 발전량",
            chart2Title: "요일별 수소 생산량"
        },
        monthly: {
            title: "먼슬리 모니터링",
            stats: [
                { label: "월간 총 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "월 평균 수소 1kg당 전력 소비량", value: "78.1%", diff: "전월 대비" },
                { label: "전월 대비 생산 증감률", value: "40,689", diff: "전월 대비" },
                { label: "월 평균 효율", value: "80%", diff: "전월 대비" },
            ],
            chart1Title: "일별 태양광 발전량",
            chart2Title: "일별 수소 생산량"
        }
    };
}
