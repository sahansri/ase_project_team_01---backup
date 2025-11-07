// src/main/java/com/example/backend/dto/response/MonthlyIncomeDto.java
package com.example.backend.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlyIncomeDto {
    private String month; // Format: "YYYY-MM"
    private String monthName; // Format: "January 2025"
    private Integer totalIncome;
    private Integer totalTrips;
}