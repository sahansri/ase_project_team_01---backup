package com.example.backend.api;


import com.example.backend.dto.request.NotificationDTO;
import com.example.backend.entity.Notification;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for the current user
     */
    @GetMapping("/user/{username}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String username) {
        List<Notification> notifications = notificationService.getNotificationsByReceiver(username);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications for the current user
     */
    @GetMapping("/user/{username}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String username) {
        List<Notification> notifications = notificationService.getUnreadNotifications(username);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread count for the current user
     */
    @GetMapping("/user/{username}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String username) {
        long count = notificationService.getUnreadCount(username);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * Get notification by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable String id) {
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new notification (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createNotification(@RequestBody NotificationDTO dto) {
        Notification notification = notificationService.createNotification(
                dto.getSender(),
                dto.getReceiver(),
                dto.getType(),
                dto.getTitle(),
                dto.getMessage(),
                dto.getBusNumber()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    /**
     * Create broadcast notification (admin only)
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createBroadcastNotification(@RequestBody NotificationDTO dto) {
        Notification notification = notificationService.createBroadcastNotification(
                dto.getSender(),
                dto.getType(),
                dto.getTitle(),
                dto.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/user/{username}/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable String username) {
        notificationService.markAllAsRead(username);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /**
     * Delete notification by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    /**
     * Delete all notifications for a user
     */
    @DeleteMapping("/user/{username}")
    public ResponseEntity<Map<String, String>> deleteAllUserNotifications(@PathVariable String username) {
        notificationService.deleteAllByReceiver(username);
        return ResponseEntity.ok(Map.of("message", "All notifications deleted successfully"));
    }

    /**
     * Get all notifications (admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Send maintenance alert to driver (admin only)
     */
    @PostMapping("/maintenance-alert")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> sendMaintenanceAlert(
            @RequestBody Map<String, String> request
    ) {
        Notification notification = notificationService.sendMaintenanceAlert(
                request.get("driverUsername"),
                request.get("busNumber"),
                request.get("message")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }
}




