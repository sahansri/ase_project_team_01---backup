package com.example.backend.repository;

import com.example.backend.entity.MaintenanceLog;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceLogRepository extends MongoRepository<MaintenanceLog,String> {
    List<MaintenanceLog> findByBusNumberOrderByCreatedAtDesc(String busNumber);





}
