package com.example.backend.dto.response;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResponseUserDto {
    private String id;
    private String name;
    private String email;
    private String mobile;
    private String username;
    //private String password;
    private Set<String> roles;
}
