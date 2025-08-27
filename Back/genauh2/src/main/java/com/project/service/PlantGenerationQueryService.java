package com.project.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.project.dto.DailyTotal;
import com.project.dto.DashboardSummaryDTO;
import com.project.dto.HourlyAvg;
import com.project.dto.HourlyHydrogenProductionDTO;
import com.project.dto.MonthlyTotal;
import com.project.dto.PeriodSummaryDTO;
import com.project.dto.WeeklyTotal;
import com.project.entity.Facility;
import com.project.entity.PlantGeneration;
import com.project.repository.FacilityRepository;
import com.project.repository.PlantGenerationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlantGenerationQueryService {

    private final PlantGenerationRepository repo;
    private final FacilityRepository facilityRepository;

    /** 원시 시계열(엔티티 그대로) */
    public List<PlantGeneration> getRawSeries(String plantId, LocalDate start, LocalDate end, int limit) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> list;
        if (plantId != null && !plantId.trim().isEmpty()) {
            list = repo.findByPlantIdAndDateBetweenOrderByDateAscHourAsc(plantId, s, e);
        } else {
            list = repo.findByDateBetweenOrderByDateAscHourAsc(s, e);
        }

        if (limit > 0 && list.size() > limit) {
            return list.subList(0, limit);
        }
        return list;
    }

    /** 최신 1건(엔티티) */
    public PlantGeneration getLatestEntity(String plantId) {
        if (plantId != null && !plantId.trim().isEmpty()) {
            return repo.findFirstByPlantIdOrderByDateDescHourDesc(plantId);
        } else {
            return repo.findFirstByOrderByDateDescHourDesc();
        }
    }

    /** 일별 합계 (kW를 1시간 간격으로 kWh 합산 가정) */
    public List<DailyTotal> getDaily(String plantId, LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        log.info("getDaily 호출: start={}, end={}", s, e);

        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, s, e);
        } else {
            rows = repo.findByDateBetween(s, e);
        }

        log.info("DB에서 조회된 데이터 수: {}", rows.size());

        Map<LocalDate, double[]> acc = new HashMap<>();
        LocalDate today = LocalDate.now();
        int currentHour = LocalTime.now().getHour();

        for (PlantGeneration r : rows) {
            LocalDate key = r.getDate();

            if (key.isEqual(today) && r.getHour() > currentHour) {
                continue;
            }

            acc.computeIfAbsent(key, k -> new double[3]);

            acc.get(key)[0] += r.getGeneration_Kw();
            acc.get(key)[1] += r.getForecast_Kwh();
            acc.get(key)[2] += r.getCapacity_Kw();
        }

        List<DailyTotal> result = acc.entrySet().stream()
                .map(en -> {
                    double genSum = en.getValue()[0];
                    double predSum = en.getValue()[1];
                    double capacitySum = en.getValue()[2];

                    double utilizationRate = capacitySum > 0 ? (genSum / capacitySum) * 100 : 0.0;

                    return DailyTotal.builder()
                            .date(en.getKey())
                            .genKwhTotal(genSum)
                            .predKwhTotal(predSum)
                            .utilizationRate(utilizationRate)
                            .build();
                })
                .sorted(Comparator.comparing(DailyTotal::getDate))
                .toList();

        log.info("최종 결과 데이터 수: {}", result.size());
        return result;
    }

    /** 주별 합계 (kW를 1시간 간격으로 kWh 합산 가정) */
    public List<WeeklyTotal> getWeekly(String plantId, LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(90);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, s, e);
        } else {
            rows = repo.findByDateBetween(s, e);
        }

        Map<String, double[]> weeklySums = rows.stream()
                .collect(Collectors.groupingBy(r -> {
                    int year = r.getDate().getYear();
                    int week = r.getDate().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
                    return year + "-" + week;
                }, Collectors.reducing(new double[2], r -> new double[] { r.getGeneration_Kw(), r.getForecast_Kwh() },
                        (a, b) -> new double[] { a[0] + b[0], a[1] + b[1] })));

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

    /** 월별 합계 (kW를 1시간 간격으로 kWh 합산 가정) */
    public List<MonthlyTotal> getMonthly(String plantId, LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(365);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, s, e);
        } else {
            rows = repo.findByDateBetween(s, e);
        }

        Map<String, double[]> monthlySums = rows.stream()
                .collect(Collectors.groupingBy(r -> r.getDate().getYear() + "-" + r.getDate().getMonthValue(),
                        Collectors.reducing(new double[2],
                                r -> new double[] { r.getGeneration_Kw(), r.getForecast_Kwh() },
                                (a, b) -> new double[] { a[0] + b[0], a[1] + b[1] })));

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

    /** 시간대 평균 (0~23시) */
    public List<HourlyAvg> getHourlyAvg(String plantId, LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, s, e);
        } else {
            rows = repo.findByDateBetween(s, e);
        }

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
            double genAvg = bucket[h][1] > 0 ? bucket[h][0] / bucket[h][1] : 0.0;
            double predAvg = bucket[h][3] > 0 ? bucket[h][2] / bucket[h][3] : 0.0;
            result.add(HourlyAvg.builder()
                    .hour(h)
                    .genKwAvg(genAvg)
                    .predKwhAvg(predAvg)
                    .build());
        }
        return result;
    }

    /** 시간대별 수소 생산량 */
    public List<HourlyHydrogenProductionDTO> getHourlyHydrogenProduction(LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        // 1. Facilities 테이블에서 secNominalKwhPerKg 값을 가져옵니다.
        Optional<Facility> facilityOpt = facilityRepository.findById(1L);
        if (facilityOpt.isEmpty()) {
            System.out.println("❌ Facilities 데이터 없음: facilityId=\"1\"");
            return new ArrayList<>();
        }

        double secNominalKwhPerKg = facilityOpt.get().getSpecKwh().doubleValue();
        System.out.println("✅ secNominalKwhPerKg: " + secNominalKwhPerKg);

        // 2. DB에서 모든 원시 데이터를 가져옵니다.
        List<PlantGeneration> rows = repo.findByDateBetween(s, e);
        System.out.println("전체 PlantGeneration 데이터 수: " + rows.size());

        // 3. 현재 시간 기준 필터링
        LocalDate today = LocalDate.now();
        int currentHour = LocalTime.now().getHour();

        // 4. Map을 사용하여 시간별 발전량의 합계를 누적합니다.
        Map<Integer, Double> hourlyGenSum = new HashMap<>();
        Map<Integer, Long> hourlyGenCount = new HashMap<>();

        for (PlantGeneration r : rows) {
            // 특정 발전소(plt001) 데이터만 필터링합니다.
            if ("plt001".equals(r.getPlantId())) {
                LocalDate dataDate = r.getDate();
                int hour = r.getHour();

                // 오늘 데이터인 경우 현재 시간 이후 데이터는 제외
                if (dataDate.isEqual(today) && hour > currentHour) {
                    continue;
                }

                hourlyGenSum.put(hour, hourlyGenSum.getOrDefault(hour, 0.0) + r.getGeneration_Kw());
                hourlyGenCount.put(hour, hourlyGenCount.getOrDefault(hour, 0L) + 1);
            }
        }

        System.out.println("plt001 필터링된 시간대 수: " + hourlyGenSum.size());
        System.out.println("현재 시간: " + currentHour + "시 (이후 데이터 제외됨)");

        // 5. 합산된 값을 바탕으로 시간대별 평균 수소 생산량을 계산합니다.
        List<HourlyHydrogenProductionDTO> result = new ArrayList<>();
        // 현재 시간까지만 계산 (19시 이후는 아예 제외)
        int maxHour = Math.min(23, currentHour);

        for (int h = 0; h <= maxHour; h++) {
            double averageGenKw = 0.0;
            if (hourlyGenCount.containsKey(h) && hourlyGenCount.get(h) > 0) {
                averageGenKw = hourlyGenSum.get(h) / hourlyGenCount.get(h);
            }

            // 수소 생산량 계산: 시간당 평균 발전량 / 수소 1kg당 전력 소비량
            double hydrogenKg = secNominalKwhPerKg > 0 ? (averageGenKw / secNominalKwhPerKg) : 0.0;

            result.add(HourlyHydrogenProductionDTO.builder()
                    .hour(h)
                    .hydrogenKg(hydrogenKg)
                    .build());
        }

        System.out.println("계산 완료 - 결과 데이터 수: " + result.size());
        System.out.println("===============================");
        return result;
    }

    /** 실시간 수소 생산량 비교 */
    public Double calculateRealTimeHydrogenComparison(String plantId) {
        LocalDate today = LocalDate.now();
        int currentHour = LocalTime.now().getHour();

        System.out.println("=== 실시간 수소 생산량 비교 ===");
        System.out.println("계산 날짜: " + today);
        System.out.println("현재 시간: " + currentHour + "시");

        // 임시로 secNominalKwhPerKg = 50 설정
        double secNominalKwhPerKg = 50.0;
        System.out.println("secNominalKwhPerKg (임시값): " + secNominalKwhPerKg);

        // 오늘 데이터 중 0시부터 현재 시간까지 조회
        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, today, today);
        } else {
            rows = repo.findByDateBetween(today, today);
        }

        // 현재 시간까지만 필터링 (0~현재시간)
        List<PlantGeneration> todayData = rows.stream()
                .filter(r -> r.getHour() <= currentHour)
                .collect(Collectors.toList());

        System.out.println("오늘 데이터 수: " + todayData.size());

        if (todayData.isEmpty()) {
            System.out.println("❌ 오늘 데이터가 없습니다.");
            return 0.0;
        }

        // 총 예측량과 총 발전량 계산
        double totalForecast = 0.0;
        double totalGeneration = 0.0;

        for (PlantGeneration data : todayData) {
            totalForecast += data.getForecast_Kwh();
            totalGeneration += data.getGeneration_Kw();
        }

        System.out.println("총 예측량: " + totalForecast);
        System.out.println("총 발전량: " + totalGeneration);

        // 수소 생산량 계산
        double forecastHydrogenProduction = totalForecast / secNominalKwhPerKg;
        double actualHydrogenProduction = totalGeneration / secNominalKwhPerKg;
        double hydrogenDifference = actualHydrogenProduction - forecastHydrogenProduction;

        System.out.println("예측 수소 생산량: " + forecastHydrogenProduction + " kg");
        System.out.println("현재 수소 생산량: " + actualHydrogenProduction + " kg");
        System.out.println("차이 (현재 - 예측): " + hydrogenDifference + " kg");
        System.out.println("========================");

        return hydrogenDifference;
    }

    /** 실시간 효율성 계산 */
    public Double calculateRealTimeEfficiency(String plantId) {
        LocalDate today = LocalDate.now();
        int currentHour = LocalTime.now().getHour();

        System.out.println("=== 실시간 효율성 계산 ===");
        System.out.println("계산 날짜: " + today);
        System.out.println("현재 시간: " + currentHour + "시");

        // 오늘 데이터 중 0시부터 현재 시간까지 조회
        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, today, today);
        } else {
            rows = repo.findByDateBetween(today, today);
        }

        // 현재 시간까지만 필터링 (0~현재시간)
        List<PlantGeneration> todayData = rows.stream()
                .filter(r -> r.getHour() <= currentHour)
                .collect(Collectors.toList());

        System.out.println("오늘 데이터 수: " + todayData.size());

        if (todayData.isEmpty()) {
            System.out.println("❌ 오늘 데이터가 없습니다.");
            return 0.0;
        }

        // 각 값들의 총합 계산
        double totalCapacity = 0.0;
        double totalForecast = 0.0;
        double totalGeneration = 0.0;
        int totalHours = 0;

        for (PlantGeneration data : todayData) {
            totalCapacity += data.getCapacity_Kw();
            totalForecast += data.getForecast_Kwh();
            totalGeneration += data.getGeneration_Kw();
            totalHours++;
        }

        System.out.println("총 설비용량: " + totalCapacity);
        System.out.println("총 예측량: " + totalForecast);
        System.out.println("총 발전량: " + totalGeneration);
        System.out.println("총 시간수: " + totalHours);

        // (capacity - forecast) - (capacity - (generation*시간))
        double firstPart = totalCapacity - totalForecast;
        double secondPart = totalCapacity - (totalGeneration * totalHours);
        double result = firstPart - secondPart;

        System.out.println("첫 번째 부분 (capacity - forecast): " + firstPart);
        System.out.println("두 번째 부분 (capacity - generation*시간): " + secondPart);
        System.out.println("최종 결과: " + result);
        System.out.println("========================");

        return result;
    }

    /** 대시보드 요약 정보 */
    public DashboardSummaryDTO getDashboardSummary(String plantId) {
        PlantGeneration latest;
        if (plantId != null && !plantId.trim().isEmpty()) {
            latest = repo.findFirstByPlantIdOrderByDateDescHourDesc(plantId);
        } else {
            latest = repo.findFirstByOrderByDateDescHourDesc();
        }

        if (latest == null) {
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

        double efficiency = (capacityKw > 0) ? (generationKw / capacityKw) * 100 : 0.0;

        return DashboardSummaryDTO.builder()
                .currentGenerationKw(generationKw)
                .currentForecastKwh(latest.getForecast_Kwh())
                .capacityKw(capacityKw)
                .idlePowerKw(idlePower)
                .conversionEfficiency(efficiency)
                .build();
    }

    /** 상세 데이터 페이징 조회 */
    public Page<PlantGeneration> getDetailedData(String plantId, LocalDate start, LocalDate end, int page, int size) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending().and(Sort.by("hour").descending()));

        if (plantId != null && !plantId.trim().isEmpty()) {
            return repo.findByPlantIdAndDateBetween(plantId, s, e, pageable);
        } else {
            return repo.findByDateBetween(s, e, pageable);
        }
    }

    /** 발전소 목록 조회 */
    public List<String> getPlantList() {
        return repo.findDistinctPlantIdByOrderByPlantIdAsc();
    }

    /** 특정 기간별 예측량/실제 발전량 합계 */
    public PeriodSummaryDTO getPeriodSummary(String plantId, LocalDate start, LocalDate end) {
        LocalDate s = (start != null) ? start : LocalDate.now().minusDays(30);
        LocalDate e = (end != null) ? end : LocalDate.now();

        List<PlantGeneration> rows;
        if (plantId != null && !plantId.trim().isEmpty()) {
            rows = repo.findByPlantIdAndDateBetween(plantId, s, e);
        } else {
            rows = repo.findByDateBetween(s, e);
        }

        if (rows.isEmpty()) {
            return PeriodSummaryDTO.builder()
                    .startDate(s)
                    .endDate(e)
                    .plantId(plantId)
                    .totalGenerationKwh(0.0)
                    .totalForecastKwh(0.0)
                    .accuracyRate(0.0)
                    .dataCount(0)
                    .build();
        }

        // 합계 계산
        double totalGeneration = rows.stream()
                .mapToDouble(PlantGeneration::getGeneration_Kw)
                .sum();

        double totalForecast = rows.stream()
                .mapToDouble(PlantGeneration::getForecast_Kwh)
                .sum();

        // 예측 정확도 계산 (실제/예측 * 100)
        double accuracyRate = 0.0;
        if (totalForecast > 0) {
            accuracyRate = (totalGeneration / totalForecast) * 100;
        }

        return PeriodSummaryDTO.builder()
                .startDate(s)
                .endDate(e)
                .plantId(plantId)
                .totalGenerationKwh(totalGeneration)
                .totalForecastKwh(totalForecast)
                .accuracyRate(accuracyRate)
                .dataCount(rows.size())
                .build();
    }
}