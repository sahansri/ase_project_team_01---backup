//src/main/java/com/example/backend/service/BusReportService.java

package com.example.backend.service;

import com.example.backend.dto.response.BusReportDto;

public interface BusReportService {
    BusReportDto getBusReport(String busNumber, String fromDate, String toDate);
}