import { useState, useEffect } from 'react'

const useHourlyUpdater = () => {
    const [currentHour, setCurrentHour] = useState(new Date().getHours())

    useEffect(() => {
        const now = new Date();
        // 다음 정시까지 남은 ms 계산
        const msToNextHour = 
            (60 - now.getMinutes()) * 60 * 1000 -
            now.getSeconds() * 1000 -
            now.getMilliseconds();

        // 다음 정시 업데이트 예약
        const timeout = setTimeout(() => {
            setCurrentHour(new Date().getHours())

            // 이후에는 매 정시마다 실행
            const interval = setInterval(() => {
                setCurrentHour(new Date().getHours());
            }, 60 * 60 * 1000)

            return () => clearInterval(interval)
        }, msToNextHour)        

        return () => clearTimeout(timeout);
    }, []);
}

export default useHourlyUpdater