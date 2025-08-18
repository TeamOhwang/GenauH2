import {
    Chart as ChartJs,
    CategoryScale, // x축
    LinearScale, // y축
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    BarElement,

} from "chart.js"

import LineChart from "@/components/ChartComponent";

ChartJs.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
)

export default function Hourly() {

    const data = [
        { "time_hour": 5, "time_amount": 27710, "time_count": 5 },
        { "time_hour": 6, "time_amount": 27682, "time_count": 2 },
        { "time_hour": 7, "time_amount": 22764, "time_count": 4 },
        { "time_hour": 8, "time_amount": 46618, "time_count": 2 },
        { "time_hour": 9, "time_amount": 49682, "time_count": 2 },
        { "time_hour": 10, "time_amount": 30535, "time_count": 2 }
    ]
    return (
        <>
            <p className="m-6 font-bold text-2xl ">시간별 모니터링</p>

            <div className="grid grid-cols-4 gap-4 m-6">
                {[
                    { label: "현재 유휴 전력량", value: "40,689", diff: "+8.5% Up from yesterday" },
                    { label: "현재 수소 생산량", value: "40,689", diff: "+8.5% Up from yesterday" },
                    { label: "변환 효율", value: "78.1%", diff: "+8.5% Up from yesterday" },
                    { label: "현재 설비 가동률", value: "80%", diff: "+8.5% Up from yesterday" },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-4 rounded-2xl shadow`}
                    >
                        <p className="text-gray-500 mb-2">{item.label}</p>
                        <h3 className="text-2xl font-bold">{item.value}</h3>
                        <p className="text-sm text-green-600">{item.diff}</p>
                    </div>
                ))}
            </div>

            <div className="m-6 bg-white rounded-2xl shadow p-4">
                <p className="text-xl font-bold mb-3">태양광 발전량</p>
                <LineChart />
            </div>



        </>
    )
}
