// src/main/java/com/example/backend/dto/response/AllBusesReportDto.java
package com.example.backend.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AllBusesReportDto {
    private List<MonthlyIncomeDto> monthlyIncomeData;
    private List<BusIncomeDto> busIncomeData;
    private String fromDate;
    private String toDate;
    private Integer totalIncome;
    private Integer totalTrips;
}