//src/main/java/com/example/backend/api/BusReportController.java

package com.example.backend.api;

import com.example.backend.dto.response.BusReportDto;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.BusReportService;
import com.example.backend.util.StandardResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/bus-report")
public class BusReportController {

    @Autowired
    private BusReportService busReportService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/{busNumber}")
    public ResponseEntity<StandardResponseDto> getBusReport(
            @PathVariable String busNumber,
            @RequestParam String fromDate,
            @RequestParam String toDate,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println("roles: " + roles);
        if (!roles.contains("ADMIN")) {
            return new ResponseEntity<>(
                    new StandardResponseDto("Not authorized", 403, null),
                    HttpStatus.FORBIDDEN
            );
        }

        try {
            BusReportDto report = busReportService.getBusReport(busNumber, fromDate, toDate);
            return new ResponseEntity<>(
                    new StandardResponseDto("Bus report retrieved successfully", 200, report),
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