package com.seax.back.repository;

import com.seax.back.model.VesselPositionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface VesselPositionHistoryRepository extends JpaRepository<VesselPositionHistory, Long> {

    @Query("SELECT vph FROM VesselPositionHistory vph " +
            "WHERE vph.mmsi = :mmsi " +
            "AND vph.historyTimestamp >= :sinceTimestamp " +
            "ORDER BY vph.historyTimestamp ASC")
    List<VesselPositionHistory> findByMmsiAndTimestampAfter(
            @Param("mmsi") Long mmsi,
            @Param("sinceTimestamp") Long sinceTimestamp);

    @Transactional
    @Modifying
    @Query("DELETE FROM VesselPositionHistory vph " +
            "WHERE vph.historyTimestamp < :cutoffTimestamp")
    void deleteOldPositions(@Param("cutoffTimestamp") Long cutoffTimestamp);


    //Get track within time range (more precise)
    @Query("SELECT vph FROM VesselPositionHistory vph " +
            "WHERE vph.mmsi = :mmsi " +
            "AND vph.historyTimestamp BETWEEN :startTimestamp AND :endTimestamp " +
            "ORDER BY vph.historyTimestamp ASC")
    List<VesselPositionHistory> findByMmsiAndTimestampBetween(
            @Param("mmsi") Long mmsi,
            @Param("startTimestamp") Long startTimestamp,
            @Param("endTimestamp") Long endTimestamp);
}