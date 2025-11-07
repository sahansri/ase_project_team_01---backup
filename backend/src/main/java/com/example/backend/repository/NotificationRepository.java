package com.example.backend.repository;

import com.example.backend.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    // Find all notifications for a specific receiver
    List<Notification> findByReceiverOrderByCreatedAtDesc(String receiver);

    // Find unread notifications for a receiver
    List<Notification> findByReceiverAndIsReadFalseOrderByCreatedAtDesc(String receiver);

    // Find notifications by sender
    List<Notification> findBySenderOrderByCreatedAtDesc(String sender);

    // Find notifications by type
    List<Notification> findByTypeOrderByCreatedAtDesc(Notification.NotificationType type);

    // Find notifications by bus number
    List<Notification> findByBusNumberOrderByCreatedAtDesc(String busNumber);

    // Count unread notifications for a receiver
    long countByReceiverAndIsReadFalse(String receiver);

    void deleteByCreatedAtBefore(Date date);
}