package com.seax.back.repository;

import com.seax.back.model.Vessel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VesselRepository extends JpaRepository<Vessel, Long> { //Work with Vessel entities here


    //Find vessels within a rectangular area (bounding box)
    //For the /api/vessels/positions endpoint
    //JPQL (Java Persistence Query Language) query for Java objects
    @Query("SELECT v FROM Vessel v WHERE " +
            "v.latitude BETWEEN :minLat AND :maxLat AND " +
            "v.longitude BETWEEN :minLon AND :maxLon")
    List<Vessel> findVesselsInArea(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon
    );

    //Find vessel by MMSI
    Optional<Vessel> findByMmsi(Long mmsi);

    //Find all vessels with basic info (for general vessel list)
    @Query("SELECT v FROM Vessel v ORDER BY v.name")
    List<Vessel> findAllOrderByName();


    @Query("SELECT v FROM Vessel v WHERE " +
            "LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "CAST(v.mmsi AS string) LIKE CONCAT('%', :query, '%') " +
            "ORDER BY v.name")
    List<Vessel> searchVesselsByNameOrMmsi(@Param("query") String query, Pageable pageable);

    @Query("SELECT v FROM Vessel v WHERE v.latitude BETWEEN :minLat AND :maxLat AND v.longitude BETWEEN :minLon AND :maxLon")
    List<Vessel> findVesselsInBoundingBox(@Param("minLat") double minLat, @Param("maxLat") double maxLat, @Param("minLon") double minLon, @Param("maxLon") double maxLon);
    //For cleanup
    @Query("SELECT v FROM Vessel v WHERE v.timestamp IS NOT NULL")
    List<Vessel> findActiveVessels();

}