package com.example.backend.service.impl;

import com.example.backend.dto.response.ResponseDashboardDto;
import com.example.backend.entity.MaintenanceLog;
import com.example.backend.entity.Trip;
import com.example.backend.repository.*;
import com.example.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private BusRepository busRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private RouteRepository routeRepo;
    @Autowired
    private ScheduleRepository scheduleRepo;
    @Autowired
    private TripRepo tripRepo;
    @Autowired
    private MaintenanceLogRepository maintenanceRepo;

    @Override
    public ResponseDashboardDto getDashboardStats(String period) {

        // --- Get all data ---
        List<Trip> trips = tripRepo.findAll();
        List<MaintenanceLog> maintenanceLogs = maintenanceRepo.findAll();

        // --- Determine date range ---
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (period.toLowerCase()) {
            case "this_month":
                YearMonth thisMonth = YearMonth.now();
                startDate = thisMonth.atDay(1);
                endDate = thisMonth.atEndOfMonth();
                break;
            case "last_month":
                YearMonth lastMonth = YearMonth.now().minusMonths(1);
                startDate = lastMonth.atDay(1);
                endDate = lastMonth.atEndOfMonth();
                break;
            case "today":
            default:
                startDate = today;
                endDate = today;
        }

        double totalIncome = trips.stream()
                .filter(t -> {
                    try {
                        LocalDate tripDate = LocalDate.parse(t.getDate());
                        return !tripDate.isBefore(startDate) && !tripDate.isAfter(endDate);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .mapToDouble(Trip::getIncome)
                .sum();

        double totalMaintenance = maintenanceLogs.stream()
                .filter(m -> {
                    try {
                        LocalDate mDate = LocalDate.parse(m.getMaintenanceDate());
                        return !mDate.isBefore(startDate) && !mDate.isAfter(endDate);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .mapToDouble(MaintenanceLog::getCost)
                .sum();

        System.out.println("Period: " + period);
        System.out.println("Start Date: " + startDate);
        System.out.println("End Date: " + endDate);
        System.out.println("Total Income (Filtered): " + totalIncome);
        System.out.println("Total Maintenance (Filtered): " + totalMaintenance);
        System.out.println("Profit: " + (totalIncome - totalMaintenance));

        long totalBuses = busRepo.count();
        long totalDrivers = userRepo.findByRolesContaining("DRIVER").size();
        long totalRoutes = routeRepo.count();
        long totalSchedules = scheduleRepo.count();
        long totalTrips = trips.size();

        double profit = totalIncome - totalMaintenance;

        return new ResponseDashboardDto(
                totalBuses,
                totalDrivers,
                totalRoutes,
                totalSchedules,
                totalTrips,
                totalIncome,
                totalMaintenance,
                profit
        );
    }
}

