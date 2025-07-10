package com.seax.back.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vessel_position_history")
public class VesselPositionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mmsi;
    private Double latitude;
    private Double longitude;
    private Long historyTimestamp;

    //Constructors
    public VesselPositionHistory() {
    }

    public VesselPositionHistory(Long mmsi, Double latitude, Double longitude, Long timestamp) {
        this.mmsi = mmsi;
        this.latitude = latitude;
        this.longitude = longitude;
        this.historyTimestamp = timestamp;
    }

    //Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMmsi() {
        return mmsi;
    }

    public void setMmsi(Long mmsi) {
        this.mmsi = mmsi;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    } // ADD THIS

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    } // ADD THIS

    public Long getHistoryTimestamp() {
        return historyTimestamp;
    }

    public void setHistoryTimestamp(Long historyTimestamp) {
        this.historyTimestamp = historyTimestamp;
    } // ADD THIS
}