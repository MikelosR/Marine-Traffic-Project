package com.seax.back.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;


@Entity //represents a database table
@Table(name = "users") //spring create a database table
public class User {

    @Id //Every user will have a different ID number (unique identifier)
    @GeneratedValue(strategy = GenerationType.IDENTITY) //database  automatically create ID numbers
    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role; // "USER", "ADMIN"

    //Many users can have many vessels in their fleets
    //LAZY = don't return the fleetVessels, if just want info for the user (/api/user/me)
    @ManyToMany(fetch = FetchType.LAZY)
    //Create a junction table to link users and vessels
    @JoinTable(
            name = "user_fleet_vessels",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "vessel_mmsi")
    )
    private final Set<Vessel> fleetVessels = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Zone zone;

    //Constructor (default)
    public User() {
    }

    //Constructor with all fields
    public User(String firstName, String lastName, String email, String password, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    //GETTERS
    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public Zone getZone() {
        return zone;
    }

    //SETTERS
    public void setId(Long id) {
        this.id = id;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }

    //Fleet methods
    public Set<Vessel> getFleetVessels() {
        return fleetVessels;
    }

    public void addVesselToFleet(Vessel vessel) {
        this.fleetVessels.add(vessel);
    }

    public void removeVesselFromFleet(Vessel vessel) {
        this.fleetVessels.remove(vessel);
    }

    //check if any vessel in user fleet has this mmsi
    public boolean hasVesselInFleet(Long mmsi) {
        return fleetVessels.stream().anyMatch(vessel -> vessel.getMmsi().equals(mmsi));
    }
}