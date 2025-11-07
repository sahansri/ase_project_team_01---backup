package com.example.backend.service;

import com.example.backend.dto.request.RequestTripDto;
import com.example.backend.dto.response.ResponseTripDto;
import com.example.backend.dto.response.paginate.PaginatedTripDto;

import java.util.List;

public interface TripService {
    public String saveTrip(RequestTripDto requestTripDto);
    public List<ResponseTripDto> getAllTrips();
    public String updateTrip(RequestTripDto requestTripDto,String id);
    public String deleteTrip(String id);
    public PaginatedTripDto search(String searchText, int page, int size);
    public PaginatedTripDto searchDriverTrips(String driverId, String searchText, int page, int size);
    public ResponseTripDto findById(String id);
}
