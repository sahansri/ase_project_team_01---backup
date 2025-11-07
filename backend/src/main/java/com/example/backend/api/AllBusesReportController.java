// src/main/java/com/example/backend/api/AllBusesReportController.java
package com.example.backend.api;

import com.example.backend.dto.response.AllBusesReportDto;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.AllBusesReportService;
import com.example.backend.util.StandardResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/all-buses-report")
public class AllBusesReportController {

    @Autowired
    private AllBusesReportService allBusesReportService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<StandardResponseDto> getAllBusesReport(
            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);

        if (!roles.contains("ADMIN")) {
            return new ResponseEntity<>(
                    new StandardResponseDto("Not authorized - Admin access required", 403, null),
                    HttpStatus.FORBIDDEN
            );
        }

        try {
            AllBusesReportDto report = allBusesReportService.getAllBusesReport(fromDate, toDate);
            return new ResponseEntity<>(
                    new StandardResponseDto("All buses report retrieved successfully", 200, report),
                    HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                    new StandardResponseDto("Error: " + e.getMessage(), 500, null),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}