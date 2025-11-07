package com.example.backend.dto.response.paginate;

import com.example.backend.dto.response.ResponseTripDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class PaginatedTripDto {
    private long count;
    private List<ResponseTripDto> dataList;
}
