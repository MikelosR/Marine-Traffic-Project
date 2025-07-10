package com.seax.back.service;

import com.seax.back.model.AisData;
import com.seax.back.model.User;
import com.seax.back.model.Vessel;
import com.seax.back.model.VesselPositionHistory;
import com.seax.back.repository.UserRepository;
import com.seax.back.repository.VesselPositionHistoryRepository;
import com.seax.back.repository.VesselRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service //Spring creates only ONE instance and injects it into controllers
public class VesselService {

    private final VesselRepository vesselRepository;
    private final UserRepository userRepository;
    private final VesselPositionHistoryRepository positionHistoryRepository;

    public VesselService(VesselRepository vesselRepository, UserRepository userRepository, VesselPositionHistoryRepository positionHistoryRepository) {
        this.vesselRepository = vesselRepository;
        this.userRepository = userRepository;
        this.positionHistoryRepository = positionHistoryRepository;
    }

    //Get vessels within rectangular area with optional fleet indication
    public List<Vessel> getVesselsInArea(double startX, double startY, double endX, double endY) {
        //Calculate bounding box
        double minLon = Math.min(startX, endX);
        double maxLon = Math.max(startX, endX);
        double minLat = Math.min(startY, endY);
        double maxLat = Math.max(startY, endY);

        //This service just returns the vessels
        return vesselRepository.findVesselsInArea(minLat, maxLat, minLon, maxLon);
    }

    //Get vessel by MMSI
    public Optional<Vessel> getVesselByMmsi(Long mmsi) {
        return vesselRepository.findByMmsi(mmsi);
    }

    //Get all vessels with basic info
    public List<Vessel> getAllVessels() {
        return vesselRepository.findAllOrderByName();
    }

    //Get user's fleet vessels
    public List<Vessel> getUserFleetVessels(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        //checks if there's actually something inside
        if (userOpt.isPresent()) {
            //LAZY LOADING: Fleet vessels are NOT loaded yet
            User user = userOpt.get(); //extracts the User object
            Set<Vessel> fleetVessels = user.getFleetVessels();
            return new ArrayList<>(fleetVessels); //triggers the database query!
        }
        return List.of(); //Empty list if user not found
    }

    //Add vessel to user's fleet
    @Transactional //If ANY part fails, rollback ALL database changes
    public boolean addVesselToFleet(Long mmsi, Long userId) {
        Optional<Vessel> vesselOpt = vesselRepository.findByMmsi(mmsi);
        Optional<User> userOpt = userRepository.findById(userId);

        if (vesselOpt.isPresent() && userOpt.isPresent()) {
            Vessel vessel = vesselOpt.get();
            User user = userOpt.get();

            //Check if vessel already in fleet
            if (!user.getFleetVessels().contains(vessel)) {
                user.addVesselToFleet(vessel);  //Add to user's fleet
                userRepository.save(user);      //Save to database
                return true;  //Success
            }
        }
        return false;  //Failed
    }

    //Remove vessel from user's fleet
    @Transactional
    public boolean removeVesselFromFleet(Long mmsi, Long userId) {
        Optional<Vessel> vesselOpt = vesselRepository.findByMmsi(mmsi);
        Optional<User> userOpt = userRepository.findById(userId);

        if (vesselOpt.isPresent() && userOpt.isPresent()) {
            Vessel vessel = vesselOpt.get();
            User user = userOpt.get();

            if (user.hasVesselInFleet(mmsi)) {
                user.removeVesselFromFleet(vessel);
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }

    //Check if vessel is in user's fleet
    public boolean isVesselInUserFleet(Long mmsi, Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.hasVesselInFleet(mmsi);
        }
        return false;
    }

    //Consumer gives me the dynamic data to update my vessel
    @Transactional //the vessel update happens completely or not at all
    public void updateVesselPosition(AisData data) {

        System.out.println("🔍 DEBUG: updateVesselPosition called for MMSI: " + data.getSourcemmsi());
        System.out.println("🔍 DEBUG: Position: [" + data.getLat() + ", " + data.getLon() + "]");
        System.out.println("🔍 DEBUG: Timestamp: " + data.getTimestamp());
        //Only update if vessel exists in our database
        Optional<Vessel> vesselOpt = vesselRepository.findByMmsi(data.getSourcemmsi());

        if (vesselOpt.isPresent()) {
            Vessel vessel = vesselOpt.get();
            System.out.println("✅ DEBUG: Found vessel: " + vessel.getName());
            vessel.setLatitude(data.getLat());
            vessel.setLongitude(data.getLon());
            vessel.setSpeedOverGround(data.getSpeedoverground());
            vessel.setCourseOverGround(data.getSpeedoverground());
            vessel.setTrueHeading(data.getTrueheading());
            vessel.setNavigationalStatus(data.getNavigationalstatus());
            vessel.setRateOfTurn(data.getRateofturn());
            vessel.setTimestamp(data.getTimestamp());

            vesselRepository.save(vessel);

            //Save position history
            try {
                System.out.println("🔍 DEBUG: Creating VesselPositionHistory...");
                VesselPositionHistory positionHistory = new VesselPositionHistory(
                        data.getSourcemmsi(), data.getLat(), data.getLon(), data.getTimestamp());

                System.out.println("🔍 DEBUG: VesselPositionHistory created:");
                System.out.println("  MMSI: " + positionHistory.getMmsi());
                System.out.println("  Lat: " + positionHistory.getLatitude());
                System.out.println("  Lon: " + positionHistory.getLongitude());
                System.out.println("  Timestamp: " + positionHistory.getHistoryTimestamp());

                System.out.println("🔍 DEBUG: Saving to database...");
                VesselPositionHistory saved = positionHistoryRepository.save(positionHistory);
                System.out.println("✅ DEBUG: Saved position history with ID: " + saved.getId());
                System.out.println("✅ Saved position history for vessel: " + data.getSourcemmsi());

            } catch (Exception e) {
                System.err.println("❌ DEBUG: Failed to save position history!");
                System.err.println("❌ DEBUG: Error: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            //Log the unknown vessel but don't create it (maintains data integrity)
            System.out.println("Received AIS data for unknown vessel: " + data.getSourcemmsi() + " - ignoring");
        }
    }

    //Get the 12-hour track for a vessel
    public List<VesselPositionHistory> getVesselTrack(Long mmsi) {
        //Get vessel's latest position timestamp
        Optional<Vessel> vesselOpt = vesselRepository.findByMmsi(mmsi);
        if (vesselOpt.isEmpty()) {
            return List.of();
        } //No vessel found
        Vessel vessel = vesselOpt.get();
        Long lastSignTimestamp = vessel.getTimestamp();

        if (lastSignTimestamp == null) {
            return List.of();
        } //No last position

        //Calculate 12 hours before vessel's last sign
        Long twelveHoursBeforeLastSign = timestamp_before_x_seconds(lastSignTimestamp, 12 * 3600L);

        return positionHistoryRepository.findByMmsiAndTimestampAfter(mmsi, twelveHoursBeforeLastSign);
    }

    @Scheduled(fixedRate = 1800000) //Run every 30 minutes
    @Transactional
    public void cleanupOldPositionHistory() {
        try {
            //Get all vessels that have timestamps (active vessels)
            List<Vessel> activeVessels = vesselRepository.findActiveVessels();
            if (activeVessels.isEmpty()) {
                return;
            }

            //Find the LATEST timestamp from all vessels (our "current time")
            Long latestTimestamp = null;
            for (Vessel vessel : activeVessels) {
                Long vesselTimestamp = vessel.getTimestamp();
                if (latestTimestamp == null || vesselTimestamp > latestTimestamp) {
                    latestTimestamp = vesselTimestamp;
                }
            }

            if (latestTimestamp != null) {
                //Calculate 12 hours before our "current time" (latest timestamp)
                Long cutoffTimestamp = timestamp_before_x_seconds(latestTimestamp, 12 * 3600L);

                //Delete position history records older than 12 hours from latest timestamp
                positionHistoryRepository.deleteOldPositions(cutoffTimestamp);

                System.out.println("🧹 Cleanup complete: removed data older than " + cutoffTimestamp);
                System.out.println("🧹 (12 hours before latest timestamp: " + latestTimestamp + ")");
            }

        } catch (Exception e) {
            System.err.println("❌ Error during position history cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }

    //Update vessel static data (Admin only)
    @Transactional
    public void updateVesselStaticData(Vessel vessel) {
        vesselRepository.save(vessel);
        System.out.println("✅ Admin updated vessel " + vessel.getMmsi() + " static data");
    }

    public List<Vessel> searchVessels(String query) {
        Pageable limit = PageRequest.of(0, 5); //First page, 5 results
        return vesselRepository.searchVesselsByNameOrMmsi(query, limit);
    }

    private Long timestamp_before_x_seconds(Long last_timestamp, Long twelve_hours) {
        return last_timestamp - twelve_hours;
    }
}
