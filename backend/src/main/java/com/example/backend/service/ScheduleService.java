package com.example.backend.service;

import com.example.backend.dto.request.RequestScheduleDto;
import com.example.backend.dto.response.ResponseScheduleDto;
import com.example.backend.dto.response.paginate.PaginatedScheduleDto;

import com.example.backend.entity.Bus;
import com.example.backend.entity.Schedule;
import com.example.backend.entity.User;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.ScheduleRepository;
import com.example.backend.entity.Route;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.UserRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ScheduleService{

    private final ScheduleRepository repository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final UserRepo userRepo; // Add this

    @Autowired
    public ScheduleService(ScheduleRepository repository, BusRepository busRepository, RouteRepository routeRepository, UserRepo userRepo) {
        this.repository = repository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.userRepo = userRepo; // Initialize it
    }

    public PaginatedScheduleDto search(String searchText, int page, int size) { 
        Page<Schedule> schedulePage = repository
                .findByRouteContainingIgnoreCase(searchText, PageRequest.of(page, size)); 

        List<Schedule> schedules = schedulePage.getContent();
        long totalCount = schedulePage.getTotalElements();

        List<ResponseScheduleDto> dtoList = schedules.stream()
                .map(this::mapToDto) 
                .collect(Collectors.toList());

        return new PaginatedScheduleDto(dtoList, totalCount);
    }

    public Optional<ResponseScheduleDto> getSchedule(String id) { 
        return repository.findById(id).map(this::mapToDto); 
    }

    public ResponseScheduleDto addSchedule(RequestScheduleDto dto) {
        Bus bus = busRepository.findById(dto.getBusId())
                .orElseThrow(() -> new RuntimeException("Bus not found with ID: " + dto.getBusId()));

        Schedule schedule = new Schedule();

        // Auto-generate schedule number
        long count = repository.count() + 1;
        String scheduleNumber = String.format("SCH-%04d", count);
        schedule.setScheduleNumber(scheduleNumber);

        //schedule.setScheduleNumber(UUID.randomUUID().toString());
        
        Route route = routeRepository.findById(dto.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found: " + dto.getRouteId()));

        schedule.setBus(bus);
        schedule.setRoute(route);
        schedule.setDepartureTime(dto.getDepartureTime());
        schedule.setArrivalTime(dto.getArrivalTime());
        schedule.setDate(dto.getDate());
        schedule.setStatus(dto.getStatus());
        Schedule saveSchedule = repository.save(schedule);
        return mapToDto(saveSchedule);
    }

    public ResponseScheduleDto updateSchedule(String id, RequestScheduleDto dto) {
        
        Schedule existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found with ID: " + id));

        
        Bus bus = busRepository.findById(dto.getBusId())
                .orElseThrow(() -> new RuntimeException("Bus not found with ID: " + dto.getBusId()));
        existing.setBus(bus);

        Route route = routeRepository.findById(dto.getRouteId())
                .orElseThrow(() -> new RuntimeException("Route not found: " + dto.getRouteId()));
        existing.setRoute(route);

        existing.setDepartureTime(dto.getDepartureTime());
        existing.setArrivalTime(dto.getArrivalTime());
        existing.setDate(dto.getDate());
        //When a bus goes under maintenance it get removed from the schedule
        //and schedule's status become "need_reassignment". When admin assign a
        //New bus to the vacant schedule it's status automatically become "Upcoming"
        //Oshan (10/17)
        if("needs_reassignment".equalsIgnoreCase(dto.getStatus())){
            existing.setStatus("upcoming");
        }
        else {
            existing.setStatus(dto.getStatus());
        }

    
        Schedule saved = repository.save(existing);

        
        return mapToDto(saved);
    }

    public String deleteSchedule(String id) { 
        repository.deleteById(id);
        return "Schedule deleted successfully!"; 
    }

    public List<ResponseScheduleDto> getAllSchedules() {
    return repository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public List<ResponseScheduleDto> getDriverUpcomingSchedules(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Driver not found with username: " + username));
        Bus bus = busRepository.findBusesByDriverId(user.getId());
        System.out.println("bus id is "+ bus.getId());
        List<Schedule> schedules = repository.findByBusId(bus.getId());
        System.out.println(schedules);
        return schedules.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ResponseScheduleDto> getDriverOngoingSchedules(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Driver not found with username: " + username));
        Bus bus = busRepository.findBusesByDriverId(user.getId());
        System.out.println("bus id is "+ bus.getId());
        List<Schedule> schedules = repository.findOngoingSchedulesByDriverId(bus.getId());
        return schedules.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    //Methode for updating Schedule status when given busId Oshan (10/17)
    public void updateStatusByBusId(String busId,String newStatus){
        List<Schedule> schedules = repository.findAllByBusId(busId);

        if(schedules.isEmpty()){
            System.out.println("No Schedules found for Bus Id: "+ busId);
            return;
        }

        for(Schedule schedule: schedules){
            schedule.setStatus(newStatus);
            schedule.setBus(null);
        }
        repository.saveAll(schedules);
    }

    public PaginatedScheduleDto getSchedulesByStatus(String status, int page, int size) {
        Page<Schedule> schedulePage = repository.findByStatusIgnoreCase(status, PageRequest.of(page, size));

        List<ResponseScheduleDto> dtoList = schedulePage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new PaginatedScheduleDto(dtoList, schedulePage.getTotalElements());
    }


    private ResponseScheduleDto mapToDto(Schedule schedule) {
        ResponseScheduleDto responseDto = new ResponseScheduleDto();
        responseDto.setId(schedule.getScheduleNumber());
        responseDto.setDepartureTime(schedule.getDepartureTime());
        responseDto.setArrivalTime(schedule.getArrivalTime());
        responseDto.setDate(schedule.getDate());
        responseDto.setStatus(schedule.getStatus());

        if (schedule.getBus() != null) {
            responseDto.setBusId(schedule.getBus() != null ? schedule.getBus().getId() : null);
            responseDto.setBusNumber(schedule.getBus().getBusNumber());
        }
        if (schedule.getRoute() != null) {
            responseDto.setRouteId(schedule.getRoute() != null ? schedule.getRoute().getId() : null);
            responseDto.setRouteName(schedule.getRoute().getRouteName());
        }
        return responseDto;

    }
}


