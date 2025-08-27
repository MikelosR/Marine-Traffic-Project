package com.seax.back.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
@Data
@NoArgsConstructor
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mmsi;
    private String vesselName;
    private String violationType; //e.g., "Speed", "Type", "Status"
    private String description;
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "zone_id")
    private Zone zone;

    // Custom constructor (excludes auto-generated id)
    public Violation(Long mmsi, String vesselName, String violationType, String description, LocalDateTime timestamp, Zone zone) {
        this.mmsi = mmsi;
        this.vesselName = vesselName;
        this.violationType = violationType;
        this.description = description;
        this.timestamp = timestamp;
        this.zone = zone;
    }
}
