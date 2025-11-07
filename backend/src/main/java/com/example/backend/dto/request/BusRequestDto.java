// src/main/java/com/example/backend/dto/request/BusRequestDto.java
package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class BusRequestDto {
    
    @NotBlank(message = "Bus number is required")
    private String busNumber;
    
    @NotNull(message = "Capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer capacity;
    
    @NotBlank(message = "Model is required")
    private String model;

    //(Oshan) 10/05
    private String status;
    
    private String driverId;

    // Default constructor
    public BusRequestDto() {}
    
    // Constructor with parameters
    public BusRequestDto(String busNumber, Integer capacity, String model,String status ,String driverId) {
        this.busNumber = busNumber;
        this.capacity = capacity;
        this.model = model;
        this.status = status;
        this.driverId = driverId;
    }
    
    // Getters and Setters
    public String getBusNumber() {
        return busNumber;
    }
    
    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    
    public String getModel() {
        return model;
    }
    
    public void setModel(String model) {
        this.model = model;
    }
    
    public String getDriverId() {
        return driverId;
    }
    
    public void setDriverId(String driverId) {
        this.driverId = driverId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

