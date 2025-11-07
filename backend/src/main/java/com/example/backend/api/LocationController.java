package com.example.backend.api;

import com.example.backend.dto.request.LocationUpdateRequest;
import com.example.backend.dto.response.DriverLocationResponse;
import com.example.backend.repository.BusRepository;
import com.example.backend.service.LocationService;
import com.example.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Set;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
//@CrossOrigin(origins = "*")
@Slf4j
public class LocationController {

    private final LocationService locationService;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/driver/location")
    public ResponseEntity<ApiResponse<DriverLocationResponse>> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @RequestHeader("Authorization") String authHeader
    ){
        try {
            String token = authHeader.replace("Bearer ", "");
            String driverUsername = jwtUtil.getUsername(token);
            System.out.println(driverUsername);
            log.info("Location update request from driver: {}", driverUsername);

            DriverLocationResponse response = locationService.updateDriverLocation(driverUsername, request);
            System.out.println(response);
            return ResponseEntity.ok(new ApiResponse<>(
                    "Location updated successfully",
                    true,
                    response,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error updating driver location: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to update location: " + e.getMessage(),
                            false,
                            null,
                            LocalDateTime.now()
                    ));
        }
    }

    @GetMapping("/admin/driver-locations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DriverLocationResponse>>> getAllDriverLocations() {
        try {
            List<DriverLocationResponse> locations = locationService.getAllActiveDriverLocations();
            log.info("Admin fetched {} driver locations", locations.size());

            return ResponseEntity.ok(new ApiResponse<>(
                    "Driver locations retrieved successfully",
                    true,
                    locations,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error fetching driver locations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to fetch driver locations: " + e.getMessage(),
                            false,
                            null,
                            LocalDateTime.now()
                    ));
        }
    }

    @GetMapping("/admin/driver-locations/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DriverLocationResponse>>> getRecentDriverLocations(
            @RequestParam(defaultValue = "30") int minutes) {
        try {
            List<DriverLocationResponse> locations = locationService.getRecentDriverLocations(minutes);
            log.info("Admin fetched {} recent driver locations from last {} minutes",
                    locations.size(), minutes);

            return ResponseEntity.ok(new ApiResponse<>(
                    String.format("Recent driver locations from last %d minutes retrieved successfully", minutes),
                    true,
                    locations,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error fetching recent driver locations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to fetch recent driver locations: " + e.getMessage(),
                            false,
                            null,
                            LocalDateTime.now()
                    ));
        }
    }

    @GetMapping("/admin/driver-locations/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DriverLocationResponse>> getDriverLocation(
            @PathVariable String username) {
        try {
            Optional<DriverLocationResponse> location = locationService.getDriverLocation(username);

            if (location.isPresent()) {
                return ResponseEntity.ok(new ApiResponse<>(
                        "Driver location retrieved successfully",
                        true,
                        location.get(),
                        LocalDateTime.now()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                "Driver location not found",
                                false,
                                null,
                                LocalDateTime.now()
                        ));
            }
        } catch (Exception e) {
            log.error("Error fetching driver location for {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to fetch driver location: " + e.getMessage(),
                            false,
                            null,
                            LocalDateTime.now()
                    ));
        }
    }

    @PostMapping("/driver/offline")
    public ResponseEntity<ApiResponse<String>> setDriverOffline(
            @RequestHeader("Authorization") String authHeader
    ){
        try {
            String token = authHeader.replace("Bearer ", "");
            String driverUsername = jwtUtil.getUsername(token);
            locationService.setDriverOffline(driverUsername);

            return ResponseEntity.ok(new ApiResponse<>(
                    "Driver status set to offline successfully",
                    true,
                    "offline",
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error setting driver offline: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            "Failed to set driver offline: " + e.getMessage(),
                            false,
                            null,
                            LocalDateTime.now()
                    ));
        }
    }

    @GetMapping("/admin/driver-locations/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getActiveDriverCount() {
        try {
            long count = locationService.getActiveDriverCount();

            return ResponseEntity.ok(new ApiResponse<>(
                    "Active driver count retrieved successfully",
                    true,
                    count,
                    LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Error getting active driver count: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            "Failed to get active driver count: " + e.getMessage(),
                            false,
                            0L,
                            LocalDateTime.now()
                    ));
        }
    }
}

// Generic API Response class
class ApiResponse<T> {
    private String message;
    private boolean success;
    private T data;
    private LocalDateTime timestamp;

    public ApiResponse(String message, boolean success, T data, LocalDateTime timestamp) {
        this.message = message;
        this.success = success;
        this.data = data;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
