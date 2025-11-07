package com.example.backend.api;

import java.util.List;
import java.util.Set;

import com.example.backend.dto.response.BusResponseDto;
import com.example.backend.dto.response.paginate.PaginatedScheduleDto;
import com.example.backend.service.BusService;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;

import com.example.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.RequestScheduleDto;
import com.example.backend.dto.response.ResponseScheduleDto;
import com.example.backend.entity.Schedule;
import com.example.backend.service.ScheduleService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final BusService busService;
    private final NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/getall")
    public List<ResponseScheduleDto> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/getone/{id}")
    public ResponseEntity<ResponseScheduleDto> getOne(@PathVariable String id) { 
        return scheduleService.getSchedule(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseScheduleDto> create(
        @RequestBody RequestScheduleDto dto,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        ResponseScheduleDto result = scheduleService.addSchedule(dto);
        BusResponseDto bus = busService.getBusByBusNumber(result.getBusNumber());
        String driverUsername = bus.getDriverUserName();
        notificationService.sendInfo(
                driverUsername,
                "New Schedule Created!",
                "New Schedule has been Created for Your bus "+bus.getBusNumber());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseScheduleDto> update(@PathVariable String id, @RequestBody RequestScheduleDto dto) {
        ResponseScheduleDto updated = scheduleService.updateSchedule(id, dto);
        BusResponseDto bus = busService.getBusByBusNumber(updated.getBusNumber());
        String driverUsername = bus.getDriverUserName();
        if(updated.getStatus().equalsIgnoreCase("upcoming")) {
            notificationService.sendInfo(
                    driverUsername,
                    "Schedule updated!",
                    "Schedule has been updated for Your bus " + bus.getBusNumber());
        } else if (updated.getStatus().equalsIgnoreCase("ongoing")) {
            notificationService.sendInfo(
                    "admin",
                    "Bus "+bus.getBusNumber()+" Started Trip!",
                    "Bus "+bus.getBusNumber()+" Started journey at "+ updated.getRouteName()
            );

        }

        return ResponseEntity.ok(updated);

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedScheduleDto> searchSchedules(
            @RequestParam String searchText,
            @RequestParam int page,
            @RequestParam int size
    ) {
        PaginatedScheduleDto results = scheduleService.search(searchText, page, size);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<PaginatedScheduleDto> getSchedulesByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PaginatedScheduleDto result = scheduleService.getSchedulesByStatus(status, page, size);
        return ResponseEntity.ok(result);
    }


    @GetMapping("/driver/upcoming")
    public ResponseEntity<List<ResponseScheduleDto>> getDriverUpcomingSchedules(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.getUsername(token);
        List<ResponseScheduleDto> schedules = scheduleService.getDriverUpcomingSchedules(username);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/driver/ongoing")
    public ResponseEntity<List<ResponseScheduleDto>> getDriverOngoingSchedules(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.getUsername(token);
        List<ResponseScheduleDto> schedules = scheduleService.getDriverOngoingSchedules(username);
        return ResponseEntity.ok(schedules);
    }


}
