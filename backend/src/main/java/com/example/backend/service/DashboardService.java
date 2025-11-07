package com.example.backend.service;

import com.example.backend.dto.response.ResponseDashboardDto;

public interface DashboardService {
    ResponseDashboardDto getDashboardStats(String period);
}
