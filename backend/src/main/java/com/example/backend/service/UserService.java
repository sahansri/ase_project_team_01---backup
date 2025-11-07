package com.example.backend.service;

import com.example.backend.dto.request.RequestUserDto;
import com.example.backend.dto.response.ResponseUserDto;
import com.example.backend.dto.response.paginate.PaginateUserDto;
import com.example.backend.entity.User;

import java.util.Optional;

public interface UserService {
    public void save(RequestUserDto dto);
    public boolean delete(String id);
    public ResponseUserDto findById(String id);
    public void updateById(RequestUserDto dto,String id);
    public PaginateUserDto search(String searchText,int page,int size);
    public Optional<User> authenticate(String username, String password);
    public void saveDriver(RequestUserDto dto);
    public User findByUsername(String username);
    public User getUserEntityById(String id);
    public void updatePassword(String id, String oldPassword, String newPassword);
}
