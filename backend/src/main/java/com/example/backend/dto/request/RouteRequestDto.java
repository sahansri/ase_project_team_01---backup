// src/main/java/com/example/backend/dto/request/RouteRequestDto.java
package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RouteRequestDto {
    
    @NotBlank(message = "Route name is required")
    private String routeName;
    
    @NotBlank(message = "Starting point is required")
    private String startingPoint;
    
    @NotBlank(message = "Ending point is required")
    private String endingPoint;
    
    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be positive")
    private Double distance;
    
    // Default constructor
    public RouteRequestDto() {}
    
    // Constructor with parameters
    public RouteRequestDto(String routeName, String startingPoint, String endingPoint, Double distance) {
        this.routeName = routeName;
        this.startingPoint = startingPoint;
        this.endingPoint = endingPoint;
        this.distance = distance;
    }
    
    // Getters and Setters
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
}
