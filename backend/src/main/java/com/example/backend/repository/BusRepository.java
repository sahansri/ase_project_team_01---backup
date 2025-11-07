
// src/main/java/com/example/backend/repository/BusRepository.java
package com.example.backend.repository;

import com.example.backend.entity.Bus;
import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends MongoRepository<Bus, String> {

    /**
     * Find bus by bus number
     */
    Optional<Bus> findByBusNumber(String busNumber);

    /**
     * Check if bus number already exists
     */
    boolean existsByBusNumber(String busNumber);

    /**
     * Find buses by model
     */
    List<Bus> findByModelContainingIgnoreCase(String model);

    /**
     * Find buses by driver
     */
    @Query("{ 'driver.$id': ?0 }")
    Bus findBusesByDriverId(String driverId);

    /**
     * Find buses with capacity greater than or equal to specified value
     */
    List<Bus> findByCapacityGreaterThanEqual(Integer capacity);

    /**
     * Find buses with capacity between min and max values
     */
    List<Bus> findByCapacityBetween(Integer minCapacity, Integer maxCapacity);

    /**
     * Custom query to find buses with capacity less than or equal to the specified value.
     */
    List<Bus> findByCapacityLessThanEqual(Integer maxCapacity);

    /**
     * Custom method to search for buses by bus number or model with pagination.
     */
    Page<Bus> findByBusNumberContainingIgnoreCaseOrModelContainingIgnoreCase(
            String busNumber, String model, Pageable pageable);

    /**
     * Custom query to find buses with user as driver
     */
    @Query("{'driver.$id': ?0}")
    List<Bus> findBusesWithUserAsDriver(String userId);

    /**
     * Custom query to find buses without assigned driver
     */
    @Query("{'driver': null}")
    List<Bus> findBusesWithoutDriver();

    /**
     * Find all buses ordered by bus number
     */
    List<Bus> findAllByOrderByBusNumberAsc();

    /**
     * Find all buses ordered by capacity descending
     */
    List<Bus> findAllByOrderByCapacityDesc();

    Optional<Bus> findById(String id);

    long countByStatus(String status);

    //Find all buses with status "Available"
    List<Bus> findByStatus(String status);
}
