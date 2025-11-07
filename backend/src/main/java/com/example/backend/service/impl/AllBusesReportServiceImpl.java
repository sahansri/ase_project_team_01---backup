// src/main/java/com/example/backend/service/impl/AllBusesReportServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.dto.response.AllBusesReportDto;
import com.example.backend.dto.response.BusIncomeDto;
import com.example.backend.dto.response.MonthlyIncomeDto;
import com.example.backend.entity.Bus;
import com.example.backend.entity.Schedule;
import com.example.backend.entity.Trip;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.ScheduleRepository;
import com.example.backend.repository.TripRepo;
import com.example.backend.service.AllBusesReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AllBusesReportServiceImpl implements AllBusesReportService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private TripRepo tripRepository;

    @Override
    public AllBusesReportDto getAllBusesReport(String fromDate, String toDate) {
        // Get all buses
        List<Bus> allBuses = busRepository.findAll();
        
        // Get all trips within date range
        List<Trip> allTrips = tripRepository.findAll().stream()
                .filter(trip -> {
                    String tripDate = trip.getDate();
                    return tripDate != null && 
                           isDateInRange(tripDate, fromDate, toDate);
                })
                .collect(Collectors.toList());

        // Generate monthly income data
        List<MonthlyIncomeDto> monthlyIncomeData = generateMonthlyIncomeData(allTrips, fromDate, toDate);

        // Generate bus-wise income data
        List<BusIncomeDto> busIncomeData = generateBusIncomeData(allBuses, allTrips);

        // Calculate totals
        int totalIncome = allTrips.stream()
                .mapToInt(Trip::getIncome)
                .sum();
        
        int totalTrips = allTrips.size();

        return AllBusesReportDto.builder()
                .monthlyIncomeData(monthlyIncomeData)
                .busIncomeData(busIncomeData)
                .fromDate(fromDate)
                .toDate(toDate)
                .totalIncome(totalIncome)
                .totalTrips(totalTrips)
                .build();
    }

    private List<MonthlyIncomeDto> generateMonthlyIncomeData(List<Trip> trips, String fromDate, String toDate) {
        // Parse dates
        LocalDate startDate = LocalDate.parse(fromDate);
        LocalDate endDate = LocalDate.parse(toDate);

        // Create a map to store monthly data
        Map<String, MonthlyIncomeDto> monthlyDataMap = new TreeMap<>();

        // Initialize all months in the range with zero values
        YearMonth startMonth = YearMonth.from(startDate);
        YearMonth endMonth = YearMonth.from(endDate);
        
        YearMonth currentMonth = startMonth;
        while (!currentMonth.isAfter(endMonth)) {
            String monthKey = currentMonth.toString(); // YYYY-MM format
            String monthName = currentMonth.format(DateTimeFormatter.ofPattern("MMMM yyyy"));
            
            monthlyDataMap.put(monthKey, MonthlyIncomeDto.builder()
                    .month(monthKey)
                    .monthName(monthName)
                    .totalIncome(0)
                    .totalTrips(0)
                    .build());
            
            currentMonth = currentMonth.plusMonths(1);
        }

        // Populate with actual trip data
        for (Trip trip : trips) {
            if (trip.getDate() != null) {
                LocalDate tripDate = LocalDate.parse(trip.getDate());
                YearMonth tripMonth = YearMonth.from(tripDate);
                String monthKey = tripMonth.toString();

                if (monthlyDataMap.containsKey(monthKey)) {
                    MonthlyIncomeDto monthData = monthlyDataMap.get(monthKey);
                    monthData.setTotalIncome(monthData.getTotalIncome() + trip.getIncome());
                    monthData.setTotalTrips(monthData.getTotalTrips() + 1);
                }
            }
        }

        return new ArrayList<>(monthlyDataMap.values());
    }

    private List<BusIncomeDto> generateBusIncomeData(List<Bus> buses, List<Trip> allTrips) {
        List<BusIncomeDto> busIncomeList = new ArrayList<>();

        // Get all schedules
        List<Schedule> allSchedules = scheduleRepository.findAll();

        // Create a map of busId to schedule IDs
        Map<String, List<String>> busToScheduleMap = new HashMap<>();
        for (Schedule schedule : allSchedules) {
            if (schedule.getBus() != null) {
                String busId = schedule.getBus().getId();
                busToScheduleMap
                        .computeIfAbsent(busId, k -> new ArrayList<>())
                        .add(schedule.getScheduleNumber());
            }
        }

        // Calculate income for each bus
        for (Bus bus : buses) {
            List<String> scheduleIds = busToScheduleMap.getOrDefault(bus.getId(), new ArrayList<>());
            
            // Filter trips for this bus
            List<Trip> busTrips = allTrips.stream()
                    .filter(trip -> trip.getSchedule() != null && 
                                  scheduleIds.contains(trip.getSchedule().getScheduleNumber()))
                    .collect(Collectors.toList());

            int totalIncome = busTrips.stream()
                    .mapToInt(Trip::getIncome)
                    .sum();

            busIncomeList.add(BusIncomeDto.builder()
                    .busId(bus.getId())
                    .busNumber(bus.getBusNumber())
                    .busModel(bus.getModel())
                    .driverName(bus.getDriver() != null ? bus.getDriver().getName() : "N/A")
                    .totalTrips(busTrips.size())
                    .totalIncome(totalIncome)
                    .build());
        }

        // Sort by total income descending
        busIncomeList.sort((a, b) -> b.getTotalIncome().compareTo(a.getTotalIncome()));

        return busIncomeList;
    }

    private boolean isDateInRange(String tripDate, String fromDate, String toDate) {
        if (tripDate == null) return false;
        return tripDate.compareTo(fromDate) >= 0 && tripDate.compareTo(toDate) <= 0;
    }
}