// src/main/java/com/example/backend/service/impl/RouteServiceImpl.java
package com.example.backend.service.impl;

import com.example.backend.dto.request.RouteRequestDto;
import com.example.backend.dto.response.RouteResponseDto;
import com.example.backend.entity.Route;
import com.example.backend.repository.RouteRepository;
import com.example.backend.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteServiceImpl implements RouteService {

    private final RouteRepository routeRepository;

    @Autowired
    public RouteServiceImpl(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    @Override
    public RouteResponseDto createRoute(RouteRequestDto routeRequestDto) {
        // Check if route name already exists
        if (routeRepository.existsByRouteName(routeRequestDto.getRouteName())) {
            throw new RuntimeException("Route name already exists: " + routeRequestDto.getRouteName());
        }

        Route route = new Route();
        route.setRouteName(routeRequestDto.getRouteName());
        route.setStartingPoint(routeRequestDto.getStartingPoint());
        route.setEndingPoint(routeRequestDto.getEndingPoint());
        route.setDistance(routeRequestDto.getDistance());

        Route savedRoute = routeRepository.save(route);
        return convertToResponseDto(savedRoute);
    }

    @Override
    public List<RouteResponseDto> getAllRoutes() {
        List<Route> routes = routeRepository.findAll();
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public RouteResponseDto getRouteById(String id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found with ID: " + id));
        return convertToResponseDto(route);
    }

    @Override
    public RouteResponseDto getRouteByName(String routeName) {
        Route route = routeRepository.findByRouteName(routeName)
                .orElseThrow(() -> new RuntimeException("Route not found with name: " + routeName));
        return convertToResponseDto(route);
    }

    @Override
    public RouteResponseDto updateRoute(String id, RouteRequestDto routeRequestDto) {
        Route existingRoute = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route not found with ID: " + id));

        // Check if route name is being changed and if new name already exists
        if (!existingRoute.getRouteName().equals(routeRequestDto.getRouteName()) &&
            routeRepository.existsByRouteName(routeRequestDto.getRouteName())) {
            throw new RuntimeException("Route name already exists: " + routeRequestDto.getRouteName());
        }

        existingRoute.setRouteName(routeRequestDto.getRouteName());
        existingRoute.setStartingPoint(routeRequestDto.getStartingPoint());
        existingRoute.setEndingPoint(routeRequestDto.getEndingPoint());
        existingRoute.setDistance(routeRequestDto.getDistance());
        existingRoute.updateTimestamp();

        Route updatedRoute = routeRepository.save(existingRoute);
        return convertToResponseDto(updatedRoute);
    }

    @Override
    public void deleteRoute(String id) {
        if (!routeRepository.existsById(id)) {
            throw new RuntimeException("Route not found with ID: " + id);
        }
        routeRepository.deleteById(id);
    }

    @Override
    public List<RouteResponseDto> searchRoutes(String searchTerm, int page, int size) {
        List<Route> routes = routeRepository.searchRoutes(searchTerm);
        
        // Apply pagination manually
        List<Route> paginatedRoutes = routes.stream()
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());

        return paginatedRoutes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesByStartingPoint(String startingPoint) {
        List<Route> routes = routeRepository.findByStartingPointContainingIgnoreCase(startingPoint);
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesByEndingPoint(String endingPoint) {
        List<Route> routes = routeRepository.findByEndingPointContainingIgnoreCase(endingPoint);
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesByDistanceRange(Double minDistance, Double maxDistance) {
        List<Route> routes;
        
        if (minDistance != null && maxDistance != null) {
            routes = routeRepository.findByDistanceBetween(minDistance, maxDistance);
        } else if (minDistance != null) {
            routes = routeRepository.findByDistanceGreaterThanEqual(minDistance);
        } else if (maxDistance != null) {
            routes = routeRepository.findByDistanceLessThanEqual(maxDistance);
        } else {
            routes = routeRepository.findAll();
        }

        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesBetweenPoints(String point1, String point2) {
        List<Route> routes = routeRepository.findRoutesBetweenPoints(point1, point2);
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesByDistanceAsc() {
        List<Route> routes = routeRepository.findAllByOrderByDistanceAsc();
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesByDistanceDesc() {
        List<Route> routes = routeRepository.findAllByOrderByDistanceDesc();
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesWithMinDistance(Double minDistance) {
        List<Route> routes = routeRepository.findByDistanceGreaterThanEqual(minDistance);
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteResponseDto> getRoutesWithMaxDistance(Double maxDistance) {
        List<Route> routes = routeRepository.findByDistanceLessThanEqual(maxDistance);
        return routes.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Route entity to RouteResponseDto
     */
    private RouteResponseDto convertToResponseDto(Route route) {
        RouteResponseDto responseDto = new RouteResponseDto();
        responseDto.setId(route.getId());
        responseDto.setRouteName(route.getRouteName());
        responseDto.setStartingPoint(route.getStartingPoint());
        responseDto.setEndingPoint(route.getEndingPoint());
        responseDto.setDistance(route.getDistance());
        responseDto.setCreatedAt(route.getCreatedAt());
        responseDto.setUpdatedAt(route.getUpdatedAt());
        return responseDto;
    }
}