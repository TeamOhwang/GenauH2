package com.project.service;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
//페이징 로직
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

import com.project.dto.DailyTotal;
import com.project.dto.MonthlyTotal;
import com.project.dto.WeeklyTotal;
import java.time.temporal.WeekFields;
import java.util.Locale;
//import java.util.Map;
import java.util.stream.Collectors;

import com.project.dto.HourlyAvg;
import com.project.dto.DashboardSummaryDTO;

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
            acc.get(key)[0] += r.getGeneration_Kw();
            acc.get(key)[1] += r.getForecast_Kwh();
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

    /* 주별 합계 (kW를 1시간 간격으로 kWh 합산 가정)  */
    public List<WeeklyTotal> getWeekly(LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(90);
        LocalDate e = (end != null) ? end : LocalDate.now();
        List<PlantGeneration> rows = repo.findByDateBetween(s, e);

        // 연도와 주차를 기준으로 데이터를 그룹화하고 합계를 계산합니다.
        Map<String, double[]> weeklySums = rows.stream()
                .collect(Collectors.groupingBy(r -> {
                    int year = r.getDate().getYear();
        
                    int week = r.getDate().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
                    return year + "-" + week;
                }, Collectors.reducing(new double[2], r -> 
                    new double[]{r.getGeneration_Kw(), r.getForecast_Kwh()}, 
                    (a, b) -> new double[]{a[0] + b[0], a[1] + b[1]}
                )));

        // 결과를 WeeklyTotal DTO 리스트로 변환합니다.
        return weeklySums.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int week = Integer.parseInt(parts[1]);
                    double[] totals = entry.getValue();
                    return WeeklyTotal.builder()
                            .year(year)
                            .weekOfYear(week)
                            .genKwhTotal(totals[0])
                            .predKwhTotal(totals[1])
                            .build();
                })
                .sorted(Comparator.comparingInt(WeeklyTotal::getYear).thenComparingInt(WeeklyTotal::getWeekOfYear))
                .collect(Collectors.toList());
    }

    /* 월별 합계 (kW를 1시간 간격으로 kWh 합산 가정) */
    public List<MonthlyTotal> getMonthly(LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(365);
        LocalDate e = (end != null) ? end : LocalDate.now();
        List<PlantGeneration> rows = repo.findByDateBetween(s, e);

        // 연도와 월을 기준으로 데이터를 그룹화하고 합계를 계산합니다.
        Map<String, double[]> monthlySums = rows.stream()
                .collect(Collectors.groupingBy(r -> 
                    r.getDate().getYear() + "-" + r.getDate().getMonthValue(),
                    Collectors.reducing(new double[2], r -> 
                        new double[]{r.getGeneration_Kw(), r.getForecast_Kwh()},
                        (a, b) -> new double[]{a[0] + b[0], a[1] + b[1]}
                    )
                ));

        // 결과를 MonthlyTotal DTO 리스트로 변환합니다.
        return monthlySums.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("-");
                    int year = Integer.parseInt(parts[0]);
                    int month = Integer.parseInt(parts[1]);
                    double[] totals = entry.getValue();
                    return MonthlyTotal.builder()
                            .year(year)
                            .month(month)
                            .genKwhTotal(totals[0])
                            .predKwhTotal(totals[1])
                            .build();
                })
                .sorted(Comparator.comparingInt(MonthlyTotal::getYear).thenComparingInt(MonthlyTotal::getMonth))
                .collect(Collectors.toList());
    }

    /** 시간대 평균(0~23시) */
    public List<HourlyAvg> getHourlyAvg(LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows = repo.findByDateBetween(s, e);
        double[][] bucket = new double[24][4]; // [genSum, genCnt, predSum, predCnt]

        for (PlantGeneration r : rows) {
            int h = r.getHour();
            bucket[h][0] += r.getGeneration_Kw();
            bucket[h][1] += 1.0;
            bucket[h][2] += r.getForecast_Kwh();
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

     /* 대시보드 요약 정보  */
    public DashboardSummaryDTO getDashboardSummary() {
        // DB에서 가장 최신 데이터 1건을 가져옵니다.
        PlantGeneration latest = repo.findFirstByOrderByDateDescHourDesc();

        if (latest == null) {
            // 데이터가 없는 경우 기본값 또는 예외 처리를 할 수 있습니다.
            return DashboardSummaryDTO.builder()
                .currentGenerationKw(0.0)
                .currentForecastKwh(0.0)
                .capacityKw(0)
                .idlePowerKw(0.0)
                .conversionEfficiency(0.0)
                .build();
        }

        double generationKw = latest.getGeneration_Kw();
        int capacityKw = latest.getCapacity_Kw();
        double idlePower = capacityKw - generationKw;
        
        // 설비용량이 0일 경우 0으로 나누는 것을 방지
        double efficiency = (capacityKw > 0) ? (generationKw / capacityKw) * 100 : 0.0;

        return DashboardSummaryDTO.builder()
                .currentGenerationKw(generationKw)
                .currentForecastKwh(latest.getForecast_Kwh())
                .capacityKw(capacityKw)
                .idlePowerKw(idlePower)
                .conversionEfficiency(efficiency)
                .build();
    }

    /* 상세 데이터 페이징 조회 */
    public Page<PlantGeneration> getDetailedData(LocalDate start, LocalDate end, int page, int size) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        // 페이지 번호, 페이지 크기, 정렬 기준을 포함하는 Pageable 객체 생성
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending().and(Sort.by("hour").descending()));

        return repo.findByDateBetween(s, e, pageable);
    }



}