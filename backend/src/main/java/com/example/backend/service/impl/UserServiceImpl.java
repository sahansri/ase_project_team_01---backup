package com.example.backend.service.impl;


import com.example.backend.dto.request.RequestUserDto;
import com.example.backend.dto.response.ResponseUserDto;
import com.example.backend.dto.response.paginate.PaginateUserDto;
import com.example.backend.entity.User;
import com.example.backend.exception.EntryNotFoundException;
import com.example.backend.repository.UserRepo;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    @Autowired
    private final UserRepo userRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Optional<User> authenticate(String username, String password) {
        return userRepo.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }

    @Override
    public void save(RequestUserDto dto) {
        userRepo.save(toUser(dto));
    }

    @Override
    public boolean delete(String id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public ResponseUserDto findById(String id) {
        return toResponseUserDto(userRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("User Not Founded")));
    }

    @Override
    public void updateById(RequestUserDto dto, String id) {
        User user = userRepo.findById(id).orElseThrow(()-> new EntryNotFoundException("User Not Founded"));
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setMobile(dto.getMobile());
        user.setUsername(dto.getUsername());
        
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            user.setRoles(dto.getRoles());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            // Encode and update only if user entered a new password
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        } 
        userRepo.save(user);
    }

    @Override
    public PaginateUserDto search(String searchText, int page, int size) {
        Page<User> userList = userRepo.searchAll(searchText, PageRequest.of(page,size));
        return PaginateUserDto.builder()
                .dataList(userList.stream().map(this::toResponseUserDto).toList())
                .count(userList.getTotalElements())
                .build();
    }

    private User toUser(RequestUserDto dto) {
        if (dto == null) return null;
        return User.builder()
                .id(UUID.randomUUID().toString())
                .name(dto.getName())
                .email(dto.getEmail())
                .mobile(dto.getMobile())
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .roles(dto.getRoles())
                .build();
    }
    private ResponseUserDto toResponseUserDto(User user) {
        if (user == null) return null;
        return ResponseUserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .username(user.getUsername())
                //.password(user.getPassword())
                .roles(user.getRoles())
                .build();
    }

    public void saveDriver(RequestUserDto dto) {
        // Automatically assign the DRIVER role
        dto.setRoles(Set.of("DRIVER"));
        
        save(dto);
    }

    public User findByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User getUserEntityById(String id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new EntryNotFoundException("User not found"));
    }

    @Override
    public void updatePassword(String id, String oldPassword, String newPassword) {
        // Fetch user from DB
        User user = userRepo.findById(id)
                .orElseThrow(() -> new EntryNotFoundException("User not found"));

        // Verify old password if provided
        if (oldPassword != null && !oldPassword.isEmpty()) {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new IllegalArgumentException("Old password is incorrect");
            }
        }

        // Update password only if a new one is provided
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepo.save(user); // Only updates the password field
        } else {
            throw new IllegalArgumentException("New password cannot be empty");
        }
    }


}
