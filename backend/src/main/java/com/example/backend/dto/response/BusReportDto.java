//src/main/java/com/example/backend/dto/response/BusReportDto.java

package com.example.backend.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BusReportDto {
    private String busId;
    private String busNumber;
    private String busModel;
    private String route;
    private Integer totalSeats;
    private String driverName;
    private String status;
    private String lastServiceDate;
    private Integer totalTrips;
    private Integer totalIncome;
    private String fromDate;
    private String toDate;
}