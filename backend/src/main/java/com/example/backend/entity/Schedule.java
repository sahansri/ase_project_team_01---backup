package com.example.backend.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;


@Document(collection = "schedules")
public class Schedule {

    @Id
    private String scheduleNumber;

    // Reference to the Bus entity
    @DBRef
    private Bus busId;

    @DBRef
    private Route routeId;

    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private LocalDate date;
    private String status;

    public Schedule() {
    }

    public Schedule(String scheduleNumber, LocalTime departureTime, LocalTime arrivalTime, LocalDate date, String status) {
        this.scheduleNumber = scheduleNumber;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.date = date;
        this.status = status;
    }

    public String getScheduleNumber() {
        return scheduleNumber;
    }

    public void setScheduleNumber(String scheduleNumber) {
        this.scheduleNumber = scheduleNumber;
    }

    public Bus getBus() {
        return busId;
    }

    public void setBus(Bus busId) {
        this.busId = busId;
    }

    public Route getRoute() {
        return routeId;
    }

    public void setRoute(Route routeId) {
        this.routeId = routeId;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
