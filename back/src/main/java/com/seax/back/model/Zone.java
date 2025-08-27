package com.seax.back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Entity
@Table(name = "zones")
@Data
@NoArgsConstructor
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "start_lat")),
            @AttributeOverride(name = "lon", column = @Column(name = "start_lon"))
    })
    private Point startPoint;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "end_lat")),
            @AttributeOverride(name = "lon", column = @Column(name = "end_lon"))
    })
    private Point endPoint;

    //Constraints
    @ElementCollection
    @CollectionTable(name = "zone_types", joinColumns = @JoinColumn(name = "zone_id"))
    @Column(name = "type")
    private Set<String> types;

    @ElementCollection
    @CollectionTable(name = "zone_status", joinColumns = @JoinColumn(name = "zone_id"))
    @Column(name = "status")
    private Set<Integer> status;

    private int speedMax;
    private int speedMin;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    private User user;
}