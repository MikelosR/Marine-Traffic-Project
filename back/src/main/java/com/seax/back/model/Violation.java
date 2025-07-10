package com.seax.back.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mmsi;
    private String vesselName;
    private String violationType; // e.g., "Speed", "Type", "Status"
    private String description;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "zone_id")
    private Zone zone;

    // Constructors
    public Violation() {
    }

    public Violation(Long mmsi, String vesselName, String violationType, String description, LocalDateTime timestamp, Zone zone) {
        this.mmsi = mmsi;
        this.vesselName = vesselName;
        this.violationType = violationType;
        this.description = description;
        this.timestamp = timestamp;
        this.zone = zone;
    }

    // Getters and Setters
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

    public String getVesselName() {
        return vesselName;
    }

    public void setVesselName(String vesselName) {
        this.vesselName = vesselName;
    }

    public String getViolationType() {
        return violationType;
    }

    public void setViolationType(String violationType) {
        this.violationType = violationType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Zone getZone() {
        return zone;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }
}
