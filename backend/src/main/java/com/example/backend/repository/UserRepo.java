package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;
import java.util.List;

public interface UserRepo extends MongoRepository<User,String> {
    @Query(value = "{'$or': [{'name': {'$regex': ?0, '$options': 'i'}}, {'email': {'$regex': ?0, '$options': 'i'}}, {'username': {'$regex': ?0, '$options': 'i'}},{'roles': {'$regex': ?0, '$options': 'i'}}]}")
    Page<User> searchAll(String searchText, Pageable pageable);

    @Query(value = "{'username': ?0}")
    Optional<User> findByUsername(String username);

    List<User> findByRolesContaining(String role);
}
