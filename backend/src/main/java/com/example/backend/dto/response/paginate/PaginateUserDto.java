package com.example.backend.dto.response.paginate;

import com.example.backend.dto.response.ResponseUserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaginateUserDto {
    private Long count;
    private List<ResponseUserDto> dataList;
}
