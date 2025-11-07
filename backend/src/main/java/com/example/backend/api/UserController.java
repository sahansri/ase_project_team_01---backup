package com.example.backend.api;

import com.example.backend.dto.request.RequestUserDto;
import com.example.backend.dto.response.ResponseUserDto;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.UserService;
import com.example.backend.util.StandardResponseDto;
import com.example.backend.entity.User;
import com.example.backend.exception.EntryNotFoundException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// http://localhost:5050/api/user/-
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;
    @Autowired
    private JwtUtil jwtUtil;


    @PostMapping("/create-user")
    public ResponseEntity<StandardResponseDto> create(
            @RequestBody RequestUserDto dto,
            @RequestHeader("Authorization") String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println("Extracted roles from token: " + roles);

        if (!roles.contains("ADMIN")) {
            return new ResponseEntity<>(
                    new StandardResponseDto(
                            "Not authorized",402,null
                    ), HttpStatus.FORBIDDEN
            );
        }

        userService.save(dto);
        return new ResponseEntity<>(
                new StandardResponseDto(
                        "user saved",201,null
                ), HttpStatus.CREATED
        );

    }

        

    @GetMapping("/find-user/{id}")
    public ResponseEntity<StandardResponseDto> findById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        String username = jwtUtil.getUsername(token);
        System.out.println(roles);

        // Admins can view anyone
        if (roles.contains("ADMIN")) {
                return new ResponseEntity<>(
                        new StandardResponseDto("User found", 200, userService.findById(id)),
                        HttpStatus.OK
                );
        }
        // Drivers can only view their own info
        User currentUser = userService.findByUsername(username);
        if (roles.contains("DRIVER") && currentUser.getId().equals(id)) {
                return new ResponseEntity<>(
                        new StandardResponseDto("User found", 200, userService.findById(id)),
                        HttpStatus.OK
                );
        }
        return new ResponseEntity<>(
            new StandardResponseDto("Not authorized", 403, null),
            HttpStatus.FORBIDDEN
        );
    }

   @GetMapping("/find-user/me")
        public ResponseEntity<StandardResponseDto> findMyProfile(
                @RequestHeader("Authorization") String authHeader
        ) {
        try {
                // 1️⃣ Extract token
                String token = authHeader.replace("Bearer ", "");

                // 2️⃣ Get userId from token
                String userId = jwtUtil.getUserId(token);

                // 3️⃣ Fetch user entity from DB
                User user = userService.getUserEntityById(userId);

                if (user == null) {
                return new ResponseEntity<>(
                        new StandardResponseDto("User not found", 404, null),
                        HttpStatus.NOT_FOUND
                );
                }

                // 4️⃣ Convert to ResponseUserDto
                ResponseUserDto response = ResponseUserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .username(user.getUsername())
                        .roles(user.getRoles())
                        .build();

                // 5️⃣ Return DTO
                return new ResponseEntity<>(
                        new StandardResponseDto("Profile fetched successfully", 200, response),
                        HttpStatus.OK
                );

        } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(
                        new StandardResponseDto("Failed to fetch profile", 500, null),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
        }
        }




    @PutMapping("/update-user/{id}")
    public ResponseEntity<StandardResponseDto> updateById(
            @PathVariable String id,
            @RequestBody RequestUserDto dto,
            @RequestHeader ("Authorization") String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.getUsername(token); 
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println("Roles: " + roles + " | Username: " + username);

        // DRIVER only allow updating their own info
        if (roles.contains("DRIVER")) {
                User loggedUser = userService.findByUsername(username);
                if (!loggedUser.getId().equals(id)) {
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                "You are not authorized to update another user's account",
                                403,
                                null
                        ),
                        HttpStatus.FORBIDDEN
                );
                }
                //Drivers cannot change their roles
                dto.setRoles(loggedUser.getRoles());
        }
        // Admins can update anyone
        else if (!roles.contains("ADMIN")) {
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                "Not authorized",
                                403,
                                null
                        ),
                        HttpStatus.FORBIDDEN
                );
        }
        userService.updateById(dto, id);
        return new ResponseEntity<>(
                new StandardResponseDto(
                        "user updated",201,null
                ), HttpStatus.CREATED
        );
    }

   @PutMapping("/change-password/{id}")
        public ResponseEntity<StandardResponseDto> changePassword(
                @PathVariable String id,
                @RequestBody Map<String, String> passwordData
        ) {
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");

        if (newPassword == null || newPassword.trim().isEmpty()) {
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                "New password cannot be empty",
                                400,
                                null
                        ),
                        HttpStatus.BAD_REQUEST
                );
        }

        try {
                userService.updatePassword(id, oldPassword, newPassword);
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                "Password updated successfully",
                                200,
                                null
                        ),
                        HttpStatus.OK
                );

        } catch (IllegalArgumentException ex) {
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                ex.getMessage(),
                                400,
                                null
                        ),
                        HttpStatus.BAD_REQUEST
                );

        } catch (EntryNotFoundException ex) {
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                ex.getMessage(),
                                404,
                                null
                        ),
                        HttpStatus.NOT_FOUND
                );

        } catch (Exception ex) {
                return new ResponseEntity<>(
                        new StandardResponseDto(
                                "Something went wrong: " + ex.getMessage(),
                                500,
                                null
                        ),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
        }
        }




   
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<StandardResponseDto> deleteById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println("Roles: " + roles);

        // Only ADMIN can delete users
        if (!roles.contains("ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        new StandardResponseDto("Not authorized", 403, null)
                );
        }

        // Check existence before deletion
        boolean deleted = userService.delete(id);
        if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        new StandardResponseDto("User not found", 404, null)
                );
        }

        return ResponseEntity.status(HttpStatus.OK).body(
                new StandardResponseDto("User deleted successfully", 200, null)
        );
        }

    @GetMapping("/search-user")
    public ResponseEntity<StandardResponseDto> searchAll(
            @RequestParam String searchText,
            @RequestParam int page,
            @RequestParam int size,
            @RequestHeader("Authorization") String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        if (!roles.contains("ADMIN")) {
            return new ResponseEntity<>(
                    new StandardResponseDto(
                            "Not authorized",402,null
                    ), HttpStatus.FORBIDDEN
            );
        }
        return new ResponseEntity<>(
                new StandardResponseDto(
                        "user list",200,userService.search(searchText, page, size)
                ), HttpStatus.OK
        );
    }

    @GetMapping("/verify-token")
    public ResponseEntity<StandardResponseDto> verifyToken(
            @Valid
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.validateToken(token)) {
            return new ResponseEntity<>(
                    new StandardResponseDto("Token invalid or expired", 401, null),
                    HttpStatus.UNAUTHORIZED
            );
        }
        Set<String> roles = jwtUtil.getRoles(token);
        String username = jwtUtil.getUsername(token);

        return new ResponseEntity<>(
                new StandardResponseDto(
                        "Token valid", 200,
                        Map.of("username", username, "roles", roles)
                ),
                HttpStatus.OK
        );
    }
}

