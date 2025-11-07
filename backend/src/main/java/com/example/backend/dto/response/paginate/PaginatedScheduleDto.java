package com.example.backend.dto.response.paginate;

import com.example.backend.dto.response.ResponseScheduleDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PaginatedScheduleDto {
    private List<ResponseScheduleDto> schedules;
    private long totalCount;
}
