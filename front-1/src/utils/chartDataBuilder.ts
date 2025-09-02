// 타입 정의
export type TimeFrame = "daily" | "weekly" | "monthly";
export type Plant = "plant1" | "plant2" | "plant3";

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: (number | null)[];
        borderColor: string | string[];
        backgroundColor: string | string[];
        pointRadius?: number;
        borderDash?: number[];
        fill?: boolean;
        type?: string;
        barPercentage?: number;
        categoryPercentage?: number;
        borderWidth?: number | number[];
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
            labels?: {
                usePointStyle?: boolean;
                padding?: number;
                font?: {
                    size?: number;
                };
            };
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
    weeklyData: any[],
    monthlyData: any[],
): SolaDataStructure {
    return {
        daily: {
            plant1: buildDailyPlantChartData(plant1, currentHour),
            plant2: buildDailyPlantChartData(plant2, currentHour),
            plant3: buildDailyPlantChartData(plant3, currentHour),
        },
        weekly: {
            plant1: buildWeeklyPlantChartData(weeklyData),  
            plant2: buildWeeklyPlantChartData(weeklyData),  
            plant3: buildWeeklyPlantChartData(weeklyData),  
        },
        monthly: {
            plant1: buildMonthlyPlantChartData(monthlyData),
            plant2: buildMonthlyPlantChartData(monthlyData),
            plant3: buildMonthlyPlantChartData(monthlyData),
        },
    };
}

// 일간 차트 데이터 생성 (시간별) - 발전량만 표시
function buildDailyPlantChartData(plantData: any[], currentHour: number): ChartData {
    // 입력 데이터 검증
    if (!plantData || !Array.isArray(plantData)) {
        return {
            labels: [],
            datasets: [],
        }
    }

    // currentHour 검증
    if (currentHour < 0 || currentHour > 24) {
        currentHour = Math.min(Math.max(currentHour, 0), 24);
    }
    
    
    // 시간별 데이터 생성 (0~24시)
    const timeLabels = Array.from({ length: 25 }, (_, i) => `${i}시`);
    
    // 실제 발전량 데이터 (현재 시간까지만)
    const generationData = timeLabels.map((_, index) => {
        if (index > currentHour) {
            return null; // 현재 시간 이후는 null로 설정하여 표시하지 않음
        }
        const hourData = plantData.find(item => item && item.hour === index);
        if (!hourData || typeof hourData.generation_Kw !== 'number') {
            return 0;
        }
        return hourData.generation_Kw - 300 });
    
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
                borderColor: "rgba(255, 193, 7, 1)", // 노란색 (실측값)
                backgroundColor: "rgba(255, 193, 7, 0.2)",
                pointRadius: 3,
                fill: true,
                type: "line"
            },
            {
                label: "유휴 전력 발생 예측량 (kWh)",
                data: forecastData,
                borderColor: "rgba(76, 175, 80, 1)", // 초록색 (예측값)
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                pointRadius: 0,
                borderDash: [5, 5],
                type: "line"
            },
        ],
    };
}

// 주간 차트 데이터 생성 (요일별) - 막대 차트 + 라인
function buildWeeklyPlantChartData(plantData: any[]): ChartData {

    const currentDate = new Date();

    // 현재 주의 월요일 계산
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일이면 6일 전, 아니면 (요일-1)일 전
    const currentWeekMonday = new Date(currentDate);
    currentWeekMonday.setDate(currentDate.getDate() - daysToMonday);

    // 현재 주 월요일 이전 데이터만 필터링
    const filteredData = plantData.filter((item: any) => {
        if (!item.date) return false;
        const dateObj = new Date(item.date);
        return dateObj < currentWeekMonday; // 현재 주 월요일 이전 데이터만
    });

    // 요일별 라벨 생성
    const labels = filteredData.map((item: any) => {
        const date = new Date(item.date);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        
        return `${month}/${day} (${dayOfWeek})`;
    });
    

    // 발전량 데이터 (백엔드에서 genKwhTotal로 제공)
    const generationData = filteredData.map((item) => {
        return item ? (item.genKwhTotal - 300 || 0) : 0;
    });

    // 예측 발전량 데이터 (백엔드에서 predKwhTotal로 제공)
    const forecastData = filteredData.map((item) => {
        return item ? (item.predKwhTotal - 300 || 0) : 0;
    });
    
    const result = {
        labels: labels,
        datasets: [
            {
                label: "유휴 전력 발생량 (kWh)",
                data: generationData,
                borderColor: "rgba(255, 193, 7, 1)", // 노란색 (실측값)
                backgroundColor: "rgba(255, 193, 7, 0.6)",
                pointRadius: 4,
                type: "bar",
                barPercentage: 0.8,      // 바의 너비 (0.8 = 80%)
                categoryPercentage: 0.9  // 카테고리 간격 (0.9 = 90%)
            },
            {
                label: "유휴 전력 발생 예측량 (kWh)",
                data: forecastData,
                borderColor: "rgba(76, 175, 80, 1)", // 초록색 (예측값)
                backgroundColor: "rgba(76, 175, 80, 0.3)",
                pointRadius: 3,
                borderDash: [1 , 1],
                type: "line"
            }
        ],
    };
    

    return result as ChartData;
}

// 월간 차트 데이터 생성 (주별) - 바 차트
function buildMonthlyPlantChartData(plantData: any[]): ChartData {

    
    if (plantData.length === 0) {

        return {
            labels: [],
            datasets: []
        };
    }

    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate);
    // 월요일을 주의 시작으로 계산 (일요일은 0이므로 6을 빼서 월요일로 조정)
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일이면 6일 전, 아니면 (요일-1)일 전
    currentWeekStart.setDate(currentDate.getDate() - daysToMonday); // 이번 주 월요일

    // 주차별로 데이터 그룹화
    const weeklyGroups: { [weekKey: string]: any[] } = {};
    
    plantData.forEach((item: any) => {
        if (!item.date) return;
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;
        
        // 주차 계산 (월의 몇 번째 주인지) - 월요일을 주의 시작으로 계산
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDayWeekday = firstDayOfMonth.getDay();
        // 일요일(0)을 7로 변환하여 월요일(1)을 주의 시작으로 계산
        const adjustedFirstDayWeekday = firstDayWeekday === 0 ? 7 : firstDayWeekday;
        const weekNumber = Math.ceil((date.getDate() + adjustedFirstDayWeekday - 1) / 7);
        
        // 연도-월-주차 순으로 정렬되도록 키 생성 (예: "2024-08-04")
        const weekKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(weekNumber).padStart(2, '0')}`;
        
        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = [];
        }
        weeklyGroups[weekKey].push(item);
    });

    // 주차별로 정렬하고 라벨과 데이터 생성
    const sortedWeeks = Object.keys(weeklyGroups).sort();
    const labels: string[] = [];
    const generationData: (number | null)[] = [];
    const forecastData: number[] = [];


    
    sortedWeeks.forEach(weekKey => {
        const [year, month, weekNum] = weekKey.split('-');
        const weekData = weeklyGroups[weekKey];
        
        // 해당 주의 데이터가 현재 주 이후인지 확인 (현재 주 포함하여 제외)
        const isCurrentOrFutureWeek = weekData.some((item: any) => {
            const itemDate = new Date(item.date);
            return itemDate >= currentWeekStart;
        });
        
        // 현재 주 이후 데이터는 제외
        if (isCurrentOrFutureWeek) {
            return;
        }
        
        // 주차 라벨 생성 (예: "8월 1주차", "8월 2주차")
            labels.push(`${month}월 ${weekNum}주차`);
        
            // 과거 주는 실제값과 예측값 모두 표시
            const weekGenerationTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.genKwhTotal || 0);
            }, 0);
            const weekForecastTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.predKwhTotal || 0);
            }, 0);
            generationData.push(weekGenerationTotal - (300 * weekData.length)); // 유휴 전력량 계산
            forecastData.push(weekForecastTotal - (300 * weekData.length)); // 예측 유휴 전력량 계산
    });



    return {
        labels: labels,
        datasets: [
            {
                label: "주차별 유휴 전력 발생량 (kWh)",
                data: generationData,  // 모든 주차의 실제값을 하나의 데이터셋으로 통합
                borderColor: "rgba(255, 193, 7, 1)",        // 통일된 노란색
                backgroundColor: "rgba(255, 193, 7, 0.6)",   // 통일된 노란색
                pointRadius: 0,
                fill: false,
                type: "bar",
                barPercentage: 0.8,      // 바의 너비 (0.8 = 80%)
                categoryPercentage: 0.9, // 카테고리 간격 (0.9 = 90%)
                borderWidth: 1           // 통일된 테두리
            },
            {
                label: "주차별 유휴 전력 발생 예측량 (kWh)",
                data: forecastData,  // 모든 주차의 예측값을 하나의 데이터셋으로 통합
                borderColor: "rgba(76, 175, 80, 0.8)",      // 통일된 초록색
                backgroundColor: "rgba(76, 175, 80, 0.3)",   // 통일된 초록색
                pointRadius: 0,
                borderDash: [0, 0], // 바 차트에서는 점선 효과 제거
                fill: false,
                type: "bar",
                barPercentage: 0.8,
                categoryPercentage: 0.9,
                borderWidth: 1       // 통일된 테두리
            }
        ],
    };
}

// 주간 차트를 위한 별도 옵션 생성
export function buildWeeklyChartOptions(): Record<string, ChartOptions> {
    return {
        plant1: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 10000,
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
        },
        plant2: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 7000, 
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
        },
        plant3: {
            responsive: true,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: 4000, 
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
                    max: 150000, // 주차별 최대 발전량 (1.2MW * 24시간 * 7일 = 201,600kWh, 여유있게 150,000)
                    ticks: {
                        stepSize: 15000,
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
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: function(context: any) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (value === null || value === undefined || value < 0) return `${label}: 0.00kWh`;
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
                    max: 100000, // 주차별 최대 발전량 (800kW * 24시간 * 7일 = 134,400kWh, 여유있게 100,000)
                    ticks: {
                        stepSize: 10000,
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
                            if (value === null || value === undefined || value < 0) return `${label}: 0.00kWh`;
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
                    max: 60000, // 주차별 최대 발전량 (500kW * 24시간 * 7일 = 84,000kWh, 여유있게 60,000)
                    ticks: {
                        stepSize: 6000,
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
                            if (value === null || value === undefined || value < 0) return `${label}: 0.00kWh`;
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
                            if (value === null || value === undefined || value < 0) return `${label}: 0.00kWh`;
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
                            if (value === null || value === undefined || value < 0) return `${label}: 0.00kWh`;
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
                            if (value === null || value === undefined || value < 0) return `${label}: 0.00kWh`;
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

export function buildH2Data(currentHour?: number, hourlyHydrogenProduction?: any[]) {
    
    
    // 24시간 데이터 생성
    const timeLabels = Array.from({ length: 25 }, (_, i) => `${i}시`);
    
    // 수소 생산량 데이터 (실제 데이터 또는 기본값)
    const productionData = timeLabels.map((_, index) => {
        // 현재 시간 이후는 null로 설정
        if (currentHour && index > currentHour) {
            return null;
        }

        // 실제 데이터에서 해당 시간의 수소 생산량 찾기
        const h2Data = hourlyHydrogenProduction?.find(item => {
            if (!item) return false;
            
            // 다양한 필드명으로 시도 (백엔드 응답에 따라 조정)
            const hour = item.hour ?? item.hour_of_day ?? item.timestamp;
            return hour === index;
        });
        
        if (h2Data) {
            const production = h2Data.productionKg ?? 0;

            return production;
        }
        
        // 데이터가 없으면 0으로 설정
        return 0;
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

// 주간 탭용 요일별 수소 생산량 데이터 생성 (range API 데이터 사용)
export function buildWeeklyH2DataFromRange(rangeData: any[]): ChartData {
    if (rangeData.length === 0) {
        return {
            labels: [],
            datasets: []
        };
    }

    // 날짜별로 그룹화 (시간별 데이터를 일별로 합산)
    const dailyGroups: { [date: string]: any[] } = {};
    
    rangeData.forEach((item) => {
        // ts에서 날짜 부분만 추출 (YYYY-MM-DD)
        const dateStr = item.ts.split('T')[0];
        
        if (!dailyGroups[dateStr]) {
            dailyGroups[dateStr] = [];
        }
        dailyGroups[dateStr].push(item);
    });



    // 날짜별로 수소 생산량 합산
    const dailyTotals: { [date: string]: { production: number } } = {};
    
    Object.entries(dailyGroups).forEach(([dateStr, dayData]) => {
        const totalProduction = dayData.reduce((sum, item) => sum + (item.productionKg || 0), 0);
        
        dailyTotals[dateStr] = { 
            production: totalProduction
        };
    });



    // 날짜별로 정렬
    const sortedDates = Object.keys(dailyTotals).sort();

    
    const labels: string[] = [];
    const hydrogenProductionData: (number | null)[] = [];
    
    const currentDate = new Date();
    
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        
        // 오늘 데이터는 제외 (아직 집계가 완료되지 않음)
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        if (isToday) {

            return; // 오늘 데이터는 건너뛰기
        }
        
        labels.push(`${month}/${day} (${dayOfWeek})`);
        
        const dayData = dailyTotals[dateStr];
        
        // 현재 날짜 이후는 null로 설정
        if (date > currentDate) {
            hydrogenProductionData.push(null);
        } else {
            hydrogenProductionData.push(Math.round(dayData.production * 10) / 10);
        }
    });
    
    const result = {
        labels: labels,
        datasets: [
            {
                label: "실제 수소 생산량 (kg)",
                data: hydrogenProductionData,
                borderColor: "rgba(33, 150, 243, 1)",
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                pointRadius: 4,
                fill: true,
                type: "line"
            }
        ]
    };
    

    
    return result;
}

// 월간 탭용 주차별 수소 생산량 데이터 생성
export function buildMonthlyH2Data(hydrogenData: any[]): ChartData {
    if (hydrogenData.length === 0) {
        return {
            labels: [],
            datasets: []
        };
    };

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayWeekday = firstDay.getDay();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const filteredMonth = hydrogenData.filter((item) => item.month < month && item.year <= year && item.month >= (month-2));

    const dayOfMonth = now.getDate();
    const adjustedDate = dayOfMonth + firstDayWeekday;
    const weekNumber = Math.ceil(adjustedDate / 7);

    const filteredWeek = hydrogenData.filter((item) => item.weekNumber < weekNumber && item.month === month && item.year === year);
    
    const filteredData = [...filteredMonth, ...filteredWeek];

    const labels: string[] = [];
    const productionData: (number | null)[] = [];

    filteredData.forEach((item) => {
        labels.push(item.weekLabel)
        productionData.push(item.totalProductionKg)
    })

    return {
        labels: labels,
        datasets: [
            {
                label: "주차별 수소 생산량 (kg)",
                data: productionData,
                borderColor: "rgba(33, 150, 243, 1)",
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                pointRadius: 4,
                fill: false,
                type: "line"
            },
        ],
    };
}

export function buildTimeFrameData(
    plant1?: any[], 
    plant2?: any[], 
    plant3?: any[], 
    currentHour?: number, 
    hourlyHydrogenProduction?: any[],
    targetRate?: number, // 목표 비율 (기본값: 1.0 = 100%)
    previousDayData?: any[][], // 전일 데이터 (전일 대비 비교용)
    facilities?: any[], // 설비 정보 (h2Rate 포함)
    weeklyHydrogenData?: any[], // 주간 수소 생산 데이터
    weeklyHydrogenPredictData?: any[], // 주간 수소 생산 예측 데이터
    monthlyHydrogenData?: any[], // 월간 수소 생산 데이터
    monthlyHydrogenPredictData?: any[] // 월간 수소 생산 예측 데이터
) {
    console.log("🔍 buildTimeFrameData 호출됨 - weeklyHydrogenData:", weeklyHydrogenData);
    console.log("🔍 buildTimeFrameData 호출됨 - weeklyHydrogenPredictData:", weeklyHydrogenPredictData);
    console.log("🔍 buildTimeFrameData 호출됨 - monthlyHydrogenData:", monthlyHydrogenData);
    console.log("🔍 buildTimeFrameData 호출됨 - monthlyHydrogenPredictData:", monthlyHydrogenPredictData);

    const dailyErrorRate = calDailyErrorRate(
        [plant1 ?? [], plant2 ?? [], plant3 ?? []],
        currentHour ?? 0
    )

    // 전일 데이터를 올바른 형식으로 변환 (plant1, plant2, plant3 배열로)
    const getPreviousDayPlantData = () => {
        if (!previousDayData || !Array.isArray(previousDayData)) return null;
        
        // 전일 데이터를 발전소별로 그룹화
        const plant1Data = previousDayData.filter((item: any) => item.plantId === 'plt001');
        const plant2Data = previousDayData.filter((item: any) => item.plantId === 'plt002');
        const plant3Data = previousDayData.filter((item: any) => item.plantId === 'plt003');
        
        return [plant1Data, plant2Data, plant3Data];
    };

    const previousDayPlantData = getPreviousDayPlantData();
    
    // 전일 오차율 계산 (전일 데이터가 있는 경우)
    const previousDayErrorRate = previousDayPlantData ? calDailyErrorRate(previousDayPlantData, 23) : null;
    
    // 전일 대비 오차율 변화 계산
    const getErrorRateDiff = () => {
        if (previousDayErrorRate) {
            // 전일 데이터가 있으면 전일 대비 변화 표시
            const diff = dailyErrorRate - previousDayErrorRate;
            const absDiff = Math.abs(diff);
            
            if (diff > 0) {
                return `+${absDiff.toFixed(1)}%`; // 오차율 증가 (나쁨)
            } else if (diff < 0) {
                return `-${absDiff.toFixed(1)}%`; // 오차율 감소 (좋음)
            } else {
                return "0%"; // 변화 없음
            }
        } else {
            // 전일 데이터가 없으면 목표 대비 상태 표시
            const targetErrorRate = 5.0; // 목표 오차율 5%
            const diff = dailyErrorRate - targetErrorRate;
            const absDiff = Math.abs(diff);
            
            if (diff > 0) {
                return `목표 +${absDiff.toFixed(1)}%`; // 목표보다 높음
            } else if (diff < 0) {
                return `목표 -${absDiff.toFixed(1)}%`; // 목표보다 낮음
            } else {
                return "목표 달성"; // 목표와 동일
            }
        }
    };

    // 전일 대비 오차율 변화 타입 결정
    const getErrorRateDiffType = () => {
        if (previousDayErrorRate) {
            // 전일 데이터가 있으면 전일 대비 변화에 따른 색상
            const diff = dailyErrorRate - previousDayErrorRate;
            if (diff < 0) return 'positive'; // 오차율 감소 (좋음)
            if (diff > 0) return 'negative'; // 오차율 증가 (나쁨)
            return 'neutral'; // 변화 없음
        } else {
            // 전일 데이터가 없으면 목표 대비 상태에 따른 색상
            const targetErrorRate = 5.0; // 목표 오차율 5%
            if (dailyErrorRate <= targetErrorRate) return 'positive'; // 목표 이하 (좋음)
            if (dailyErrorRate <= targetErrorRate * 2) return 'neutral'; // 목표의 2배 이하 (보통)
            return 'negative'; // 목표의 2배 초과 (나쁨)
        }
    };

    // 수소 생산량 달성률 계산
    const hydrogenAchievement = calHydrogenAchievementRate(
        [plant1 ?? [], plant2 ?? [], plant3 ?? []],
        currentHour ?? 0,
        targetRate ?? 1.0 // 기본값: 예측치의 100%를 목표로 설정
    );

    // 설비 가동률 계산 (수소 생산 설비 기준)
    const equipmentUtilization = calEquipmentUtilization(
        hourlyHydrogenProduction ?? [],
        currentHour ?? 0,
        facilities ?? []
    );

    // 수소 생산량 계산
    const hydrogenProduction = calTotalHydrogenProduction(
        hourlyHydrogenProduction ?? [],
        currentHour ?? 0
    );

    // 수소 생산량 포맷팅
    const formatHydrogenProduction = () => {
        const { totalProductionKg, averageHourlyProduction, productionHours } = hydrogenProduction;
        
        // 생산량에 따른 상태 결정
        const getDiffType = () => {
            if (totalProductionKg >= 50) return 'positive'; // 50kg 이상 (우수)
            if (totalProductionKg >= 20) return 'neutral'; // 20kg 이상 (보통)
            return 'negative'; // 20kg 미만 (개선 필요)
        };

        return {
            value: `${totalProductionKg}kg`,
            diff: `가동시간: ${productionHours}시간`,
            detail: `평균 시간당: ${averageHourlyProduction}kg`,
            diffType: getDiffType()
        };
    };

    // 수소 생산 달성률 포맷팅
    const formatHydrogenAchievement = () => {
        const { achievementRate, actualProductionKg, targetProductionKg, differenceKg } = hydrogenAchievement;
        
        // 차이 타입 결정 (목표 대비 차이)
        const getDiffType = () => {
            if (differenceKg > 0) return 'positive'; // 목표 초과 (좋음)
            if (differenceKg < 0) return 'negative'; // 목표 미달 (나쁨)
            return 'neutral'; // 목표 달성
        };
        
        return {
            value: `${achievementRate}%`,
            diff: differenceKg >= 0 ? `+${differenceKg}kg` : `${differenceKg}kg`,
            detail: `실제: ${actualProductionKg}kg / 목표: ${targetProductionKg}kg`,
            diffType: getDiffType()
        };
    };

    // 설비 가동률 포맷팅 (수소 생산 설비 기준)
    const formatEquipmentUtilization = () => {
        const { overallUtilization, totalProductionKg, maxCapacityKg, averageHourlyProduction } = equipmentUtilization;
        
        // 가동률에 따른 diffType 결정
        const getDiffType = () => {
            if (overallUtilization >= 80) return 'positive'; // 80% 이상 (우수)
            if (overallUtilization >= 60) return 'neutral'; // 60% 이상 (보통)
            return 'negative'; // 60% 미만 (개선 필요)
        };

        return {
            value: `${overallUtilization}%`,
            diff: `${totalProductionKg}/${maxCapacityKg}kg`,
            detail: `평균 시간당: ${averageHourlyProduction}kg`,
            diffType: getDiffType()
        };
    };

    const hydrogenStats = formatHydrogenAchievement();
    const equipmentStats = formatEquipmentUtilization();
    const productionStats = formatHydrogenProduction();

    // 월간 KPI 계산 함수
    const calculateMonthlyKPIs = (monthlyHydrogenData?: any[], monthlyHydrogenPredictData?: any[]) => {
        console.log("🔍 calculateMonthlyKPIs 호출됨 - monthlyHydrogenData:", monthlyHydrogenData);
        console.log("🔍 calculateMonthlyKPIs 호출됨 - monthlyHydrogenPredictData:", monthlyHydrogenPredictData);
        
        if (!monthlyHydrogenData || monthlyHydrogenData.length === 0) {
            console.log("❌ 월간 수소 데이터가 없음");
            return {
                totalProduction: { value: "0kg", diff: "데이터 없음", diffType: "neutral" },
                achievementRate: { value: "0%", diff: "데이터 없음", diffType: "neutral" },
                monthlyGrowth: { value: "0%", diff: "데이터 없음", diffType: "neutral" },
                monthlyEfficiency: { value: "0%", diff: "데이터 없음", diffType: "neutral" }
            };
        }

        // 월간 총 수소 생산량 계산
        const totalProductionKg = monthlyHydrogenData.reduce((sum: number, item: any) => {
            return sum + (item.totalProductionKg || 0);
        }, 0);
        console.log("📊 월간 총 수소 생산량:", totalProductionKg, "kg");

        // 월간 목표 달성률 계산 (예측값 기반)
        let monthlyTarget = 1000; // 기본값 (kg)
        
        if (monthlyHydrogenPredictData && monthlyHydrogenPredictData.length > 0) {
            console.log("🔍 월간 예측 데이터 처리 시작 - 데이터 개수:", monthlyHydrogenPredictData.length);
            
            // 현재 월에 해당하는 예측 데이터 찾기
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            const currentMonthPrediction = monthlyHydrogenPredictData.find((item: any) => 
                item.year === currentYear && item.month === currentMonth
            );
            
            if (currentMonthPrediction) {
                monthlyTarget = currentMonthPrediction.totalPredictedKg || 0;
                console.log("🎯 이번 달 예측값 사용:", monthlyTarget, "kg");
            } else {
                console.log("🎯 이번 달 예측 데이터 없음, 기본 목표 사용:", monthlyTarget, "kg");
            }
        } else {
            console.log("🎯 월간 예측 데이터 없음, 기본 목표 사용:", monthlyTarget, "kg");
        }
        
        const achievementRate = totalProductionKg > 0 ? (totalProductionKg / monthlyTarget) * 100 : 0;
        console.log("🎯 월간 목표 달성률:", achievementRate, "%");

        // 전월 대비 증감률 계산
        let monthlyGrowth = 0;
        let growthDiff = "전월 데이터 없음";
        let growthDiffType: "positive" | "negative" | "neutral" = "neutral";
        
        if (monthlyHydrogenData.length >= 2) {
            const currentMonth = monthlyHydrogenData[monthlyHydrogenData.length - 1];
            const previousMonth = monthlyHydrogenData[monthlyHydrogenData.length - 2];
            
            const currentProduction = currentMonth.totalProductionKg || 0;
            const previousProduction = previousMonth.totalProductionKg || 0;
            
            if (previousProduction > 0) {
                monthlyGrowth = ((currentProduction - previousProduction) / previousProduction) * 100;
                const absGrowth = Math.abs(monthlyGrowth);
                
                if (monthlyGrowth > 0) {
                    growthDiff = `+${absGrowth.toFixed(1)}%`;
                    growthDiffType = "positive";
                } else if (monthlyGrowth < 0) {
                    growthDiff = `-${absGrowth.toFixed(1)}%`;
                    growthDiffType = "negative";
                } else {
                    growthDiff = "0%";
                    growthDiffType = "neutral";
                }
            }
        }
        console.log("📈 전월 대비 증감률:", monthlyGrowth, "%");

        // 월 평균 효율 계산 (생산량 대비 목표 달성률)
        const monthlyEfficiency = achievementRate;
        let efficiencyDiff = "목표 대비";
        let efficiencyDiffType: "positive" | "negative" | "neutral" = "neutral";
        
        if (monthlyEfficiency >= 100) {
            efficiencyDiff = "목표 달성";
            efficiencyDiffType = "positive";
        } else if (monthlyEfficiency >= 80) {
            efficiencyDiff = "목표 근접";
            efficiencyDiffType = "neutral";
        } else {
            efficiencyDiff = "목표 미달";
            efficiencyDiffType = "negative";
        }
        console.log("⚙️ 월 평균 효율:", monthlyEfficiency, "%");

        return {
            totalProduction: {
                value: `${totalProductionKg.toFixed(0)}kg`,
                diff: "월간 총 생산량",
                diffType: "neutral" as const
            },
            achievementRate: {
                value: `${achievementRate.toFixed(1)}%`,
                diff: `목표 대비 ${monthlyTarget.toFixed(0)}kg`,
                diffType: achievementRate >= 100 ? "positive" as const : achievementRate >= 80 ? "neutral" as const : "negative" as const
            },
            monthlyGrowth: {
                value: `${monthlyGrowth.toFixed(1)}%`,
                diff: growthDiff,
                diffType: growthDiffType
            },
            monthlyEfficiency: {
                value: `${monthlyEfficiency.toFixed(1)}%`,
                diff: efficiencyDiff,
                diffType: efficiencyDiffType
            }
        };
    };

    // 개선된 효율 지표 계산 함수
    const calculateEfficiencyData = (
        hourlyHydrogenProduction?: any[],
        weeklyHydrogenData?: any[],
        monthlyHydrogenData?: any[],
        weeklyHydrogenPredictData?: any[],
        monthlyHydrogenPredictData?: any[],
        plant1?: any[],
        plant2?: any[],
        plant3?: any[],
        facilities?: any[]
    ) => {
        console.log("🔍 calculateEfficiencyData 호출됨 - 개선된 계산 방식");
        
        // 1. 일간 효율 계산 (다중 지표)
        let dailyEfficiency = 0;
        let dailyTarget = 50; // 일일 목표 50kg 가정
        let dailyProduction = 0;
        let dailyEnergyEfficiency = 0; // 에너지 효율
        let dailyCapacityUtilization = 0; // 설비 가동률
        
        if (hourlyHydrogenProduction && hourlyHydrogenProduction.length > 0) {
            dailyProduction = hourlyHydrogenProduction.reduce((sum: number, item: any) => {
                return sum + (item.productionKg || 0);
            }, 0);
            
            // 기본 생산 효율
            const productionEfficiency = dailyProduction > 0 ? (dailyProduction / dailyTarget) * 100 : 0;
            
            // 에너지 효율 계산 (전력 대비 수소 생산량)
            const totalEnergy = [plant1, plant2, plant3].reduce((sum, plantData) => {
                if (!plantData) return sum;
                return sum + plantData.reduce((plantSum, item) => {
                    return plantSum + (item.genKwhTotal || 0);
                }, 0);
            }, 0);
            
            // kWh당 수소 생산량 (kg/kWh) - 정규화된 효율 지표
            const energyEfficiency = totalEnergy > 0 ? Math.min((dailyProduction / totalEnergy) * 100, 100) : 0; // 최대 100%로 제한
            
            // 설비 가동률 (실제 생산 시간 / 전체 시간)
            const productionHours = hourlyHydrogenProduction.filter(item => (item.productionKg || 0) > 0).length;
            const capacityUtilization = Math.min((productionHours / 24) * 100, 100); // 최대 100%로 제한
            
            // 종합 효율 (가중 평균)
            dailyEfficiency = (productionEfficiency * 0.4) + (energyEfficiency * 0.3) + (capacityUtilization * 0.3);
            dailyEnergyEfficiency = energyEfficiency;
            dailyCapacityUtilization = capacityUtilization;
            
            console.log("📊 일간 효율 상세:", {
                생산효율: productionEfficiency.toFixed(1) + "%",
                에너지효율: energyEfficiency.toFixed(1) + "%",
                가동률: capacityUtilization.toFixed(1) + "%",
                종합효율: dailyEfficiency.toFixed(1) + "%"
            });
        }

        // 2. 주간 효율 계산 (안정성과 일관성 고려)
        let weeklyEfficiency = 0;
        let weeklyTarget = 300; // 주간 목표 300kg 기본값
        let weeklyProduction = 0;
        let weeklyConsistency = 0; // 일관성 지표
        let weeklyStability = 0; // 안정성 지표
        
        if (weeklyHydrogenData && weeklyHydrogenData.length > 0) {
            // 시간별 데이터를 일별로 그룹화
            const dailyTotals: { [date: string]: number } = {};
            weeklyHydrogenData.forEach((item: any) => {
                if (item.ts && item.productionKg !== undefined) {
                    const date = item.ts.split('T')[0];
                    if (!dailyTotals[date]) {
                        dailyTotals[date] = 0;
                    }
                    dailyTotals[date] += item.productionKg || 0;
                }
            });
            
            const dailyProductions = Object.values(dailyTotals);
            weeklyProduction = dailyProductions.reduce((sum, daily) => sum + daily, 0);
            
            // 일관성 계산 (변동계수 기반)
            if (dailyProductions.length > 1) {
                const avgDaily = weeklyProduction / dailyProductions.length;
                const variance = dailyProductions.reduce((sum, daily) => sum + Math.pow(daily - avgDaily, 2), 0) / dailyProductions.length;
                const stdDev = Math.sqrt(variance);
                const coefficientOfVariation = avgDaily > 0 ? stdDev / avgDaily : 0;
                // 변동계수가 낮을수록 일관성이 높음 (0~1 범위를 100~0으로 변환)
                weeklyConsistency = Math.max(0, 100 - (coefficientOfVariation * 100));
            }
            
            // 안정성 계산 (최소값/최대값 비율)
            if (dailyProductions.length > 0) {
                const minDaily = Math.min(...dailyProductions);
                const maxDaily = Math.max(...dailyProductions);
                // 최소값과 최대값의 비율로 안정성 측정 (0~100%)
                weeklyStability = maxDaily > 0 ? Math.min((minDaily / maxDaily) * 100, 100) : 0;
            }
            
            // 주간 예측 데이터에서 목표 설정
            if (weeklyHydrogenPredictData && weeklyHydrogenPredictData.length > 0) {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                const currentDay = now.getDate();
                const currentWeekStart = currentDay - ((now.getDay() + 6) % 7);
                const currentWeekOfMonth = Math.ceil(currentWeekStart / 7);
                
                const currentWeekPrediction = weeklyHydrogenPredictData.find((item: any) => 
                    item.year === currentYear && 
                    item.month === currentMonth && 
                    item.weekOfMonth === currentWeekOfMonth
                );
                
                if (currentWeekPrediction) {
                    weeklyTarget = currentWeekPrediction.totalPredictedKg || 0;
                }
            }
            
            const productionEfficiency = weeklyProduction > 0 ? (weeklyProduction / weeklyTarget) * 100 : 0;
            
            // 종합 효율 (생산 효율 + 일관성 + 안정성)
            weeklyEfficiency = (productionEfficiency * 0.5) + (weeklyConsistency * 0.3) + (weeklyStability * 0.2);
            
            console.log("📊 주간 효율 상세:", {
                생산효율: productionEfficiency.toFixed(1) + "%",
                일관성: weeklyConsistency.toFixed(1) + "%",
                안정성: weeklyStability.toFixed(1) + "%",
                종합효율: weeklyEfficiency.toFixed(1) + "%"
            });
        }

        // 3. 월간 효율 계산 (성장성과 예측 정확도 고려)
        let monthlyEfficiency = 0;
        let monthlyTarget = 1000; // 월간 목표 1000kg 기본값
        let monthlyProduction = 0;
        let monthlyGrowth = 0; // 성장률
        let monthlyPredictionAccuracy = 0; // 예측 정확도
        
        if (monthlyHydrogenData && Array.isArray(monthlyHydrogenData) && monthlyHydrogenData.length > 0) {
            monthlyProduction = monthlyHydrogenData.reduce((sum: number, item: any) => {
                return sum + (item.totalProductionKg || 0);
            }, 0);
            
            // 성장률 계산 (전월 대비)
            if (monthlyHydrogenData.length >= 2) {
                const currentMonth = monthlyHydrogenData[monthlyHydrogenData.length - 1];
                const previousMonth = monthlyHydrogenData[monthlyHydrogenData.length - 2];
                
                const currentProduction = currentMonth.totalProductionKg || 0;
                const previousProduction = previousMonth.totalProductionKg || 0;
                
                if (previousProduction > 0) {
                    monthlyGrowth = ((currentProduction - previousProduction) / previousProduction) * 100;
                }
            }
            
            // 예측 정확도 계산
            if (monthlyHydrogenPredictData && monthlyHydrogenPredictData.length > 0) {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                
                const currentMonthPrediction = monthlyHydrogenPredictData.find((item: any) => 
                    item.year === currentYear && item.month === currentMonth
                );
                
                if (currentMonthPrediction) {
                    monthlyTarget = currentMonthPrediction.totalPredictedKg || 0;
                    const predictionError = Math.abs(monthlyProduction - monthlyTarget);
                    monthlyPredictionAccuracy = monthlyTarget > 0 ? Math.max(0, 100 - (predictionError / monthlyTarget) * 100) : 0;
                }
            }
            
            const productionEfficiency = monthlyProduction > 0 ? (monthlyProduction / monthlyTarget) * 100 : 0;
            
            // 종합 효율 (생산 효율 + 성장률 + 예측 정확도)
            // 성장률을 0~100 점수로 변환 (-50% ~ +50%를 0~100으로 매핑)
            const growthScore = Math.min(Math.max((monthlyGrowth + 50) * 2, 0), 100);
            monthlyEfficiency = (productionEfficiency * 0.4) + (growthScore * 0.3) + (monthlyPredictionAccuracy * 0.3);
            
            console.log("📊 월간 효율 상세:", {
                생산효율: productionEfficiency.toFixed(1) + "%",
                성장률: monthlyGrowth.toFixed(1) + "%",
                성장점수: growthScore.toFixed(1) + "%",
                예측정확도: monthlyPredictionAccuracy.toFixed(1) + "%",
                종합효율: monthlyEfficiency.toFixed(1) + "%"
            });
        }

        return {
            daily: { 
                efficiency: Math.min(dailyEfficiency, 100), // 최대 100%로 제한
                target: dailyTarget,
                unit: "%",
                details: {
                    energyEfficiency: dailyEnergyEfficiency,
                    capacityUtilization: dailyCapacityUtilization
                }
            },
            weekly: { 
                efficiency: Math.min(weeklyEfficiency, 100),
                target: weeklyTarget,
                unit: "%",
                details: {
                    consistency: weeklyConsistency,
                    stability: weeklyStability
                }
            },
            monthly: { 
                efficiency: Math.min(monthlyEfficiency, 100),
                target: monthlyTarget,
                unit: "%",
                details: {
                    growth: monthlyGrowth,
                    predictionAccuracy: monthlyPredictionAccuracy
                }
            }
        };
    };

    // 주간 KPI 계산 함수들
    const calculateWeeklyKPIs = (weeklyHydrogenData?: any[], weeklyHydrogenPredictData?: any[]) => {
        console.log("🔍 calculateWeeklyKPIs 호출됨 - weeklyHydrogenData:", weeklyHydrogenData);
        console.log("🔍 calculateWeeklyKPIs 호출됨 - weeklyHydrogenPredictData:", weeklyHydrogenPredictData);
        
        if (!weeklyHydrogenData || weeklyHydrogenData.length === 0) {
            console.log("❌ 주간 수소 데이터가 없음");
            return {
                totalProduction: { value: "0kg", diff: "데이터 없음", diffType: "neutral" },
                achievementRate: { value: "0%", diff: "데이터 없음", diffType: "neutral" },
                loadFactor: { value: "0%", diff: "데이터 없음", diffType: "neutral" },
                dailyVariation: { value: "0%", diff: "데이터 없음", diffType: "neutral" }
            };
        }

        // 시간별 데이터를 일별로 그룹화
        const dailyTotals: { [date: string]: number } = {};
        
        weeklyHydrogenData.forEach((item: any) => {
            if (item.ts && item.productionKg !== undefined) {
                // ts에서 날짜 부분만 추출 (YYYY-MM-DD)
                const date = item.ts.split('T')[0];
                if (!dailyTotals[date]) {
                    dailyTotals[date] = 0;
                }
                dailyTotals[date] += item.productionKg || 0;
            }
        });

        // 일별 생산량 배열 생성
        const dailyProductions = Object.values(dailyTotals);
        
        if (dailyProductions.length === 0) {
            console.log("❌ 일별 생산량 데이터가 없음");
            return {
                totalProduction: { value: "0kg", diff: "데이터 없음", diffType: "neutral" },
                achievementRate: { value: "0%", diff: "데이터 없음", diffType: "neutral" },
                loadFactor: { value: "0%", diff: "데이터 없음", diffType: "neutral" },
                dailyVariation: { value: "0%", diff: "데이터 없음", diffType: "neutral" }
            };
        }

        console.log("🔍 일별 생산량:", dailyProductions);
        // 주간 총 수소 생산량 계산
        const totalProductionKg = dailyProductions.reduce((sum, daily) => sum + daily, 0);
        console.log("📊 주간 총 수소 생산량:", totalProductionKg, "kg");

        // 주간 목표 달성률 계산 (이번 주 예측값 기반)
        let weeklyTarget = 300; // 기본값 (kg)
        
        if (weeklyHydrogenPredictData && weeklyHydrogenPredictData.length > 0) {
            console.log("🔍 예측 데이터 처리 시작 - 데이터 개수:", weeklyHydrogenPredictData.length);
            console.log("🔍 예측 데이터 상세:");
            weeklyHydrogenPredictData.forEach((item, index) => {
                console.log(`  [${index}] year: ${item.year}, month: ${item.month}, weekOfMonth: ${item.weekOfMonth}, weekLabel: ${item.weekLabel}, totalPredictedKg: ${item.totalPredictedKg}`);
            });
            
            // 현재 날짜 기준으로 이번 주 찾기
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // JavaScript는 0부터 시작
            
            // 이번 주 계산 (월요일 시작)
            const currentDay = now.getDate();
            const currentWeekStart = currentDay - ((now.getDay() + 6) % 7); // 월요일 기준
            const currentWeekOfMonth = Math.ceil(currentWeekStart / 7);
            
            console.log("📅 현재 날짜 정보:", {
                year: currentYear,
                month: currentMonth,
                day: currentDay,
                weekOfMonth: currentWeekOfMonth
            });
            
            // 이번 주에 해당하는 예측 데이터 찾기
            const currentWeekPrediction = weeklyHydrogenPredictData.find((item: any) => 
                item.year === currentYear && 
                item.month === currentMonth && 
                item.weekOfMonth === currentWeekOfMonth
            );
            
            if (currentWeekPrediction) {
                weeklyTarget = currentWeekPrediction.totalPredictedKg || 0;
                console.log("🎯 이번 주 예측값 사용:", weeklyTarget, "kg");
                console.log("🎯 이번 주 정보:", currentWeekPrediction.weekLabel);
            } else {
                console.log("🎯 이번 주 예측 데이터 없음, 기본 목표 사용:", weeklyTarget, "kg");
            }
        } else {
            console.log("🎯 예측 데이터 없음, 기본 목표 사용:", weeklyTarget, "kg");
            console.log("🔍 예측 데이터 상태:", {
                hasData: !!weeklyHydrogenPredictData,
                isArray: Array.isArray(weeklyHydrogenPredictData),
                length: weeklyHydrogenPredictData?.length
            });
        }
        
        const achievementRate = totalProductionKg > 0 ? (totalProductionKg / weeklyTarget) * 100 : 0;
        console.log("🎯 주간 목표 달성률:", achievementRate, "%");

        // 설비 부하율 계산 (일일 최대 생산량 50kg 가정)
        const totalDays = dailyProductions.length;
        const maxPossibleProduction = totalDays * 50; // Daily max 50kg assumed
        const loadFactor = maxPossibleProduction > 0 ? (totalProductionKg / maxPossibleProduction) * 100 : 0;
        console.log("⚙️ 설비 부하율:", loadFactor, "%");

        // 요일별 생산 편차 계산 (변동계수)
        const mean = totalProductionKg / totalDays;
        const variance = dailyProductions.reduce((sum, daily) => sum + Math.pow(daily - mean, 2), 0) / totalDays;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;
        console.log("📈 요일별 생산 편차:", coefficientOfVariation, "%");

        return {
            totalProduction: {
                value: `${totalProductionKg.toFixed(1)}kg`,
                diff: `주간 목표: ${weeklyTarget}kg`,
                diffType: totalProductionKg >= weeklyTarget ? "positive" : totalProductionKg >= weeklyTarget * 0.8 ? "neutral" : "negative"
            },
            achievementRate: {
                value: `${achievementRate.toFixed(1)}%`,
                diff: achievementRate >= 100 ? `+${(totalProductionKg - weeklyTarget).toFixed(1)}kg` : `-${(weeklyTarget - totalProductionKg).toFixed(1)}kg`,
                diffType: achievementRate >= 100 ? "positive" : achievementRate >= 80 ? "neutral" : "negative"
            },
            loadFactor: {
                value: `${loadFactor.toFixed(1)}%`,
                diff: `${totalProductionKg.toFixed(1)}/${maxPossibleProduction}kg`,
                diffType: loadFactor >= 80 ? "positive" : loadFactor >= 60 ? "neutral" : "negative"
            },
            dailyVariation: {
                value: `${coefficientOfVariation.toFixed(1)}%`,
                diff: `표준편차: ${standardDeviation.toFixed(1)}kg`,
                diffType: coefficientOfVariation <= 20 ? "positive" : coefficientOfVariation <= 40 ? "neutral" : "negative"
            }
        };
    };

    // 효율 지표 계산 (개선된 방식)
    const efficiencyData = calculateEfficiencyData(
        hourlyHydrogenProduction,
        weeklyHydrogenData,
        monthlyHydrogenData,
        weeklyHydrogenPredictData,
        monthlyHydrogenPredictData,
        plant1,
        plant2,
        plant3,
        facilities
    );

    return {
        daily: {
            title: "데일리 모니터링",
            stats: [
                { 
                    label: "일간 오차율", 
                    value: `${dailyErrorRate.toFixed(1)}%`, 
                    diff: getErrorRateDiff(),
                    detail: `현재 시간: ${currentHour ?? 0}시`,
                    diffType: getErrorRateDiffType()
                },
                { 
                    label: "수소 생산 달성률", 
                    value: hydrogenStats.value, 
                    diff: `목표 대비 : ${hydrogenStats.diff}`,
                    detail: hydrogenStats.detail,
                    diffType: hydrogenStats.diffType
                },
                { 
                    label: "수소 생산량", 
                    value: productionStats.value, 
                    diff: productionStats.diff,
                    detail: productionStats.detail,
                    diffType: productionStats.diffType
                },
                { 
                    label: "설비 가동률", 
                    value: equipmentStats.value, 
                    diff: equipmentStats.diff,
                    detail: equipmentStats.detail,
                    diffType: equipmentStats.diffType
                },
            ],
            chart1Title: "시간대별 유휴 전력 발생량",
            chart2Title: "시간대별 수소 생산량"
        },
        weekly: (() => {
            console.log("🔍 주간 KPI 계산 시작");
            const weeklyKPIs = calculateWeeklyKPIs(weeklyHydrogenData, weeklyHydrogenPredictData);
            console.log("📊 주간 KPI 계산 결과:", weeklyKPIs);
            
            return {
                title: "위클리 모니터링",
                stats: [
                    { 
                        label: "주간 수소 총 생산량",
                        value: weeklyKPIs.totalProduction.value,
                        diff: weeklyKPIs.totalProduction.diff,
                        diffType: weeklyKPIs.totalProduction.diffType
                    },
                    { 
                        label: "주간 목표 달성률",
                        value: weeklyKPIs.achievementRate.value,
                        diff: weeklyKPIs.achievementRate.diff,
                        diffType: weeklyKPIs.achievementRate.diffType
                    },
                    { 
                        label: "설비 부하율",
                        value: weeklyKPIs.loadFactor.value,
                        diff: weeklyKPIs.loadFactor.diff,
                        diffType: weeklyKPIs.loadFactor.diffType
                    },
                    { 
                        label: "요일별 생산 편차",
                        value: weeklyKPIs.dailyVariation.value,
                        diff: weeklyKPIs.dailyVariation.diff,
                        diffType: weeklyKPIs.dailyVariation.diffType
                    }
                ],
                chart1Title: "요일별 유휴 전력 발생량",
                chart2Title: "요일별 수소 생산량"
            };
        })(),
        monthly: (() => {
            console.log("🔍 월간 KPI 계산 시작");
            const monthlyKPIs = calculateMonthlyKPIs(monthlyHydrogenData, monthlyHydrogenPredictData);
            console.log("📊 월간 KPI 계산 결과:", monthlyKPIs);
            
            return {
                title: "먼슬리 모니터링",
                stats: [
                    { 
                        label: "월간 총 수소 생산량",
                        value: monthlyKPIs.totalProduction.value,
                        diff: monthlyKPIs.totalProduction.diff,
                        diffType: monthlyKPIs.totalProduction.diffType
                    },
                    { 
                        label: "월간 목표 달성률",
                        value: monthlyKPIs.achievementRate.value,
                        diff: monthlyKPIs.achievementRate.diff,
                        diffType: monthlyKPIs.achievementRate.diffType
                    },
                    { 
                        label: "전월 대비 생산 증감률",
                        value: monthlyKPIs.monthlyGrowth.value,
                        diff: monthlyKPIs.monthlyGrowth.diff,
                        diffType: monthlyKPIs.monthlyGrowth.diffType
                    },
                    { 
                        label: "월 평균 효율",
                        value: monthlyKPIs.monthlyEfficiency.value,
                        diff: monthlyKPIs.monthlyEfficiency.diff,
                        diffType: monthlyKPIs.monthlyEfficiency.diffType
                    }
                ],
                chart1Title: "주차별 유휴 전력 발생량",
                chart2Title: "주차별 수소 생산량"
            };
        })(),
        efficiencyData // 효율 지표 데이터 추가
    };
}

export function calDailyErrorRate(plantDataArr: any[][], currentHour: number): number {
    
    const allData = plantDataArr.flat(); // 3대 설비 데이터 합치기

    const validData = allData.filter(item => item.hour !== null && item.hour <= currentHour);

    const grouped: { [hour: number]: { actual: number, forecast: number } } = {};

    validData.forEach(item => {
        const hour = item.hour;
        if (!grouped[hour]) {
            grouped[hour] = { actual: 0, forecast: 0 };
        }

        grouped[hour].actual += Math.max(0, Number(item.generation_Kw) - 300);
        grouped[hour].forecast += Math.max(0, Number(item.forecast_Kwh) - 300);
    })

    let totalActual = 0;
    let totalError = 0;

    Object.values(grouped).forEach(({ actual, forecast }) => {
        totalActual += actual;
        totalError += Math.abs(actual - forecast);
    })

    if (totalActual === 0) return 0;

    return (totalError / totalActual) * 100;
}

/**
 * 수소 생산량 목표 달성률 계산
 * @param plantDataArr 3대 설비 데이터 배열
 * @param currentHour 현재 시간
 * @param targetRate 목표 비율 (기본값: 1.0 = 예측치의 100%)
 * @returns 달성률 정보
 */
/**
 * 설비 가동률 계산 함수 (수소 생산 설비 기준)
 * 수소 생산 설비의 최대 용량 대비 실제 생산량으로 가동률 계산
 * @param hourlyHydrogenProduction 시간별 수소 생산량 데이터
 * @param currentHour 현재 시간
 * @param facilities 설비 정보 (h2Rate 포함)
 * @returns 가동률 정보
 */
/**
 * 하루 총 수소 생산량 계산
 * @param hourlyHydrogenProduction 시간별 수소 생산량 데이터
 * @param currentHour 현재 시간
 * @returns 총 생산량 정보
 */
export function calTotalHydrogenProduction(
    hourlyHydrogenProduction: any[],
    currentHour: number
): {
    totalProductionKg: number;
    averageHourlyProduction: number;
    productionHours: number;
} {
    if (!hourlyHydrogenProduction || hourlyHydrogenProduction.length === 0) {
        return {
            totalProductionKg: 0,
            averageHourlyProduction: 0,
            productionHours: 0
        };
    }

    // 현재 시간까지의 데이터만 필터링
    const validData = hourlyHydrogenProduction.filter(item => 
        item.hour !== null && item.hour <= currentHour
    );

    // 총 수소 생산량 계산
    const totalProductionKg = validData.reduce((sum, item) => sum + (item.productionKg || 0), 0);
    
    // 생산이 있었던 시간 수 계산
    const productionHours = validData.filter(item => (item.productionKg || 0) > 0).length;
    
    // 평균 시간당 생산량
    const averageHourlyProduction = productionHours > 0 ? totalProductionKg / productionHours : 0;

    return {
        totalProductionKg: Math.round(totalProductionKg * 10) / 10,
        averageHourlyProduction: Math.round(averageHourlyProduction * 10) / 10,
        productionHours
    };
}

export function calEquipmentUtilization(
    hourlyHydrogenProduction: any[],
    currentHour: number,
    facilities: any[]
): {
    overallUtilization: number;
    totalProductionKg: number;
    maxCapacityKg: number;
    averageHourlyProduction: number;
} {
    if (!hourlyHydrogenProduction || hourlyHydrogenProduction.length === 0) {
        return {
            overallUtilization: 0,
            totalProductionKg: 0,
            maxCapacityKg: 0,
            averageHourlyProduction: 0
        };
    }

    // 현재 시간까지의 데이터만 필터링
    const validData = hourlyHydrogenProduction.filter(item => 
        item.hour !== null && item.hour <= currentHour
    );

    // 총 수소 생산량 계산
    const totalProductionKg = validData.reduce((sum, item) => sum + (item.productionKg || 0), 0);
    
    // 설비 정보에서 h2Rate를 가져와서 최대 용량 계산
    let maxHourlyCapacity = 8; // 기본값 (kg/hour)
    if (facilities && facilities.length > 0) {
        // 모든 설비의 h2Rate를 합산하여 최대 용량 계산
        const totalH2Rate = facilities.reduce((sum, facility) => sum + (facility.h2Rate || 0), 0);
        if (totalH2Rate > 0) {
            maxHourlyCapacity = totalH2Rate;
        }
    }
    
    const maxCapacityKg = maxHourlyCapacity * (currentHour + 1); // 현재까지의 최대 가능 생산량
    
    // 평균 시간당 생산량
    const averageHourlyProduction = validData.length > 0 ? totalProductionKg / validData.length : 0;
    
    // 가동률 계산: (실제 생산량 / 최대 가능 생산량) × 100
    const overallUtilization = maxCapacityKg > 0 ? (totalProductionKg / maxCapacityKg) * 100 : 0;

    return {
        overallUtilization: Math.round(overallUtilization * 10) / 10,
        totalProductionKg: Math.round(totalProductionKg * 10) / 10,
        maxCapacityKg: Math.round(maxCapacityKg * 10) / 10,
        averageHourlyProduction: Math.round(averageHourlyProduction * 10) / 10
    };
}

export function calHydrogenAchievementRate(
    plantDataArr: any[][], 
    currentHour: number, 
    targetRate: number = 1.0
): {
    achievementRate: number;
    actualProductionKg: number;
    targetProductionKg: number;
    differenceKg: number;
    varianceRate: number;
} {
    const allData = plantDataArr.flat(); // 3대 설비 데이터 합치기

    const validData = allData.filter(item => item.hour !== null && item.hour <= currentHour);

    let totalActualProduction = 0;
    let totalPredictedProduction = 0;

    validData.forEach(item => {
        // 실제 수소 생산량 계산 (발전량을 수소 생산량으로 변환)
        // 예: 발전량 1kW = 수소 생산량 0.02kg (가정)
        const actualKg = Number(item.generation_Kw) * 0.02;
        totalActualProduction += actualKg;

        // 예측 수소 생산량 계산
        const predictedKg = Number(item.forecast_Kwh) * 0.02;
        totalPredictedProduction += predictedKg;
    });

    // 목표 생산량 = 예측 생산량 × 목표 비율
    const targetProductionKg = totalPredictedProduction * targetRate;
    
    // 달성률 계산
    const achievementRate = targetProductionKg > 0 ? (totalActualProduction / targetProductionKg) * 100 : 0;
    
    // 차이량 계산 (실제 - 목표)
    const differenceKg = totalActualProduction - targetProductionKg;
    
    // 목표 대비 증감률 계산
    const varianceRate = targetProductionKg > 0 ? (differenceKg / targetProductionKg) * 100 : 0;

    return {
        achievementRate: Math.round(achievementRate * 10) / 10, // 소수점 첫째자리까지
        actualProductionKg: Math.round(totalActualProduction * 10) / 10,
        targetProductionKg: Math.round(targetProductionKg * 10) / 10,
        differenceKg: Math.round(differenceKg * 10) / 10,
        varianceRate: Math.round(varianceRate * 10) / 10
    };
}

/**
 * 목표 비율에 따른 수소 생산량 달성률 계산 (목표 비율 조정 가능)
 * @param plantDataArr 3대 설비 데이터 배열
 * @param currentHour 현재 시간
 * @param targetRate 목표 비율 (0.8 = 80%, 1.0 = 100%, 1.2 = 120%)
 * @returns 달성률 정보
 */
export function calculateHydrogenAchievementWithTargetRate(
    plantDataArr: any[][], 
    currentHour: number, 
    targetRate: number = 1.0
) {
    return calHydrogenAchievementRate(plantDataArr, currentHour, targetRate);
}

/**
 * 목표 비율 옵션들
 */
export const TARGET_RATE_OPTIONS = [
    { value: 0.8, label: "80% (보수적 목표)" },
    { value: 0.9, label: "90% (안정적 목표)" },
    { value: 1.0, label: "100% (예측치 기준)" },
    { value: 1.1, label: "110% (도전적 목표)" },
    { value: 1.2, label: "120% (공격적 목표)" }
];

// 수소 생산량 라인 차트 옵션 (데일리용)
export function buildH2LineChartOptions(): ChartOptions {
    return {
        responsive: true,
        scales: {
            y: {
                type: "linear",
                display: true,
                position: "left",
                min: 0,
                max: 100, // 수소 생산량 최대값 (kg)
                ticks: {
                    stepSize: 10,
                    callback: (value: number) => `${value}kg`,
                },
                grid: {
                    drawOnChartArea: true,
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: function(context: any) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (value === null || value === undefined || value < 0) return `${label}: 0.00kg`;
                        return `${label}: ${value.toFixed(2)}kg`;
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
    };
}

// 수소 생산량 바 차트 옵션 (주간/월간용)
export function buildH2BarChartOptions(): ChartOptions {
    return {
        responsive: true,
        scales: {
            y: {
                type: "linear",
                display: true,
                position: "left",
                min: 0,
                max: 1000, // 주간/월간 수소 생산량 최대값 (kg)
                ticks: {
                    stepSize: 100,
                    callback: (value: number) => `${value}kg`,
                },
                grid: {
                    drawOnChartArea: true,
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: function(context: any) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (value === null || value === undefined || value < 0) return `${label}: 0.00kg`;
                        return `${label}: ${value.toFixed(2)}kg`;
                    }
                }
            },
        },
        interaction: {
            mode: "index",
            intersect: false,
        }
    };
}

// 수소 생산량 차트 옵션 (시간대별)
export function buildH2TimeChartOptions(): ChartOptions {
    return {
        responsive: true,
        scales: {
            y: {
                type: "linear",
                display: true,
                position: "left",
                min: 0,
                max: 5, // 시간별 수소 생산량 최대값 (kg)
                ticks: {
                    stepSize: 1,
                    callback: (value: number) => `${value}kg`,
                },
                grid: {
                    drawOnChartArea: true,
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: function(context: any) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (value === null || value === undefined || value < 0) return `${label}: 0.00kg`;
                        return `${label}: ${value.toFixed(2)}kg`;
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
    };
}

// 수소 생산량 일별 차트 데이터 (시간별)
export function buildH2DailyChartData(h2Data: any[], currentHour?: number): ChartData {
    // 24시간 데이터 생성
    const timeLabels = Array.from({ length: 25 }, (_, i) => `${i}시`);
    
    // 수소 생산량 데이터 (실제 데이터 또는 기본값)
    const productionData = timeLabels.map((_, index) => {
        // 현재 시간 이후는 null로 설정
        if (currentHour && index > currentHour) {
            return null;
        }

        // 실제 데이터에서 해당 시간의 수소 생산량 찾기
        const h2Point = h2Data?.find(item => {
            if (!item) return false;
            const hour = item.hour ?? item.hour_of_day ?? item.timestamp;
            return hour === index;
        });
        
        if (h2Point) {
            return h2Point.productionKg ?? 0;
        }
        
        // 데이터가 없으면 0으로 설정
        return 0;
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
                type: "line"
            },
        ],
    };
}

// 수소 생산량 주간 차트 데이터 (요일별)
export function buildH2WeeklyChartData(h2Data: any[]): ChartData {
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    
    // 요일별 수소 생산량 데이터 생성
    const productionData = days.map(day => {
        const dayData = h2Data?.find(item => {
            if (!item) return false;
            const itemDate = new Date(item.date);
            const dayOfWeek = itemDate.getDay();
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            return dayNames[dayOfWeek] === day;
        });
        
        return dayData?.productionKg ?? 0;
    });

    return {
        labels: days,
        datasets: [
            {
                label: "요일별 수소 생산량 (kg)",
                data: productionData,
                borderColor: "rgba(33, 150, 243, 1)",
                backgroundColor: "rgba(33, 150, 243, 0.6)",
                pointRadius: 4,
                type: "bar",
                barPercentage: 0.8,
                categoryPercentage: 0.9
            },
        ],
    };
}

// 수소 생산량 월간 차트 데이터 (주차별)
export function buildH2MonthlyChartData(h2Data: any[]): ChartData {
    // 주차별 라벨 생성 (예: 1주차, 2주차, ...)
    const weekLabels = ['1주차', '2주차', '3주차', '4주차', '5주차'];
    
    // 주차별 수소 생산량 데이터 생성
    const productionData = weekLabels.map((_, weekIndex) => {
        const weekData = h2Data?.filter(item => {
            if (!item) return false;
            const itemDate = new Date(item.date);
            const weekOfMonth = Math.ceil(itemDate.getDate() / 7);
            return weekOfMonth === weekIndex + 1;
        });
        
        if (weekData && weekData.length > 0) {
            return weekData.reduce((sum, item) => sum + (item.productionKg ?? 0), 0);
        }
        
        return 0;
    });

    return {
        labels: weekLabels,
        datasets: [
            {
                label: "주차별 수소 생산량 (kg)",
                data: productionData,
                borderColor: "rgba(33, 150, 243, 1)",
                backgroundColor: "rgba(33, 150, 243, 0.6)",
                pointRadius: 0,
                type: "bar",
                barPercentage: 0.8,
                categoryPercentage: 0.9,
                borderWidth: 1
            },
        ],
    };
}
