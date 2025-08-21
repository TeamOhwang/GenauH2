package com.project.controller;

import com.project.dto.RegionPriceDTO;
import com.project.service.RegionPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(value = "/api/region-price", produces = "application/json")
@RequiredArgsConstructor
public class RegionPriceController {

    private final RegionPriceService service;

    /** 1) 전체 목록 조회 */
    @GetMapping
    public ResponseEntity<?> listAll() {
        try {
            List<RegionPriceDTO> result = service.getAll();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorBody.put("error", "Internal Server Error");
            errorBody.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
        }
    }

    /** 2) 지역별 목록 조회: /api/region-price/by-region?region=서울 */
    @GetMapping("/by-region")
    public ResponseEntity<?> listByRegion(@RequestParam(required = false) String region) {
        try {
            if (region == null || region.trim().isEmpty()) {
                Map<String, Object> errorBody = new HashMap<>();
                errorBody.put("status", HttpStatus.BAD_REQUEST.value());
                errorBody.put("error", "Bad Request");
                errorBody.put("message", "region 파라미터는 필수입니다.");
                return ResponseEntity.badRequest().body(errorBody);
            }

            List<RegionPriceDTO> result = service.getByRegion(region.trim());
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorBody.put("error", "Internal Server Error");
            errorBody.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
        }
    }
}
