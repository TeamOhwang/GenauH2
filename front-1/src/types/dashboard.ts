export type TimeFrame = "daily" | "weekly" | "monthly";
export type Plant = "plant1" | "plant2" | "plant3";

export interface StatItem {
    label: string;
    value: string;
    diff: string;
}

export interface TimeFrameData {
    title: string;
    stats: StatItem[];
    chart1Title: string;
    chart2Title: string;
}

export interface TimeFrameDataMap {
    [key: string]: TimeFrameData;
}
