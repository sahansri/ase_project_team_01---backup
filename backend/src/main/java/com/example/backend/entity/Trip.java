package com.example.backend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "trip")

public class Trip {
    @Id
    private String id;

    @DBRef
    private Schedule schedule;

    private String date;
    private String actualDepartureTime;
    private String actualArrivalTime;
    private int passengerCount;
    private int income;
}
