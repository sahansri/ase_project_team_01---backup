package com.example.backend.util;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class StandardResponseDto {
    private String message;
    private int code;
    private Object data;
}
