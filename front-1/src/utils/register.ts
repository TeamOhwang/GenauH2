import {
  Chart as ChartJS,
  CategoryScale,   // X축 카테고리
  LinearScale,     // Y축 선형
  LogarithmicScale,// 로그 스케일
  RadialLinearScale, // Radar/Doughnut/Polar 등 원형 스케일
  TimeScale,       // 타임스케일 (moment.js, luxon 등과 함께)
  TimeSeriesScale, // 시계열 스케일

  PointElement,    // Line/Scatter 점
  LineElement,     // Line 차트
  BarElement,      // Bar 차트
  ArcElement,      // Pie/Doughnut
  RadarController, // Radar
  BubbleController,// Bubble
  PolarAreaController, // Polar Area
  ScatterController,   // Scatter

  Title,
  Tooltip,
  Legend,
  Filler,
  Decimation,      // 성능 최적화
  SubTitle
} from "chart.js";

ChartJS.register(
  //  스케일
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,

  //  요소
  PointElement,
  LineElement,
  BarElement,
  ArcElement,

  //  컨트롤러 (일부 차트는 컨트롤러를 직접 등록해야 함)
  RadarController,
  BubbleController,
  PolarAreaController,
  ScatterController,

  //  플러그인
  Title,
  SubTitle,
  Tooltip,
  Legend,
  Filler,
  Decimation
);
