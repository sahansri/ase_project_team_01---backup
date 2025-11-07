package com.example.backend.service.impl;

import com.example.backend.dto.request.RequestTripDto;
import com.example.backend.dto.response.ResponseTripDto;
import com.example.backend.dto.response.paginate.PaginatedTripDto;
import com.example.backend.entity.Schedule;
import com.example.backend.entity.Trip;
import com.example.backend.exception.EntryNotFoundException;
import com.example.backend.repository.ScheduleRepository;
import com.example.backend.repository.TripRepo;
import com.example.backend.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.Collections;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripServiceImpl implements TripService {

    @Autowired
    private TripRepo tripRepo;

    @Autowired
    private ScheduleRepository scheduleRepo;

    @Override
    public String saveTrip(RequestTripDto requestTripDto) {
        Schedule schedule = scheduleRepo.findById(requestTripDto.getScheduleId())
                .orElseThrow(() -> new EntryNotFoundException("Schedule not found with id: " + requestTripDto.getScheduleId()));

        Trip trip = Trip.builder()
                .schedule(schedule)
                .date(requestTripDto.getDate())
                .actualDepartureTime(requestTripDto.getActualDepartureTime())
                .actualArrivalTime(requestTripDto.getActualArrivalTime())
                .passengerCount(requestTripDto.getPassengerCount())
                .income(requestTripDto.getIncome())
                .build();

        tripRepo.save(trip);
        return trip.getId();
    }

    @Override
    public List<ResponseTripDto> getAllTrips() {
        List<Trip> trips = tripRepo.findAll();
        return trips.stream()
                .map(this::toResponseTripDto)
                .collect(Collectors.toList());
    }

    @Override
    public String updateTrip(RequestTripDto requestTripDto, String id) {
        Trip trip = tripRepo.findById(id)
                .orElseThrow(() -> new EntryNotFoundException("Trip not found with id: " + id));

        Schedule schedule = scheduleRepo.findById(requestTripDto.getScheduleId())
                .orElseThrow(() -> new EntryNotFoundException("Schedule not found with id: " + requestTripDto.getScheduleId()));

        trip.setSchedule(schedule);
        trip.setDate(requestTripDto.getDate());
        trip.setActualDepartureTime(requestTripDto.getActualDepartureTime());
        trip.setActualArrivalTime(requestTripDto.getActualArrivalTime());
        trip.setPassengerCount(requestTripDto.getPassengerCount());
        trip.setIncome(requestTripDto.getIncome());

        Trip updatedTrip = tripRepo.save(trip);
        return updatedTrip.getId();
    }

    @Override
    public String deleteTrip(String id) {
        if (!tripRepo.existsById(id)) {
            throw new EntryNotFoundException("Trip not found with id: " + id);
        }
        tripRepo.deleteById(id);
        return "Trip deleted successfully with id: " + id;
    }

    @Override
    public PaginatedTripDto search(String searchText, int page, int size) {
        Page<Trip> tripPage = tripRepo.searchAll(searchText, PageRequest.of(page, size));

        return PaginatedTripDto.builder()
                .dataList(tripPage.stream()
                        .map(this::toResponseTripDto)
                        .collect(Collectors.toList()))
                .count(tripPage.getTotalElements())
                .build();
    }

    // TripServiceImpl.java - Updated searchDriverTrips method only
// No changes to repositories needed!

    @Override
    public PaginatedTripDto searchDriverTrips(String driverId, String searchText, int page, int size) {

        // 1️⃣ Get ALL schedules from database
        List<Schedule> allSchedules = scheduleRepo.findAll();
        System.out.println("Total schedules in DB: " + allSchedules.size());

        // 2️⃣ Filter schedules where the bus driver matches our driverId
        List<String> scheduleIds = allSchedules.stream()
                .filter(schedule -> {
                    if (schedule.getBus() != null && schedule.getBus().getDriver() != null) {
                        String scheduleDriverId = schedule.getBus().getDriver().getId();
                        System.out.println("Checking schedule: " + schedule.getScheduleNumber() +
                                ", driver: " + scheduleDriverId +
                                ", matches: " + scheduleDriverId.equals(driverId));
                        return scheduleDriverId.equals(driverId);
                    }
                    return false;
                })
                .map(Schedule::getScheduleNumber)
                .collect(Collectors.toList());

        System.out.println("Filtered schedule IDs for driver " + driverId + ": " + scheduleIds);

        if (scheduleIds.isEmpty()) {
            return PaginatedTripDto.builder()
                    .dataList(Collections.emptyList())
                    .count(0)
                    .build();
        }

        // 3️⃣ Get trips for those schedules
        Page<Trip> tripPage = tripRepo.findAllByScheduleIds(scheduleIds, PageRequest.of(page, size));

        System.out.println("Found " + tripPage.getTotalElements() + " trips");

        // 4️⃣ Convert to DTOs
        List<ResponseTripDto> trips = tripPage.stream()
                .map(this::toResponseTripDto)
                .collect(Collectors.toList());

        return PaginatedTripDto.builder()
                .dataList(trips)
                .count(tripPage.getTotalElements())
                .build();
    }



    @Override
    public ResponseTripDto findById(String id) {
        Trip trip = tripRepo.findById(id)
                .orElseThrow(() -> new EntryNotFoundException("Trip not found with id: " + id));
        return toResponseTripDto(trip);
    }

    private ResponseTripDto toResponseTripDto(Trip trip) {
        if (trip == null) {
            return null;
        }

        Schedule schedule = trip.getSchedule();

        return ResponseTripDto.builder()
                .id(trip.getId())
                .scheduleId(schedule != null ? schedule.getScheduleNumber() : null)
                .scheduleNumber(schedule != null ? schedule.getScheduleNumber() : "N/A")
                .busId(schedule != null && schedule.getBus() != null
                        ? schedule.getBus().getBusNumber()
                        : "N/A")
                .routeId(schedule != null && schedule.getRoute() != null
                        ? schedule.getRoute().getRouteName()
                        : "N/A")
                .date(trip.getDate())
                .actualDepartureTime(trip.getActualDepartureTime())
                .actualArrivalTime(trip.getActualArrivalTime())
                .passengerCount(trip.getPassengerCount())
                .income(trip.getIncome())
                .build();
    }
}