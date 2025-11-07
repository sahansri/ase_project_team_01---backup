
// src/main/java/com/example/backend/dto/response/BusResponseDto.java
package com.example.backend.dto.response;

import java.time.LocalDateTime;

public class BusResponseDto {
    private String id;
    private String busNumber;
    private Integer capacity;
    private String model;
    //(Oshan 10/05)
    private String status;
    private String driverId;
    private String driverName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String driverUserName;

    
    // Default constructor
    public BusResponseDto() {}
    
    // Constructor with all parameters
    public BusResponseDto(String id, String busNumber, Integer capacity, String model, String status,
                         String driverId, String driverName,
                         LocalDateTime createdAt, LocalDateTime updatedAt,String driverUserName) {
        this.id = id;
        this.busNumber = busNumber;
        this.capacity = capacity;
        this.model = model;
        //(Oshan 10/05)
        this.status = status;
        this.driverId = driverId;
        this.driverName = driverName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.driverUserName= driverUserName;

    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
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
    
    public String getDriverName() {
        return driverName;
    }
    
    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    //(Oshan 10/05)
    public void setStatus(String status){
        this.status = status;
    }

    public String getStatus(){
        return status;
    }

    public void setDriverUserName(String driverUserName){this.driverUserName=driverUserName;}

    public String getDriverUserName() {
        return driverUserName;
    }
}
