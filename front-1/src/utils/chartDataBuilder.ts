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
            plant1: buildMonthlyPlantChartData(weeklyData),
            plant2: buildMonthlyPlantChartData(weeklyData),
            plant3: buildMonthlyPlantChartData(weeklyData),
        },
    };
}

// 일간 차트 데이터 생성 (시간별) - 발전량만 표시
function buildDailyPlantChartData(plantData: any[], currentHour: number): ChartData {
    // 입력 데이터 검증
    if (!plantData || !Array.isArray(plantData)) {
        // console.warn('🔧 buildDailyPlantChartData: plantData가 유효하지 않습니다.');
        return {
            labels: [],
            datasets: [],
        }
    }

    // currentHour 검증
    if (currentHour < 0 || currentHour > 24) {
        // console.warn(`🔧 buildDailyPlantChartData: currentHour(${currentHour})가 유효하지 않습니다.`);
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
function buildWeeklyPlantChartData(plantData: any[]): ChartData {
    // console.log('🔧 buildWeeklyPlantChartData 시작:');
    // console.log('  - 입력 데이터:', plantData);
    // console.log('  - 데이터 길이:', plantData.length);
    
    // if (plantData.length === 0) {
    //     console.warn('⚠️ 주간 데이터가 비어있음');
    //     return {
    //         labels: [],
    //         datasets: []
    //     };
    // }

    const currentDate = new Date();

    // 요일별 라벨 생성
    const labels = plantData.map((item: any) => {
        if (!item.date) return '날짜 없음';
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return '날짜 오류';
        
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        
        return `${month}/${day} (${dayOfWeek})`;
    });
    

    // 발전량 데이터 (백엔드에서 genKwhTotal로 제공)
    const generationData = plantData.map((item) => {
        const dateObj = new Date(item.date);

        if (dateObj > currentDate) {
            return null; // 현재 날짜 이후는 null로 설정하여 표시하지 않음
        }
        return item ? (item.genKwhTotal - 300 || 0) : 0;
    });

    // 예측 발전량 데이터 (백엔드에서 predKwhTotal로 제공)
    const forecastData = plantData.map((item) => {
        return item ? (item.predKwhTotal - 300 || 0) : 0;
    });
    
    const result = {
        labels: labels,
        datasets: [
            {
                label: "총 발전량",
                data: generationData,
                borderColor: "rgba(153,102,255,1)",
                backgroundColor: "rgba(153,102,255,0.2)",
                pointRadius: 4,
                type: "bar",
                barPercentage: 0.8,      // 바의 너비 (0.8 = 80%)
                categoryPercentage: 0.9  // 카테고리 간격 (0.9 = 90%)
            },
            {
                label: "예측 발전량",
                data: forecastData,
                borderColor: "rgba(76, 175, 80, 1)",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                pointRadius: 3,
                borderDash: [1 , 1],
                type: "line"
            }
        ],
    };
    
    // console.log('  - 생성된 차트 데이터:', result);
    // console.log('  - 라벨:', labels);
    // console.log('  - 발전량 데이터:', generationData);
    // console.log('  - 예측량 데이터:', forecastData);
    return result as ChartData;
}

// 월간 차트 데이터 생성 (주별) - 바 차트
function buildMonthlyPlantChartData(plantData: any[]): ChartData {
    // console.log('🔧 buildMonthlyPlantChartData 시작:');
    // console.log('  - 입력 데이터:', plantData);
    // console.log('  - 데이터 길이:', plantData.length);
    
    if (plantData.length === 0) {
        console.warn('⚠️ 월간 데이터가 비어있음');
        return {
            labels: [],
            datasets: []
        };
    }

    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay()); // 이번 주 일요일

    // 주차별로 데이터 그룹화
    const weeklyGroups: { [weekKey: string]: any[] } = {};
    
    plantData.forEach((item: any) => {
        if (!item.date) return;
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;
        
        // 주차 계산 (월의 몇 번째 주인지)
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDayWeekday = firstDayOfMonth.getDay();
        const weekNumber = Math.ceil((date.getDate() + firstDayWeekday) / 7);
        
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

    // 현재 주 정보를 저장할 배열
    const isCurrentWeekArray: boolean[] = [];
    
    sortedWeeks.forEach(weekKey => {
        const [year, month, weekNum] = weekKey.split('-');
        const weekData = weeklyGroups[weekKey];
        
        // 주차 라벨 생성 (예: "8월 1주차", "8월 2주차")
        // 해당 주의 데이터가 현재 주인지 확인
        const isCurrentWeek = weekData.some((item: any) => {
            const itemDate = new Date(item.date);
            return itemDate >= currentWeekStart;
        });
        
        // 현재 주 여부를 배열에 저장
        isCurrentWeekArray.push(isCurrentWeek);
        
        // 현재 주에는 "(현재)" 표시 추가
        if (isCurrentWeek) {
            labels.push(`${month}월 ${weekNum}주차 (현재)`);
        } else {
            labels.push(`${month}월 ${weekNum}주차`);
        }
        
        if (isCurrentWeek) {
            // 현재 주는 예측값만 표시
            const weekForecastTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.predKwhTotal || 0);
            }, 0);
            generationData.push(null); // 실제값은 null로 설정
            forecastData.push(weekForecastTotal - (300 * weekData.length)); // 유휴 전력량 계산
        } else {
            // 과거 주는 실제값과 예측값 모두 표시
            const weekGenerationTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.genKwhTotal || 0);
            }, 0);
            const weekForecastTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.predKwhTotal || 0);
            }, 0);
            generationData.push(weekGenerationTotal - (300 * weekData.length)); // 유휴 전력량 계산
            forecastData.push(weekForecastTotal - (300 * weekData.length)); // 예측 유휴 전력량 계산
        }
    });

    // console.log('  - 생성된 주차별 데이터:', {
    //     labels,
    //     generationData,
    //     forecastData
    // });

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
                        stepSize: 500,
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
    console.log('🔧 buildH2Data 디버깅 시작');
    console.log('  - currentHour:', currentHour);
    console.log('  - hourlyHydrogenProduction:', hourlyHydrogenProduction);
    console.log('  - 데이터 길이:', hourlyHydrogenProduction?.length || 0);
    
    if (hourlyHydrogenProduction && hourlyHydrogenProduction.length > 0) {
        console.log('  - 첫 번째 데이터 샘플:', hourlyHydrogenProduction[0]);
        console.log('  - 데이터 키들:', Object.keys(hourlyHydrogenProduction[0] || {}));
    }
    
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
            console.log(`  - ${index}시 수소 생산량:`, production);
            return production;
        }
        
        // 데이터가 없으면 0으로 설정
        return 0;
    });
    
    console.log('  - 생성된 수소 생산량 데이터:', productionData);
    
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

// 월간 탭용 주차별 수소 생산량 데이터 생성
export function buildMonthlyH2Data(plantData: any[]): ChartData {
    // console.log('🔧 buildMonthlyH2Data 시작:');
    // console.log('  - 입력 데이터:', plantData);
    // console.log('  - 데이터 길이:', plantData.length);
    
    if (plantData.length === 0) {
        // console.warn('⚠️ 월간 수소 데이터가 비어있음');
        return {
            labels: [],
            datasets: []
        };
    }

    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay()); // 이번 주 일요일

    // 주차별로 데이터 그룹화
    const weeklyGroups: { [weekKey: string]: any[] } = {};
    
    plantData.forEach((item: any) => {
        if (!item.date) return;
        
        const date = new Date(item.date);
        if (isNaN(date.getTime())) return;
        
        // 주차 계산 (월의 몇 번째 주인지)
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstDayWeekday = firstDayOfMonth.getDay();
        const weekNumber = Math.ceil((date.getDate() + firstDayWeekday) / 7);
        
        const weekKey = `${date.getFullYear()}-${date.getMonth() + 1}-${weekNumber}`;
        
        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = [];
        }
        weeklyGroups[weekKey].push(item);
    });

    // 주차별로 정렬하고 라벨과 데이터 생성
    const sortedWeeks = Object.keys(weeklyGroups).sort();
    const labels: string[] = [];
    const productionData: (number | null)[] = [];
    const forecastData: number[] = [];

    sortedWeeks.forEach(weekKey => {
        const [year, month, weekNum] = weekKey.split('-');
        const weekData = weeklyGroups[weekKey];
        
        // 주차 라벨 생성 (예: "8월 1주차", "8월 2주차")
        labels.push(`${month}월 ${weekNum}주차`);
        
        // 해당 주의 데이터가 현재 주인지 확인
        const isCurrentWeek = weekData.some((item: any) => {
            const itemDate = new Date(item.date);
            return itemDate >= currentWeekStart;
        });
        
        if (isCurrentWeek) {
            // 현재 주는 예측값만 표시 (수소 생산량은 발전량과 연관)
            const weekForecastTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.predKwhTotal || 0);
            }, 0);
            productionData.push(null); // 실제값은 null로 설정
            forecastData.push(weekForecastTotal * 0.1); // 발전량의 10%로 수소 생산량 예측
        } else {
            // 과거 주는 실제값 표시 (수소 생산량은 발전량과 연관)
            const weekGenerationTotal = weekData.reduce((sum: number, item: any) => {
                return sum + (item.genKwhTotal || 0);
            }, 0);
            productionData.push(weekGenerationTotal * 0.1); // 발전량의 10%로 수소 생산량 계산
            forecastData.push(0); // 예측값은 0으로 설정 (표시하지 않음)
        }
    });


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
            {
                label: "주차별 수소 생산 예측량 (kg)",
                data: forecastData,
                borderColor: "rgba(33, 150, 243, 0.6)",
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                pointRadius: 3,
                borderDash: [5, 5],
                fill: false,
                type: "line"
            }
        ],
    };
}

export function buildTimeFrameData(plant1?: any[], plant2?: any[], plant3?: any[], currentHour?: number, hourlyHydrogenProduction?: any[]) {

    const dailyErrorRate = calDailyErrorRate(
        [plant1 ?? [], plant2 ?? [], plant3 ?? []],
        currentHour ?? 0
    )


    return {
        daily: {
            title: "데일리 모니터링",
            stats: [
                { 
                    label: "유휴 전력 오차율",
                    value:  `${dailyErrorRate.toFixed(2)}%`,
                    diff: "전일 대비" 
                },
                { label: "수소 생산 달성률", value: "40,689", diff: "목표 대비" },
                { label: "전력 효율", value: "78.1%", diff: "전일 대비" },
                { label: "설비 가동률", value: "80%", diff: "전일 대비" },
            ],
            chart1Title: "시간대별 유휴 전력 발생량",
            chart2Title: "시간대별 수소 생산량"
        },
        weekly: {
            title: "위클리 모니터링",
            stats: [
                { label: "총 유휴 전력 발생 시간", value: "40,689", diff: "전주 대비" },
                { label: "주간 총 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                { label: "전주 대비 증감률", value: "80%", diff: "전주 대비" },
                { label: "주간 평균 효율", value: "78.1%", diff: "전주 대비" },
            ],
            chart1Title: "요일별 유휴 전력 발생량",
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
            chart1Title: "주차별 유휴 전력 발생량",
            chart2Title: "주차별 수소 생산량"
        }
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
