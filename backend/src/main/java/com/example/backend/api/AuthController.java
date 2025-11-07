package com.example.backend.api;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return userService.authenticate(request.username, request.password)
                .map(user -> {
                    // Pass userId here
                    String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRoles());
                    return ResponseEntity.ok(new AuthResponse(token, user.getRoles()));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

}
