
// src/main/java/com/example/backend/dto/response/RouteResponseDto.java
package com.example.backend.dto.response;

import java.time.LocalDateTime;

public class RouteResponseDto {
    private String id;
    private String routeName;
    private String startingPoint;
    private String endingPoint;
    private Double distance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public RouteResponseDto() {}
    
    // Constructor with all parameters
    public RouteResponseDto(String id, String routeName, String startingPoint, String endingPoint,
                           Double distance, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.routeName = routeName;
        this.startingPoint = startingPoint;
        this.endingPoint = endingPoint;
        this.distance = distance;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getRouteName() {
        return routeName;
    }
    
    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }
    
    public String getStartingPoint() {
        return startingPoint;
    }
    
    public void setStartingPoint(String startingPoint) {
        this.startingPoint = startingPoint;
    }
    
    public String getEndingPoint() {
        return endingPoint;
    }
    
    public void setEndingPoint(String endingPoint) {
        this.endingPoint = endingPoint;
    }
    
    public Double getDistance() {
        return distance;
    }
    
    public void setDistance(Double distance) {
        this.distance = distance;
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
}