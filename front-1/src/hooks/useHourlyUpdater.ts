import { useEffect, useRef, useCallback } from 'react';

interface UseHourlyUpdaterOptions {
    onUpdate: () => void;
    immediate?: boolean;
}

export function useHourlyUpdater({ onUpdate, immediate = true }: UseHourlyUpdaterOptions) {
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const onUpdateRef = useRef(onUpdate);

    // onUpdate 함수를 ref에 저장하여 최신 값을 유지
    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    const calculateNextHour = useCallback(() => {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        return nextHour.getTime() - now.getTime();
    }, []);

    const scheduleNextUpdate = useCallback(() => {
        const delay = calculateNextHour();

        timeoutRef.current = setTimeout(() => {
            onUpdateRef.current(); // ref를 통해 최신 함수 호출
            scheduleNextUpdate();
        }, delay);
    }, [calculateNextHour]);

    const startUpdater = useCallback(() => {
        if (immediate) {
            onUpdateRef.current(); // ref를 통해 최신 함수 호출
        }
        scheduleNextUpdate();
    }, [immediate, scheduleNextUpdate]);

    const stopUpdater = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        startUpdater();

        return () => {
            stopUpdater();
        };
    }, [startUpdater, stopUpdater]);

    return { stopUpdater, startUpdater };
}