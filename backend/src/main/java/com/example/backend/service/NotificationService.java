package com.example.backend.service;

import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Create and send notification to a specific user (driver or admin)
     */
    public Notification createNotification(
            String sender,
            String receiver,
            Notification.NotificationType type,
            String title,
            String message,
            String busNumber
    ) {
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setBusNumber(busNumber);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created: {} for receiver: {}", saved.getId(), receiver);

        // Send via WebSocket
        sendNotificationViaWebSocket(saved);

        return saved;
    }

    /**
     * Send notification through WebSocket based on receiver role
     */
    private void sendNotificationViaWebSocket(Notification notification) {
        try {
            // Check if receiver is admin or driver
            if ("ADMIN".equalsIgnoreCase(notification.getReceiver())) {
                // Send to admin topic
                messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
                log.info("Notification sent to admin topic");
            } else {
                // Send to specific driver topic
                messagingTemplate.convertAndSend(
                        "/topic/driver/" + notification.getReceiver() + "/notifications",
                        notification
                );
                log.info("Notification sent to driver: {}", notification.getReceiver());
            }
        } catch (Exception e) {
            log.error("Error sending notification via WebSocket", e);
        }
    }

    /**
     * Send broadcast notification to all users
     */
    public Notification createBroadcastNotification(
            String sender,
            Notification.NotificationType type,
            String title,
            String message
    ) {
        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setReceiver("ALL");
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        log.info("Broadcast notification created: {}", saved.getId());

        // Send to broadcast topic
        messagingTemplate.convertAndSend("/topic/notifications/broadcast", saved);

        return saved;
    }

    /**
     * Get all notifications for a specific receiver
     */
    public List<Notification> getNotificationsByReceiver(String receiver) {
        return notificationRepository.findByReceiverOrderByCreatedAtDesc(receiver);
    }

    /**
     * Get unread notifications for a receiver
     */
    public List<Notification> getUnreadNotifications(String receiver) {
        return notificationRepository.findByReceiverAndIsReadFalseOrderByCreatedAtDesc(receiver);
    }

    /**
     * Get notification by ID
     */
    public Optional<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    /**
     * Mark notification as read
     */
    public Notification markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }
        throw new RuntimeException("Notification not found with id: " + notificationId);
    }

    /**
     * Mark all notifications as read for a receiver
     */
    public void markAllAsRead(String receiver) {
        List<Notification> notifications = notificationRepository
                .findByReceiverAndIsReadFalseOrderByCreatedAtDesc(receiver);

        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
        log.info("Marked {} notifications as read for receiver: {}", notifications.size(), receiver);
    }

    /**
     * Delete notification by ID
     */
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
        log.info("Notification deleted: {}", notificationId);
    }

    /**
     * Delete all notifications for a receiver
     */
    public void deleteAllByReceiver(String receiver) {
        List<Notification> notifications = notificationRepository.findByReceiverOrderByCreatedAtDesc(receiver);
        notificationRepository.deleteAll(notifications);
        log.info("Deleted {} notifications for receiver: {}", notifications.size(), receiver);
    }

    /**
     * Get unread count for a receiver
     */
    public long getUnreadCount(String receiver) {
        return notificationRepository.countByReceiverAndIsReadFalse(receiver);
    }

    /**
     * Get all notifications (admin only)
     */
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    /**
     * Send maintenance alert to driver
     */
    public Notification sendMaintenanceAlert(String driverUsername, String busNumber, String message) {
        return createNotification(
                "SYSTEM",
                driverUsername,
                Notification.NotificationType.MAINTENANCE,
                "Maintenance Required",
                message,
                busNumber
        );
    }

    /**
     * Send alert notification
     */
    public Notification sendAlert(String receiver, String title, String message, String busNumber) {
        return createNotification(
                "SYSTEM",
                receiver,
                Notification.NotificationType.ALERT,
                title,
                message,
                busNumber
        );
    }

    /**
     * Send info notification
     */
    public Notification sendInfo(String receiver, String title, String message) {
        return createNotification(
                "SYSTEM",
                receiver,
                Notification.NotificationType.INFO,
                title,
                message,
                null
        );
    }

    /**
     * Send warning notification
     */
    public Notification sendWarning(String receiver, String title, String message, String busNumber) {
        return createNotification(
                "SYSTEM",
                receiver,
                Notification.NotificationType.WARNING,
                title,
                message,
                busNumber
        );
    }
}
