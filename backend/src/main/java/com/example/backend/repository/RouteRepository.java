// src/main/java/com/example/backend/repository/RouteRepository.java
package com.example.backend.repository;

import com.example.backend.entity.Route;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends MongoRepository<Route, String> {
    
    /**
     * Find route by route name
     */
    Optional<Route> findByRouteName(String routeName);

    Optional<Route> findById(String id);
    
    /**
     * Check if route name already exists
     */
    boolean existsByRouteName(String routeName);
    
    /**
     * Find routes by starting point
     */
    List<Route> findByStartingPointContainingIgnoreCase(String startingPoint);
    
    /**
     * Find routes by ending point
     */
    List<Route> findByEndingPointContainingIgnoreCase(String endingPoint);
    
    /**
     * Find routes by starting and ending points
     */
    List<Route> findByStartingPointContainingIgnoreCaseAndEndingPointContainingIgnoreCase(
            String startingPoint, String endingPoint);
    
    /**
     * Find routes with distance greater than or equal to specified value
     */
    List<Route> findByDistanceGreaterThanEqual(Double distance);
    
    /**
     * Find routes with distance less than or equal to specified value
     */
    List<Route> findByDistanceLessThanEqual(Double distance);
    
    /**
     * Find routes with distance between min and max values
     */
    List<Route> findByDistanceBetween(Double minDistance, Double maxDistance);
    
    /**
     * Custom query to search routes by route name, starting point, or ending point
     */
    @Query("{'$or': [" +
           "{'routeName': {'$regex': ?0, '$options': 'i'}}, " +
           "{'startingPoint': {'$regex': ?0, '$options': 'i'}}, " +
           "{'endingPoint': {'$regex': ?0, '$options': 'i'}}" +
           "]}")
    List<Route> searchRoutes(String searchTerm);
    
    /**
     * Find all routes ordered by route name
     */
    List<Route> findAllByOrderByRouteNameAsc();
    
    /**
     * Find all routes ordered by distance ascending
     */
    List<Route> findAllByOrderByDistanceAsc();
    
    /**
     * Find all routes ordered by distance descending
     */
    List<Route> findAllByOrderByDistanceDesc();
    
    /**
     * Check if a route exists between two points (both directions)
     */
    @Query("{'$or': [" +
           "{'startingPoint': ?0, 'endingPoint': ?1}, " +
           "{'startingPoint': ?1, 'endingPoint': ?0}" +
           "]}")
    List<Route> findRoutesBetweenPoints(String point1, String point2);


}