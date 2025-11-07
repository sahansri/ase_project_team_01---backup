package com.example.backend.service;

import com.example.backend.entity.MaintenanceLog;
import com.example.backend.repository.MaintenanceLogRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
//@RequiredArgsConstructor
//@NoArgsConstructor
public class MaintenanceService {

    //@RequiredArgsConstructor create constructor for this
    private final MaintenanceLogRepository logRepository;

    public MaintenanceService(MaintenanceLogRepository logRepository) {
        this.logRepository = logRepository;
    }


    //Methode for getting Maintenance logs for a specific bus in Descending order
    public List<MaintenanceLog> getLogsForBus(String BusNumber) {
        return logRepository.findByBusNumberOrderByCreatedAtDesc(BusNumber);
    }

    //Methode to get all Maintenance Records
    public List<MaintenanceLog> findAll() {
        return logRepository.findAll();
    }


    //Methode to add Maintenance logs to the Database
    public MaintenanceLog addMaintenanceLog(String BusNumber,String MaintenanceType,String MaintenanceDate,Double Cost,String MaintenanceStatus,String Notes) {

        MaintenanceLog maintenanceLog = new MaintenanceLog();

        maintenanceLog.setBusNumber(BusNumber);
        maintenanceLog.setMaintenanceType(MaintenanceType);
        maintenanceLog.setMaintenanceDate(MaintenanceDate);
        maintenanceLog.setCost(Cost);
        maintenanceLog.setMaintenanceStatus(MaintenanceStatus);
        maintenanceLog.setNotes(Notes);

        return logRepository.save(maintenanceLog);
    }

    //Methode for Updating records
    //Updated time set to now
    public MaintenanceLog updateMaintenanceLog(String id,MaintenanceLog updatedLog){
        MaintenanceLog existingLog = logRepository.findById(id).orElseThrow(()->new RuntimeException("Log not found with id "+id));

        existingLog.setBusNumber(updatedLog.getBusNumber());
        existingLog.setMaintenanceType(updatedLog.getMaintenanceType());
        existingLog.setMaintenanceDate(updatedLog.getMaintenanceDate());
        existingLog.setCost(updatedLog.getCost());
        existingLog.setMaintenanceStatus(updatedLog.getMaintenanceStatus());
        existingLog.setNotes(updatedLog.getNotes());
        existingLog.setUpdatedAt(LocalDateTime.now());

        return logRepository.save(existingLog);

    }
    //Find a record by id
    public MaintenanceLog getSingleLog(String id){
        return logRepository.findById(id).orElseThrow(()->new RuntimeException("Log not found with id "+id));
    }

    //Delete a record using id
    public void deleteLogById(String id){
        logRepository.deleteById(id);
    }
}
