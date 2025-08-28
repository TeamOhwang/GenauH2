package com.project.service;

import com.project.dto.IdlePowerComparisonDTO;
import com.project.repository.PredictRepository;
import com.project.repository.RealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IdlePowerComparisonService {

    private final PredictRepository predictRepository;
    private final RealRepository realRepository;

    public List<IdlePowerComparisonDTO> getIdlePowerComparison(LocalDate date) {
        String dateString = date.format(DateTimeFormatter.ISO_LOCAL_DATE);

        // 1. 예측 데이터 조회: 시간(hour)을 Key, idlepowerkw 값들의 리스트를 Value로 하는 Map 생성
        List<Object[]> predictedData = predictRepository.findIdlePowerByDate(dateString);
        Map<Integer, List<BigDecimal>> predictedMap = predictedData.stream()
            .collect(Collectors.groupingBy(
                row -> ((Timestamp) row[0]).toLocalDateTime().getHour(),
                Collectors.mapping(row -> new BigDecimal(row[1].toString()), Collectors.toList())
            ));

        // 2. 실제 데이터 조회: 위와 동일하게 Map 생성
        List<Object[]> actualData = realRepository.findIdlePowerByDate(dateString);
        Map<Integer, List<BigDecimal>> actualMap = actualData.stream()
            .collect(Collectors.groupingBy(
                row -> ((Timestamp) row[0]).toLocalDateTime().getHour(),
                Collectors.mapping(row -> new BigDecimal(row[1].toString()), Collectors.toList())
            ));

        // 3. 0시부터 23시까지 데이터를 조합하여 최종 결과 생성
        return IntStream.range(0, 24)
            .mapToObj(hour -> IdlePowerComparisonDTO.builder()
                .hour(hour)
                .predictedIdlePowerKw(predictedMap.getOrDefault(hour, new ArrayList<>())) // 데이터가 없으면 빈 리스트 반환
                .actualIdlePowerKw(actualMap.getOrDefault(hour, new ArrayList<>()))   // 데이터가 없으면 빈 리스트 반환
                .build())
            .collect(Collectors.toList());
    }
    
}
