package com.example.backend.repository;

import com.example.backend.entity.Trip;
import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepo extends MongoRepository<Trip,String> {
    @Query(value = "{'$or': [{'schedule': {'$regex': ?0, '$options': 'i'}}, {'date': {'$regex': ?0, '$options': 'i'}}, {'passengerCount': {'$regex': ?0, '$options': 'i'}}, {'income': {'$regex': ?0, '$options': 'i'}}]}")
    Page<Trip> searchAll(String searchText, Pageable pageable);

    @Query("{ 'schedule.$id': { $in: ?0 } }")
    Page<Trip> findAllByScheduleIds(List<String> scheduleIds, Pageable pageable);
}
