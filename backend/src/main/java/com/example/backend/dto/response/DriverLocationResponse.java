package com.example.backend.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverLocationResponse {
    private String id;
    private String driverUsername;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private String status;
    private String busNumber;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Constructor without id for convenience
    public DriverLocationResponse(String driverUsername, Double latitude, Double longitude,
                                  Double accuracy, String status, String busNumber,
                                  LocalDateTime timestamp, LocalDateTime updatedAt) {
        this.driverUsername = driverUsername;
        this.latitude = latitude;
        this.longitude = longitude;
        this.accuracy = accuracy;
        this.status = status;
        this.busNumber = busNumber;
        this.timestamp = timestamp;
        this.updatedAt = updatedAt;
    }
}
