

// src/main/java/com/example/backend/service/BusService.java
package com.example.backend.service;

import com.example.backend.dto.request.BusRequestDto;
import com.example.backend.dto.response.BusResponseDto;

import java.util.List;


public interface BusService {
    BusResponseDto createBus(BusRequestDto busRequestDto);
    List<BusResponseDto> getAllBuses();
    BusResponseDto getBusById(String id);
    BusResponseDto getBusByBusNumber(String busNumber);
    BusResponseDto updateBus(String id, BusRequestDto busRequestDto);
    void deleteBus(String id);
    List<BusResponseDto> searchBuses(String searchTerm, int page, int size);
    List<BusResponseDto> getBusesByCapacityRange(Integer minCapacity, Integer maxCapacity);
    List<BusResponseDto> getBusesWithoutDriver();
    List<BusResponseDto> getBusesByModel(String model);

    String getBusNumberByUsername(String username);
    //Service methode for changing bus status (Oshan 10/05)
    boolean  changeStatus(String id,String status);

    String getBusNumberForUsername(String username);

    List<BusResponseDto> getAvailableBuses();
}

