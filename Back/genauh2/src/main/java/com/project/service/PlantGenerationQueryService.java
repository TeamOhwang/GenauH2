package com.project.service;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.project.dto.DailyTotal;
import com.project.dto.HourlyAvg;
import com.project.entity.PlantGeneration;
import com.project.repository.PlantGenerationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlantGenerationQueryService {

    private final PlantGenerationRepository repo;

    /** 원시 시계열(엔티티 그대로) */
    public List<PlantGeneration> getRawSeries(LocalDate start, LocalDate end, int limit) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> list = repo.findByDateBetweenOrderByDateAscHourAsc(s, e);
        if (limit > 0 && list.size() > limit) {
            return list.subList(0, limit);
        }
        return list;
    }

    /** 최신 1건(엔티티) */
    public PlantGeneration getLatestEntity() {
        return repo.findFirstByOrderByDateDescHourDesc();
    }

    /** 일별 합계 (kW를 1시간 간격으로 kWh 합산 가정) */
    public List<DailyTotal> getDaily(LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows = repo.findByDateBetween(s, e);
        Map<LocalDate, double[]> acc = new HashMap<>(); // [0]=gen sum, [1]=pred sum

        for (PlantGeneration r : rows) {
            LocalDate key = r.getDate();
            acc.computeIfAbsent(key, k -> new double[2]);
            acc.get(key)[0] += r.getGenerationKw();
            acc.get(key)[1] += r.getForecastKwh();
        }

        List<DailyTotal> result = acc.entrySet().stream()
                .map(en -> DailyTotal.builder()
                        .date(en.getKey())
                        .genKwhTotal(en.getValue()[0])
                        .predKwhTotal(en.getValue()[1])
                        .build())
                .sorted(Comparator.comparing(DailyTotal::getDate))
                .toList();

        return result;
    }

    /** 시간대 평균(0~23시) */
    public List<HourlyAvg> getHourlyAvg(LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows = repo.findByDateBetween(s, e);
        double[][] bucket = new double[24][4]; // [genSum, genCnt, predSum, predCnt]

        for (PlantGeneration r : rows) {
            int h = r.getHour();
            bucket[h][0] += r.getGenerationKw();
            bucket[h][1] += 1.0;
            bucket[h][2] += r.getForecastKwh();
            bucket[h][3] += 1.0;
        }

        List<HourlyAvg> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            double genAvg  = bucket[h][1] > 0 ? bucket[h][0] / bucket[h][1] : 0.0;
            double predAvg = bucket[h][3] > 0 ? bucket[h][2] / bucket[h][3] : 0.0;
            result.add(HourlyAvg.builder()
                    .hour(h)
                    .genKwAvg(genAvg)
                    .predKwhAvg(predAvg)
                    .build());
        }
        return result;
    }
}