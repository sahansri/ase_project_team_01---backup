package com.example.backend.Scheduling;

import com.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class NotificationCleanupScheduler {

    @Autowired
    private NotificationRepository notificationRepository;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void deleteOldNotifications() {
        Instant oneDayAgo = Instant.now().minus(1, ChronoUnit.DAYS);
        notificationRepository.deleteByCreatedAtBefore(Date.from(oneDayAgo));
    }
}
