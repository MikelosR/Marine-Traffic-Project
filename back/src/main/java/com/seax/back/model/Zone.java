package com.seax.back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "zones")
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

    public Point getStartPoint() {
        return startPoint;
    }

    public void setStartPoint(Point startPoint) {
        this.startPoint = startPoint;
    }

    public Set<String> getTypes() {
        return types;
    }

    public void setTypes(Set<String> types) {
        this.types = types;
    }

    public Set<Integer> getStatus() {
        return status;
    }

    public void setStatus(Set<Integer> status) {
        this.status = status;
    }

    public int getSpeedMax() {
        return speedMax;
    }

    public void setSpeedMax(int speedMax) {
        this.speedMax = speedMax;
    }

    public int getSpeedMin() {
        return speedMin;
    }

    public void setSpeedMin(int speedMin) {
        this.speedMin = speedMin;
    }

    public Point getEndPoint() {
        return endPoint;
    }

    public void setEndPoint(Point endPoint) {
        this.endPoint = endPoint;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}