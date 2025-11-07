package com.example.backend.dto.request;

import com.example.backend.entity.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private String sender;
    private String receiver;
    private NotificationType type;
    private String title;
    private String message;
    private String busNumber;
    private Boolean isRead;
    private LocalDateTime createdAt;
}