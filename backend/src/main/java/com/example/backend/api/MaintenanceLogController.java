package com.example.backend.api;

import com.example.backend.dto.response.BusResponseDto;
import com.example.backend.entity.Bus;
import com.example.backend.entity.MaintenanceLog;
import com.example.backend.entity.Notification;
import com.example.backend.entity.Schedule;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.BusService;
import com.example.backend.service.MaintenanceService;
import com.example.backend.service.NotificationService;
import com.example.backend.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

// http://localhost:5050/api/maintenance/-
@RestController
@RequestMapping("/api/maintenance")
//@RequiredArgsConstructor
public class MaintenanceLogController {
    private final MaintenanceService maintenanceService;
    private final BusService busService;
    private final ScheduleService scheduleService;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;


    public MaintenanceLogController(MaintenanceService maintenanceService,BusService busService,ScheduleService scheduleService,JwtUtil jwtUtil,NotificationService notificationService) {
        this.maintenanceService = maintenanceService;
        this.busService = busService;
        this.scheduleService=scheduleService;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
    }

    //Later I'll Try Using DTO
   @PostMapping("/add")
    public ResponseEntity<MaintenanceLog> addLogs(@RequestBody Map<String, Object> body){
       MaintenanceLog newLog = maintenanceService.addMaintenanceLog(
               (String) body.get("busNumber"),
               (String) body.get("maintenanceType"),
               (String) body.get("maintenanceDate"),
               Double.parseDouble(body.get("cost").toString()),
               (String) body.get("maintenanceStatus"),
               (String) body.get("notes"));
       return new ResponseEntity<>(newLog, HttpStatus.CREATED);
   }

   //Get all Records
   @GetMapping("/manage/viewRecords")
    public ResponseEntity<List<MaintenanceLog>> getAllMaintenanceLogs(){
       List<MaintenanceLog> logs = maintenanceService.findAll();
       //if there
       // is no logs, return a response entity with empty body with httpStatus 204
       if(logs.isEmpty()){
           return ResponseEntity.noContent().build();
       }
       return new ResponseEntity<>(logs, HttpStatus.OK);
   }

   //Get all Records for a specific buss
    @GetMapping("/manage/viewRecords/{busNumber}")
    public ResponseEntity<List<MaintenanceLog>> getRecordsForBus(@PathVariable String busNumber){
            List<MaintenanceLog> logs = maintenanceService.getLogsForBus(busNumber);
            if(logs.isEmpty()){
                return ResponseEntity.noContent().build();
            }
            return new ResponseEntity<>(logs, HttpStatus.OK);
    }



    //Update a Specific Log
   @PutMapping("/manage/edit/{id}")
    public ResponseEntity<MaintenanceLog> updateMaintenanceLog(@PathVariable String id,@RequestBody MaintenanceLog log){
        MaintenanceLog update = maintenanceService.updateMaintenanceLog(id, log);
        return new ResponseEntity<>(update, HttpStatus.OK);
   }
   //Get a list of Bus Numbers
   @GetMapping("/add/bus-list")
    public ResponseEntity<String[]> getAllBusNumbers(){
        //Get a List of BusResponseDto's Using bus Service and make an array containing bus Numbers
       //using this DTO and return it as a Response Entity
        List<BusResponseDto> buses = busService.getAllBuses();
        int size = buses.toArray().length;
        String[] busArray = new String[size];
        for(int i=0;i<size;i++){
            busArray[i] = buses.get(i).getBusNumber();
        }
        return new ResponseEntity<>(busArray,HttpStatus.OK);
   }

   //Get a Specific  record  by id
    @GetMapping("manage/edit/get/{id}")
    public ResponseEntity<MaintenanceLog> getSpecificRecord(@PathVariable String id){
        MaintenanceLog log = maintenanceService.getSingleLog(id);
        return new ResponseEntity<>(log,HttpStatus.OK);
    }

    //Delete a Record by id
    @DeleteMapping("manage/delete/{id}")
    public ResponseEntity<String> deleteLogById(@PathVariable String id){
        maintenanceService.deleteLogById(id);
        return new ResponseEntity<>("Log Deleted successfully!",HttpStatus.OK);
    }

    //Change the bus status
    @PutMapping("manage/bus-status/{id}")
    public ResponseEntity<String> changeStatus(@PathVariable String id,@RequestBody Map<String,String> body){
        String newStatus = body.get("status");
        boolean result = busService.changeStatus(id,newStatus);

        if(newStatus.equalsIgnoreCase("unavailable")) {
            scheduleService.updateStatusByBusId(id, "Needs_Reassignment");
            BusResponseDto bus = busService.getBusById(id);
            String busNumber = bus.getBusNumber();
            String sender = "Admin";
            String message = "Bus "+ busNumber+"Is Marked unavailable by "+sender;
            String receiver = bus.getDriverUserName();
            System.out.println("Receiver of notification: [" + receiver + "]");
            System.out.println("Length: " + receiver.length());
            notificationService.sendInfo(
                    receiver,
                    "Bus In Maintenance",
                    String.format("Bus %s is now under maintenance.", busNumber)
            );

            notificationService.sendAlert(
                    "admin",
                    "Bus"+busNumber+"is Under Maintenance",
                    "Bus " + busNumber + " is under Maintenance.Go to Scheduling and Resolve Conflicts",
                    busNumber
                    );
        }

        if(result){
            return new ResponseEntity<>("Status Changed successfully!",HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>("Failed to change status. Bus not found.", HttpStatus.NOT_FOUND);
        }
    }

    //Get logs for the driver
    @GetMapping("driver/get-logs")
    public ResponseEntity<List<MaintenanceLog>> getRecordsForDriver(@RequestHeader("Authorization") String authHeader){
        String token = authHeader.replace("Bearer ","");

        String userName = jwtUtil.getUsername(token);

        String busNumber = busService.getBusNumberForUsername(userName);
        System.out.println(busNumber);

        if (busNumber == null) {
            return ResponseEntity.status(HttpStatus.OK).body(Collections.emptyList());
        }
        return new ResponseEntity<>(maintenanceService.getLogsForBus(busNumber),HttpStatus.OK);
    }

}
