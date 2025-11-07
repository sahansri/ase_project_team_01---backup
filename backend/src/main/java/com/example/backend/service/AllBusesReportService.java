// src/main/java/com/example/backend/service/AllBusesReportService.java
package com.example.backend.service;

import com.example.backend.dto.response.AllBusesReportDto;

public interface AllBusesReportService {
    AllBusesReportDto getAllBusesReport(String fromDate, String toDate);
}