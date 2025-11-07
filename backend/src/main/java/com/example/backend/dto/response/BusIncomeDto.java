// src/main/java/com/example/backend/dto/response/BusIncomeDto.java
package com.example.backend.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BusIncomeDto {
    private String busId;
    private String busNumber;
    private String busModel;
    private String driverName;
    private Integer totalTrips;
    private Integer totalIncome;
}