
// src/main/java/com/example/backend/service/impl/BusServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.dto.request.BusRequestDto;
import com.example.backend.dto.response.BusResponseDto;
import com.example.backend.entity.Bus;
import com.example.backend.entity.User;
import com.example.backend.repository.BusRepository;
import com.example.backend.repository.UserRepo;
import com.example.backend.service.BusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BusServiceImpl implements BusService {

    private final BusRepository busRepository;
    private final UserRepo userRepository;

    @Autowired
    public BusServiceImpl(BusRepository busRepository, UserRepo userRepository) {
        this.busRepository = busRepository;
        this.userRepository = userRepository;
    }

    @Override
    public BusResponseDto createBus(BusRequestDto busRequestDto) {
        // Check if bus number already exists
        if (busRepository.existsByBusNumber(busRequestDto.getBusNumber())) {
            throw new RuntimeException("Bus number already exists: " + busRequestDto.getBusNumber());
        }

        Bus bus = new Bus();
        bus.setBusNumber(busRequestDto.getBusNumber());
        bus.setCapacity(busRequestDto.getCapacity());
        bus.setModel(busRequestDto.getModel());

        // Set driver if provided
        if (busRequestDto.getDriverId() != null && !busRequestDto.getDriverId().isEmpty()) {
            User driver = userRepository.findById(busRequestDto.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + busRequestDto.getDriverId()));
            bus.setDriver(driver);
        }

        Bus savedBus = busRepository.save(bus);
        return convertToResponseDto(savedBus);
    }

    @Override
    public List<BusResponseDto> getAllBuses() {
        List<Bus> buses = busRepository.findAll();
        return buses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public BusResponseDto getBusById(String id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with ID: " + id));
        return convertToResponseDto(bus);
    }

    @Override
    public BusResponseDto getBusByBusNumber(String busNumber) {
        Bus bus = busRepository.findByBusNumber(busNumber)
                .orElseThrow(() -> new RuntimeException("Bus not found with bus number: " + busNumber));
        return convertToResponseDto(bus);
    }

    @Override
    public BusResponseDto updateBus(String id, BusRequestDto busRequestDto) {
        Bus existingBus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with ID: " + id));

        // Check if bus number is being changed and if new number already exists
        if (!existingBus.getBusNumber().equals(busRequestDto.getBusNumber()) &&
                busRepository.existsByBusNumber(busRequestDto.getBusNumber())) {
            throw new RuntimeException("Bus number already exists: " + busRequestDto.getBusNumber());
        }

        existingBus.setBusNumber(busRequestDto.getBusNumber());
        existingBus.setCapacity(busRequestDto.getCapacity());
        existingBus.setModel(busRequestDto.getModel());

        // Update driver
        if (busRequestDto.getDriverId() != null && !busRequestDto.getDriverId().isEmpty()) {
            User driver = userRepository.findById(busRequestDto.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Driver not found with ID: " + busRequestDto.getDriverId()));
            existingBus.setDriver(driver);
        } else {
            existingBus.setDriver(null);
        }

        existingBus.updateTimestamp();
        Bus updatedBus = busRepository.save(existingBus);
        return convertToResponseDto(updatedBus);
    }

    @Override
    public void deleteBus(String id) {
        if (!busRepository.existsById(id)) {
            throw new RuntimeException("Bus not found with ID: " + id);
        }
        busRepository.deleteById(id);
    }

    @Override
    public List<BusResponseDto> searchBuses(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Bus> busPage = busRepository.findByBusNumberContainingIgnoreCaseOrModelContainingIgnoreCase(
                searchTerm, searchTerm, pageable
        );

        return busPage.getContent().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BusResponseDto> getBusesByCapacityRange(Integer minCapacity, Integer maxCapacity) {
        List<Bus> buses;

        if (minCapacity != null && maxCapacity != null) {
            buses = busRepository.findByCapacityBetween(minCapacity, maxCapacity);
        } else if (minCapacity != null) {
            buses = busRepository.findByCapacityGreaterThanEqual(minCapacity);
        } else if (maxCapacity != null) {
            buses = busRepository.findByCapacityLessThanEqual(maxCapacity);
        } else {
            buses = busRepository.findAll();
        }

        return buses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BusResponseDto> getBusesWithoutDriver() {
        List<Bus> buses = busRepository.findBusesWithoutDriver();
        return buses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BusResponseDto> getBusesByModel(String model) {
        List<Bus> buses = busRepository.findByModelContainingIgnoreCase(model);
        return buses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    //Service implementation for change status (Oshan 10/05)
    @Override
    public boolean  changeStatus(String id,String status){
        Optional<Bus> optionalBus = busRepository.findById(id);

        if (optionalBus.isPresent()) {
            Bus bus = optionalBus.get();
            bus.setStatus(status); //"Available" or "Unavailable"
            busRepository.save(bus);
            return true; // update successful
        } else {
            return false; // bus not found
        }
    }
    //Service implementation for get bus number by username (sahan 10/13)
    @Override
    public String getBusNumberByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Bus buses = busRepository.findBusesByDriverId(user.getId());
        System.out.println(user.getUsername());
        System.out.println(buses.getBusNumber());
        if (buses==null) {
            throw new RuntimeException("No bus assigned to this user");
        }
        return buses.getBusNumber();
//        return buses.stream()
//                .map(this::convertToResponseDto)
//                .collect(Collectors.toList()); // Assuming one bus per driver
    }

    /**
     * Convert Bus entity to BusResponseDto
     */

    //service implementation for get busnumber by username oshan(10/14)
    @Override
    public String getBusNumberForUsername(String username){
        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            System.out.println("No user found for username: " + username);
            return null;
        }

        Bus bus = busRepository.findBusesByDriverId(user.getId());
        if (bus == null) {
            System.out.println("No bus assigned to user: " + username);
            return null;
        }

        return bus.getBusNumber();
    }

    @Override
    public List<BusResponseDto> getAvailableBuses(){
        List<Bus> buses = busRepository.findByStatus("Available");
        return buses.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

    }


    private BusResponseDto convertToResponseDto(Bus bus) {
        BusResponseDto responseDto = new BusResponseDto();
        responseDto.setId(bus.getId());
        responseDto.setBusNumber(bus.getBusNumber());
        responseDto.setCapacity(bus.getCapacity());
        responseDto.setModel(bus.getModel());
        //(Oshan 10/05)
        responseDto.setStatus(bus.getStatus());
        responseDto.setCreatedAt(bus.getCreatedAt());
        responseDto.setUpdatedAt(bus.getUpdatedAt());

        // Set driver information
        if (bus.getDriver() != null) {
            responseDto.setDriverId(bus.getDriver().getId());
            responseDto.setDriverName(bus.getDriver().getName());
            responseDto.setDriverUserName(bus.getDriver().getUsername());
        }

        return responseDto;
    }

}


