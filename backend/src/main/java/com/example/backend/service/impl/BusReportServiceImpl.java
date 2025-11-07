//src/main/java/com/example/backend/service/impl/BusReportServiceImpl.java

package com.example.backend.service.impl;

import com.example.backend.dto.response.BusReportDto;
import com.example.backend.entity.Bus;
import com.example.backend.entity.Schedule;
import com.example.backend.entity.Trip;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.ScheduleRepository;
import com.example.backend.repository.TripRepo;
import com.example.backend.service.BusReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusReportServiceImpl implements BusReportService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private TripRepo tripRepository;

    @Override
    public BusReportDto getBusReport(String busNumber, String fromDate, String toDate) {
        // Find the bus by bus number
        Bus bus = busRepository.findByBusNumber(busNumber)
                .orElseThrow(() -> new RuntimeException("Bus not found with bus number: " + busNumber));

        // Get all schedules for this bus
        List<Schedule> schedules = scheduleRepository.findAll().stream()
                .filter(schedule -> schedule.getBus() != null && 
                        schedule.getBus().getId().equals(bus.getId()))
                .collect(Collectors.toList());

        // Get schedule IDs
        List<String> scheduleIds = schedules.stream()
                .map(Schedule::getScheduleNumber)
                .collect(Collectors.toList());

        // Get all trips for these schedules within the date range
        List<Trip> trips = tripRepository.findAll().stream()
                .filter(trip -> {
                    if (trip.getSchedule() == null) return false;
                    
                    String scheduleId = trip.getSchedule().getScheduleNumber();
                    String tripDate = trip.getDate();
                    
                    boolean isInSchedule = scheduleIds.contains(scheduleId);
                    boolean isInDateRange = isDateInRange(tripDate, fromDate, toDate);
                    
                    return isInSchedule && isInDateRange;
                })
                .collect(Collectors.toList());

        // Calculate total income
        int totalIncome = trips.stream()
                .mapToInt(Trip::getIncome)
                .sum();

        // Get route information from the first schedule (assuming all schedules have the same route)
        String routeName = schedules.isEmpty() ? "N/A" : 
                (schedules.get(0).getRoute() != null ? schedules.get(0).getRoute().getRouteName() : "N/A");

        // Build and return the report
        return BusReportDto.builder()
                .busId(bus.getId())
                .busNumber(bus.getBusNumber())
                .busModel(bus.getModel())
                .route(routeName)
                .totalSeats(bus.getCapacity())
                .driverName(bus.getDriver() != null ? bus.getDriver().getName() : "N/A")
                .status(bus.getStatus())
                .lastServiceDate("N/A") // You can add this field to Bus entity if needed
                .totalTrips(trips.size())
                .totalIncome(totalIncome)
                .fromDate(fromDate)
                .toDate(toDate)
                .build();
    }

    private boolean isDateInRange(String tripDate, String fromDate, String toDate) {
        if (tripDate == null) return false;
        
        // Simple string comparison (works for YYYY-MM-DD format)
        return tripDate.compareTo(fromDate) >= 0 && tripDate.compareTo(toDate) <= 0;
    }
}
