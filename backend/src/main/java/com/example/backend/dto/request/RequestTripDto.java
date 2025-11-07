package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class RequestTripDto {
    private String scheduleId;
    private String date;
    private String actualDepartureTime;
    private String actualArrivalTime;
    private int passengerCount;
    private int income;
}
