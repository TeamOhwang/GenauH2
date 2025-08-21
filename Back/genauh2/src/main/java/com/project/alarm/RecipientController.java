package com.project.alarm;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 필요 시 CORS 열기: @CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"})
@RestController
@RequestMapping("/alert")
@RequiredArgsConstructor
public class RecipientController {

    private final RecipientService recipientService;

    @PostMapping("/recipient")
    public ResponseEntity<Void> setRecipient(@RequestBody RecipientReq req) {
        recipientService.setEmail(req.getEmail());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class RecipientReq {
        private String email; // 프론트에서 전달할 수신 이메일
    }
}
