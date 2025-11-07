package com.example.backend.api;

import com.example.backend.dto.response.ResponseDashboardDto;
import com.example.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

//@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseDashboardDto getDashboard(@RequestParam(defaultValue = "today") String period) {
        return dashboardService.getDashboardStats(period);
    }
}

