package com.example.backend.service;

import com.example.backend.dto.request.LocationUpdateRequest;
import com.example.backend.dto.response.BusResponseDto;
import com.example.backend.dto.response.DriverLocationResponse;
import com.example.backend.entity.DriverLocation;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.DriverLocationRepository;
import com.example.backend.repository.UserRepo;
import com.example.backend.service.impl.BusServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final DriverLocationRepository locationRepository;
    private final BusRepository busRepository;
    private final UserRepo userRepo;

    @Transactional
    public DriverLocationResponse updateDriverLocation(String driverUsername, LocationUpdateRequest request) {
        try {
            Optional<DriverLocation> existingLocation = locationRepository.findByDriverUsername(driverUsername);
            BusServiceImpl busService = new BusServiceImpl(busRepository, userRepo);// Temporary instance to access static method
            String busNumber = busService.getBusNumberByUsername(driverUsername);
            DriverLocation location;
            if (existingLocation.isPresent()) {
                location = existingLocation.get();
                location.setLatitude(request.getLatitude());
                location.setLongitude(request.getLongitude());
                location.setAccuracy(request.getAccuracy());
                location.setStatus(request.getStatus());
                location.setBusNumber(busNumber);
                location.setTimestamp(LocalDateTime.now());
            } else {
                location = new DriverLocation(
                        driverUsername,
                        request.getLatitude(),
                        request.getLongitude(),
                        request.getAccuracy(),
                        request.getStatus(),
                        busNumber != null ? busNumber : "Not Assigned",
                        LocalDateTime.now()
                );
            }

            DriverLocation savedLocation = locationRepository.save(location);
            log.info("Updated location for driver: {} at coordinates ({}, {})",
                    driverUsername, request.getLatitude(), request.getLongitude());

            return convertToResponse(savedLocation);

        } catch (Exception e) {
            log.error("Error updating location for driver {}: {}", driverUsername, e.getMessage());
            throw new RuntimeException("Failed to update driver location: " + e.getMessage(), e);
        }
    }

    public List<DriverLocationResponse> getAllActiveDriverLocations() {
        try {
            List<DriverLocation> activeDrivers = locationRepository.findActiveDriversSortedByUpdate();
            log.info("Retrieved {} active driver locations", activeDrivers.size());
            return activeDrivers.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching active driver locations: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch driver locations: " + e.getMessage(), e);
        }
    }

    public List<DriverLocationResponse> getRecentDriverLocations(int minutesAgo) {
        try {
            LocalDateTime since = LocalDateTime.now().minusMinutes(minutesAgo);
            List<DriverLocation> recentLocations = locationRepository.findRecentLocations(since);
            log.info("Retrieved {} recent driver locations from last {} minutes",
                    recentLocations.size(), minutesAgo);
            return recentLocations.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching recent driver locations: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch recent driver locations: " + e.getMessage(), e);
        }
    }

    public Optional<DriverLocationResponse> getDriverLocation(String driverUsername) {
        try {
            Optional<DriverLocation> location = locationRepository.findByDriverUsername(driverUsername);
            if (location.isPresent()) {
                log.info("Retrieved location for driver: {}", driverUsername);
                return Optional.of(convertToResponse(location.get()));
            } else {
                log.warn("No location found for driver: {}", driverUsername);
                return Optional.empty();
            }
        } catch (Exception e) {
            log.error("Error fetching location for driver {}: {}", driverUsername, e.getMessage());
            throw new RuntimeException("Failed to fetch driver location: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void setDriverOffline(String driverUsername) {
        try {
            Optional<DriverLocation> locationOpt = locationRepository.findByDriverUsername(driverUsername);
            if (locationOpt.isPresent()) {
                DriverLocation location = locationOpt.get();
                location.setStatus("offline");
                location.setTimestamp(LocalDateTime.now());
                locationRepository.save(location);
                log.info("Set driver {} to offline status", driverUsername);
            } else {
                log.warn("Attempted to set offline status for non-existent driver: {}", driverUsername);
            }
        } catch (Exception e) {
            log.error("Error setting driver {} offline: {}", driverUsername, e.getMessage());
            throw new RuntimeException("Failed to set driver offline: " + e.getMessage(), e);
        }
    }

    public long getActiveDriverCount() {
        try {
            return locationRepository.findActiveDrivers().size();
        } catch (Exception e) {
            log.error("Error counting active drivers: {}", e.getMessage());
            return 0;
        }
    }

    private DriverLocationResponse convertToResponse(DriverLocation location) {
        return new DriverLocationResponse(
                location.getId(),
                location.getDriverUsername(),
                location.getLatitude(),
                location.getLongitude(),
                location.getAccuracy(),
                location.getStatus(),
                location.getBusNumber(),
                location.getTimestamp(),
                location.getUpdatedAt()
        );
    }
}
