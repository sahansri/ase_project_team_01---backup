package com.example.backend.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ResponseScheduleDto {
    private String id;
    private String busId;
    private String busNumber;
    private String routeId;
    private String routeName;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private LocalDate date;
    private String status;
}

