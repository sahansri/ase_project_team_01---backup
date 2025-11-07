package com.example.backend.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RequestScheduleDto {
    private String busId;
    private String routeId;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private LocalDate date;
    private String status;
}
