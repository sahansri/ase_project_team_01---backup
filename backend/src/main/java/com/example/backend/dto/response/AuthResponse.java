package com.example.backend.dto.response;

import java.util.Set;

public class AuthResponse {
    public String token;
    public Set<String> roles;

    public AuthResponse(String token, Set<String> roles) {
        this.token = token;
        this.roles = roles;
    }
}
