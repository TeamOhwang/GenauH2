import LineChart from "@/components/ChartComponent";


export default function Daily() {

    // 가데이터
    const solaData = {
        labels: ["9시", "10시", "11시", "12시"],
        datasets: [
            {
                label: "시간별 태양광 발전량",
                data: [100, 200, 150, 300],
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
            },
        ],
    };

    const h2Data = {
        labels: ["9시", "10시", "11시", "12시"],
        datasets: [
            {
                label: "시간별 수소 생산량",
                data: [200, 400, 350, 283],
                borderColor: "#4880ff",
                backgroundColor: "#4880ff",
            },
        ],
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom" as const,
            },
        },
    };

    return (
        <div className="h-full overflow-auto scrollbar-hide">
            <p className="m-6 font-bold text-2xl ">데일리 모니터링</p>

            <div className="grid grid-cols-4 gap-4 m-6">
                {[
                    { label: "예측 유휴 전력량 vs 실제 유휴 전력량", value: "40,689", diff: "목표 대비" },
                    { label: "현재 수소 생산량 vs 예측 생산량", value: "40,689", diff: "목표 대비" },
                    { label: "수소 1kg당 전력 소비량", value: "78.1%", diff: "전일 대비" },
                    { label: "현재 설비 가동률", value: "80%", diff: "전일 대비" },
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

            {/* 시간대별 발전량 */}
            <div className="m-6 bg-white rounded-2xl shadow p-4">
                <p className="text-xl font-bold mb-3">태양광 발전량</p>
                <LineChart data={solaData} options={options}/>
            </div>
            {/* 시간대별 수소 생산량 */}
            <div className="m-6 bg-white rounded-2xl shadow p-4">
                <p className="text-xl font-bold mb-3">수소 생산량</p>
                <LineChart data={h2Data} options={options}/>
            </div>

        </div>
    )
}
