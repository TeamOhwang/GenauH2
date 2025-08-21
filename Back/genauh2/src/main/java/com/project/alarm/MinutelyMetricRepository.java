//package com.project.alarm;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//
//import java.util.List;
//
//public interface MinutelyMetricRepository extends JpaRepository<MinutelyMetric, Long> {
//
//    /**
//     * 날짜는 무시하고, minute(minute_timestamp) == 현재 분 과 같으면서
//     * metric_value <= :threshold 인 레코드 중 "가장 최근" 1건만 가져옵니다.
//     * (과거 데이터가 많이 있어도 한 건만 매칭되도록 LIMIT 1)
//     */
//    @Query(value = """
//        SELECT *
//        FROM minutely_metrics
//        WHERE metric_value <= :threshold
//          AND MINUTE(minute_timestamp) = :minuteOfHour
//        ORDER BY minute_timestamp DESC
//        LIMIT 1
//        """, nativeQuery = true)
//    List<MinutelyMetric> findLatestCriticalByMinuteOfHour(
//            @Param("threshold") double threshold,
//            @Param("minuteOfHour") int minuteOfHour
//    );
//}
