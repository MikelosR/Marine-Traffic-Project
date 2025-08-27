package com.seax.back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vessel_position_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VesselPositionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mmsi;
    private Double latitude;
    private Double longitude;
    private Long historyTimestamp;

    public VesselPositionHistory(Long mmsi, Double latitude, Double longitude, Long timestamp) {
        this.mmsi = mmsi;
        this.latitude = latitude;
        this.longitude = longitude;
        this.historyTimestamp = timestamp;
    }
}