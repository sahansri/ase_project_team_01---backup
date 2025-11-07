package com.example.backend.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class ResponseTripDto {
    private String id;
    private String scheduleId;
    private String scheduleNumber;
    private String busId;
    private String routeId;
    private String date;
    private String actualDepartureTime;
    private String actualArrivalTime;
    private int passengerCount;
    private int income;
}
