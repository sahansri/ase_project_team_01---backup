package com.example.backend.api;

import com.example.backend.dto.request.RequestTripDto;
import com.example.backend.dto.response.ResponseTripDto;
import com.example.backend.dto.response.paginate.PaginatedTripDto;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.TripService;
import com.example.backend.util.StandardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/trip")

public class TripController {
    @Autowired
    private TripService tripService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/save")
    public String saveTrip(@RequestBody RequestTripDto requestTripDto){
        String message = tripService.saveTrip(requestTripDto);
        return "saved";
    }

    @GetMapping("/find-trip/{id}")
    public ResponseEntity<StandardResponseDto> findById(
            @PathVariable String id,
            @RequestHeader("Authorization") String authHeader
    ){
        String token = authHeader.replace("Bearer ", "");
        Set<String> roles = jwtUtil.getRoles(token);
        System.out.println(roles);

        if (!roles.contains("ADMIN")) {
            return new ResponseEntity<>(
                    new StandardResponseDto(
                            "Not authorized",402,null
                    ), HttpStatus.FORBIDDEN
            );
        }
        return new ResponseEntity<>(
                new StandardResponseDto(
                        "Trip found",200,tripService.findById(id)
                ), HttpStatus.OK
        );
    }

    @PutMapping("/update/{id}")
    public String updateTrip(@RequestBody RequestTripDto requestTripDto,@PathVariable String id){
        String message = tripService.updateTrip(requestTripDto,id);
        return "updated";
    }
    @DeleteMapping("/delete/{id}")
    public String deleteTrip(@PathVariable String id){
        return tripService.deleteTrip(id);
    }

    @GetMapping("/getAll")
    public Map<String, Object> getAllTrips(
            @RequestParam(defaultValue = "") String searchText,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PaginatedTripDto tripPage = tripService.search(searchText, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", tripPage);
        return response;
    }

    @GetMapping("/getAllDriverTrips")
    public Map<String, Object> getAllDriverTrips(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "") String searchText,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String token = authHeader.replace("Bearer ", "");
        String driverId = jwtUtil.getUserId(token); // You need a method in JwtUtil to get the user id

        System.out.println("🔹 Token: " + token);
        System.out.println("🔹 Extracted userId: " + driverId);


        PaginatedTripDto tripPage = tripService.searchDriverTrips(driverId, searchText, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", tripPage);
        return response;
    }

}
