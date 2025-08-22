import { fetchRawGeneration } from "@/api/generationService";
import { useState, useCallback } from "react";

export function useGeneration() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getRawGeneration = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRawGeneration(startDate, endDate);
            return data;
        } catch (e: any) {
            setError(e?.message ?? "원시 데이터 조회 실패");
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    return { loading, error, getRawGeneration };
}