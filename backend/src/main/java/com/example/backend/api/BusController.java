// src/main/java/com/example/backend/api/BusController.java
package com.example.backend.api;

import com.example.backend.dto.request.BusRequestDto;
import com.example.backend.dto.response.BusResponseDto;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.BusService;
import com.example.backend.util.StandardResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/buses")
//@CrossOrigin(origins = "*")
public class BusController {

    private final BusService busService;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    public BusController(BusService busService) {
        this.busService = busService;
    }

    /**
     * Create a new bus
     */
    @PostMapping("/create-bus")
    public ResponseEntity<StandardResponseDto> createBus(
            @Valid
            @RequestBody BusRequestDto busRequestDto,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        if (!roles.contains("ADMIN")) {
            return new ResponseEntity<>(
                    new StandardResponseDto(
                            "Not authorized", 402, null
                    ), HttpStatus.FORBIDDEN
            );
        }
        busService.createBus(busRequestDto);
        return new ResponseEntity<>(
                new StandardResponseDto(
                        "bus created", 201, null
                ), HttpStatus.CREATED
        );
    }

    /**
     * Get all buses
     */
    @GetMapping("/get-all-buses")
    public ResponseEntity<List<BusResponseDto>> getAllBuses(
            @Valid
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        List<BusResponseDto> buses = busService.getAllBuses();
        return ResponseEntity.ok(buses);
    }

    /**
     * Get bus by ID
     */
    @GetMapping("/get-bus/{id}")
    public ResponseEntity<BusResponseDto> getBusById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        BusResponseDto bus = busService.getBusById(id);
        return ResponseEntity.ok(bus);
    }

    /**
     * Get bus by bus number
     */
    @GetMapping("/number/{busNumber}")
    public ResponseEntity<BusResponseDto> getBusByBusNumber(
            @PathVariable String busNumber
    ) {
        BusResponseDto bus = busService.getBusByBusNumber(busNumber);
        return ResponseEntity.ok(bus);
    }

    /**
     * Update bus
     */
    @PutMapping("/update-bus/{id}")
    public ResponseEntity<BusResponseDto> updateBus(
            @PathVariable String id,
            @Valid @RequestBody BusRequestDto busRequestDto) {
        BusResponseDto updatedBus = busService.updateBus(id, busRequestDto);
        return ResponseEntity.ok(updatedBus);
    }

    /**
     * Delete bus
     */
    @DeleteMapping("/delete-bus/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable String id) {
        busService.deleteBus(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search buses
     */
    @GetMapping("/search")
    public ResponseEntity<List<BusResponseDto>> searchBuses(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        List<BusResponseDto> buses = busService.searchBuses(searchTerm, page, size);
        return ResponseEntity.ok(buses);
    }

    /**
     * Get buses by capacity range
     */
    @GetMapping("/capacity")
    public ResponseEntity<List<BusResponseDto>> getBusesByCapacityRange(
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity) {
        List<BusResponseDto> buses = busService.getBusesByCapacityRange(minCapacity, maxCapacity);
        return ResponseEntity.ok(buses);
    }

    /**
     * Get buses without driver
     */
    @GetMapping("/without-driver")
    public ResponseEntity<List<BusResponseDto>> getBusesWithoutDriver() {
        List<BusResponseDto> buses = busService.getBusesWithoutDriver();
        return ResponseEntity.ok(buses);
    }

    /**
     * Get buses by model
     */
    @GetMapping("/model/{model}")
    public ResponseEntity<List<BusResponseDto>> getBusesByModel(@PathVariable String model) {
        List<BusResponseDto> buses = busService.getBusesByModel(model);
        return ResponseEntity.ok(buses);
    }


    /**
     * Get buses by driver username(duhun)
     */
    @GetMapping("/driver/{username}")
    public ResponseEntity<BusResponseDto> getBusByDriverUsername(@PathVariable String username) {
        try {
            String busNumber = busService.getBusNumberByUsername(username);
            BusResponseDto bus = busService.getBusByBusNumber(busNumber);
            return ResponseEntity.ok(bus);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    //controller for get available(Not under maintenance) buses Oshan(10/17)
    @GetMapping("/get-available-buses")
    public ResponseEntity<List<BusResponseDto>> getAvailableBuses() {
        List<BusResponseDto> buses = busService.getAvailableBuses();

        if (buses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(buses);
    }
}

