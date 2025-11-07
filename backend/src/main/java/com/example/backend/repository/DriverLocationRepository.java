package com.example.backend.repository;

import com.example.backend.entity.DriverLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverLocationRepository extends MongoRepository<DriverLocation, String> {

    Optional<DriverLocation> findByDriverUsername(String driverUsername);

    @Query("{'updatedAt': {'$gte': ?0}}")
    List<DriverLocation> findRecentLocations(LocalDateTime since);

    @Query("{'status': {'$in': ['online', 'active']}}")
    List<DriverLocation> findActiveDrivers();

    @Query(value = "{'status': {'$in': ['online', 'active']}}",
            sort = "{'updatedAt': -1}")
    List<DriverLocation> findActiveDriversSortedByUpdate();

    @Query("{'driverUsername': ?0}")
    void deleteByDriverUsername(String driverUsername);

    @Query("{'status': ?0}")
    List<DriverLocation> findByStatus(String status);
}
