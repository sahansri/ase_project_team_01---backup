package com.example.backend.repository;

import com.example.backend.entity.Bus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import com.example.backend.entity.Schedule;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ScheduleRepository extends MongoRepository<Schedule, String> {
    Page<Schedule> findByRouteContainingIgnoreCase(String searchText, Pageable pageable);

    @Query("{ 'busId.driver.$id': ?0 }")
    List<Schedule> findByDriverId(String driverId);

    // New method for paginated status filtering
    Page<Schedule> findByStatusIgnoreCase(String status, Pageable pageable);


    // Derived query: returns schedules for a bus and status, ordered by date ASC then departureTime ASC
    List<Schedule> findByBusIdAndStatusOrderByDateAscDepartureTimeAsc(String busId, String status);

    // Keep existing single-parameter signatures by delegating to the derived query
    default List<Schedule> findOngoingSchedulesByDriverId(String busId) {
        return findByBusIdAndStatusOrderByDateAscDepartureTimeAsc(busId, "ongoing");
    }

    default List<Schedule> findByBusId(String busId) {
        return findByBusIdAndStatusOrderByDateAscDepartureTimeAsc(busId, "upcoming");
    }

    List<Schedule> findAllByBusId(String busId);



}

