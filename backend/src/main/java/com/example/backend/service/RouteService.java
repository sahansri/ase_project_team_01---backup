// src/main/java/com/example/backend/service/RouteService.java (Interface)
package com.example.backend.service;

import com.example.backend.dto.request.RouteRequestDto;
import com.example.backend.dto.response.RouteResponseDto;

import java.util.List;

public interface RouteService {
    RouteResponseDto createRoute(RouteRequestDto routeRequestDto);
    List<RouteResponseDto> getAllRoutes();
    RouteResponseDto getRouteById(String id);
    RouteResponseDto getRouteByName(String routeName);
    RouteResponseDto updateRoute(String id, RouteRequestDto routeRequestDto);
    void deleteRoute(String id);
    List<RouteResponseDto> searchRoutes(String searchTerm, int page, int size);
    List<RouteResponseDto> getRoutesByStartingPoint(String startingPoint);
    List<RouteResponseDto> getRoutesByEndingPoint(String endingPoint);
    List<RouteResponseDto> getRoutesByDistanceRange(Double minDistance, Double maxDistance);
    List<RouteResponseDto> getRoutesBetweenPoints(String point1, String point2);
    List<RouteResponseDto> getRoutesByDistanceAsc();
    List<RouteResponseDto> getRoutesByDistanceDesc();
    List<RouteResponseDto> getRoutesWithMinDistance(Double minDistance);
    List<RouteResponseDto> getRoutesWithMaxDistance(Double maxDistance);
}