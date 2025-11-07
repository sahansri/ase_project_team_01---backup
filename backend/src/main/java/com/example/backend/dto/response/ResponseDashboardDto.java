package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResponseDashboardDto {
    private long totalBuses;
    private long totalDrivers;
    private long totalRoutes;
    private long totalSchedules;
    private long totalTrips;
    private double totalIncome;
    private double totalMaintenanceCost;
    private double totalProfit;
}

