import { TimeFrame } from "@/types/dashboard";

interface TimeFrameTabsProps {
    activeTimeFrame: TimeFrame;
    onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

export default function TimeFrameTabs({ activeTimeFrame, onTimeFrameChange }: TimeFrameTabsProps) {
    const timeFrames: TimeFrame[] = ["daily", "weekly", "monthly"];
    
    const getTimeFrameLabel = (timeFrame: TimeFrame) => {
        switch (timeFrame) {
            case "daily": return "일간";
            case "weekly": return "주간";
            case "monthly": return "월간";
            default: return timeFrame;
        }
    };

    return (
        <div className="flex space-x-2">
            {timeFrames.map((timeFrame) => (
                <button
                    key={timeFrame}
                    onClick={() => onTimeFrameChange(timeFrame)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTimeFrame === timeFrame
                            ? "bg-blue-600 text-white dark:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                >
                    {getTimeFrameLabel(timeFrame)}
                </button>
            ))}
        </div>
    );
}
