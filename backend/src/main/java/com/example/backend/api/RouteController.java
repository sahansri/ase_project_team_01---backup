// src/main/java/com/example/backend/api/RouteController.java
package com.example.backend.api;

import com.example.backend.dto.request.RouteRequestDto;
import com.example.backend.dto.response.RouteResponseDto;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/routes")
//@CrossOrigin(origins = "*")
public class RouteController {

    private final RouteService routeService;

    @Autowired
    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Create a new route
     */
    @PostMapping("/create-route")
    public ResponseEntity<RouteResponseDto> createRoute(
            @Valid
            @RequestBody RouteRequestDto routeRequestDto,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        RouteResponseDto createdRoute = routeService.createRoute(routeRequestDto);
        return new ResponseEntity<>(createdRoute, HttpStatus.CREATED);
    }

    /**
     * Get all routes
     */
    @GetMapping("/get-all-routes")
    public ResponseEntity<List<RouteResponseDto>> getAllRoutes() {
        List<RouteResponseDto> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(routes);
    }

    /**
     * Get route by ID
     */
    @GetMapping("/get-route/{id}")
    public ResponseEntity<RouteResponseDto> getRouteById(@PathVariable String id) {
        RouteResponseDto route = routeService.getRouteById(id);
        return ResponseEntity.ok(route);
    }

    /**
     * Get route by name
     */
    @GetMapping("/name/{routeName}")
    public ResponseEntity<RouteResponseDto> getRouteByName(@PathVariable String routeName) {
        RouteResponseDto route = routeService.getRouteByName(routeName);
        return ResponseEntity.ok(route);
    }

    /**
     * Update route
     */
    @PutMapping("/{id}")
    public ResponseEntity<RouteResponseDto> updateRoute(
            @PathVariable String id, 
            @Valid @RequestBody RouteRequestDto routeRequestDto) {
        RouteResponseDto updatedRoute = routeService.updateRoute(id, routeRequestDto);
        return ResponseEntity.ok(updatedRoute);
    }

    /**
     * Delete route
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable String id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search routes
     */
    @GetMapping("/search")
    public ResponseEntity<List<RouteResponseDto>> searchRoutes(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<RouteResponseDto> routes = routeService.searchRoutes(searchTerm, page, size);
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes by starting point
     */
    @GetMapping("/starting-point/{startingPoint}")
    public ResponseEntity<List<RouteResponseDto>> getRoutesByStartingPoint(@PathVariable String startingPoint) {
        List<RouteResponseDto> routes = routeService.getRoutesByStartingPoint(startingPoint);
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes by ending point
     */
    @GetMapping("/ending-point/{endingPoint}")
    public ResponseEntity<List<RouteResponseDto>> getRoutesByEndingPoint(@PathVariable String endingPoint) {
        List<RouteResponseDto> routes = routeService.getRoutesByEndingPoint(endingPoint);
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes by distance range
     */
    @GetMapping("/distance")
    public ResponseEntity<List<RouteResponseDto>> getRoutesByDistanceRange(
            @RequestParam(required = false) Double minDistance,
            @RequestParam(required = false) Double maxDistance) {
        List<RouteResponseDto> routes = routeService.getRoutesByDistanceRange(minDistance, maxDistance);
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes between two points
     */
    @GetMapping("/between")
    public ResponseEntity<List<RouteResponseDto>> getRoutesBetweenPoints(
            @RequestParam String point1,
            @RequestParam String point2) {
        List<RouteResponseDto> routes = routeService.getRoutesBetweenPoints(point1, point2);
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes sorted by distance ascending
     */
    @GetMapping("/sorted/distance-asc")
    public ResponseEntity<List<RouteResponseDto>> getRoutesByDistanceAsc() {
        List<RouteResponseDto> routes = routeService.getRoutesByDistanceAsc();
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes sorted by distance descending
     */
    @GetMapping("/sorted/distance-desc")
    public ResponseEntity<List<RouteResponseDto>> getRoutesByDistanceDesc() {
        List<RouteResponseDto> routes = routeService.getRoutesByDistanceDesc();
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes with minimum distance
     */
    @GetMapping("/min-distance/{minDistance}")
    public ResponseEntity<List<RouteResponseDto>> getRoutesWithMinDistance(@PathVariable Double minDistance) {
        List<RouteResponseDto> routes = routeService.getRoutesWithMinDistance(minDistance);
        return ResponseEntity.ok(routes);
    }

    /**
     * Get routes with maximum distance
     */
    @GetMapping("/max-distance/{maxDistance}")
    public ResponseEntity<List<RouteResponseDto>> getRoutesWithMaxDistance(@PathVariable Double maxDistance) {
        List<RouteResponseDto> routes = routeService.getRoutesWithMaxDistance(maxDistance);
        return ResponseEntity.ok(routes);
    }
}