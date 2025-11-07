package com.example.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String sender;

    private String receiver;

    private NotificationType type;

    private String title;

    private String message;

    private String busNumber;

    // Tracks if admin has viewed the notification
    private Boolean isRead;

    private LocalDateTime createdAt;


    // Enum for notification types
    public enum NotificationType {
        MAINTENANCE,
        ALERT,
        INFO,
        WARNING
    }
}
