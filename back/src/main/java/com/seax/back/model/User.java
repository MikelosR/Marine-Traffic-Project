package com.seax.back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;


@Entity //represents a database table
@Table(name = "users") //spring create a database table
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    //Constructor with all fields
    public User(String firstName, String lastName, String email, String password, String role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    //getFleetVessels() and other getters, seters, comes from lombok
    //Fleet methods
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