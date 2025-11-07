package com.example.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Document(collection = "driver_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocation {

    @Id
    private String id;

    @Indexed(unique = true)
    private String driverUsername;

    private Double latitude;

    private Double longitude;

    private Double accuracy;

    @Indexed
    private String status; // online, active, offline

    private String busNumber;

    private LocalDateTime timestamp;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public DriverLocation(String driverUsername, Double latitude, Double longitude, Double accuracy, String status,String busNumber, LocalDateTime timestamp) {
        this.driverUsername = driverUsername;
        this.latitude = latitude;
        this.longitude = longitude;
        this.accuracy = accuracy;
        this.status = status;
        this.busNumber = busNumber;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }
}
