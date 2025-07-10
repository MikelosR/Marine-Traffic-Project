package com.seax.back.service;

import com.seax.back.model.Vessel;
import com.seax.back.model.Violation;
import com.seax.back.model.Zone;
import com.seax.back.repository.VesselRepository;
import com.seax.back.repository.ViolationRepository;
import com.seax.back.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ViolationService {

    private final VesselRepository vesselRepository;
    private final ZoneRepository zoneRepository;
    private final ViolationRepository violationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ViolationService(VesselRepository vesselRepository, ZoneRepository zoneRepository, ViolationRepository violationRepository, SimpMessagingTemplate messagingTemplate) {
        this.vesselRepository = vesselRepository;
        this.zoneRepository = zoneRepository;
        this.violationRepository = violationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 60000) // Check for violations every minute
    public void checkAllZonesAndVessels() {
        List<Zone> zones = zoneRepository.findAll();

        for (Zone zone : zones) {
            double minLat = Math.min(zone.getStartPoint().getLat(), zone.getEndPoint().getLat());
            double maxLat = Math.max(zone.getStartPoint().getLat(), zone.getEndPoint().getLat());
            double minLon = Math.min(zone.getStartPoint().getLon(), zone.getEndPoint().getLon());
            double maxLon = Math.max(zone.getStartPoint().getLon(), zone.getEndPoint().getLon());

            List<Vessel> vesselsInZone = vesselRepository.findVesselsInBoundingBox(minLat, maxLat, minLon, maxLon);

            for (Vessel vessel : vesselsInZone) {
                checkViolations(vessel, zone);
            }
        }
    }

    private void checkViolations(Vessel vessel, Zone zone) {
        // Check for speed violations
        if (vessel.getSpeedOverGround() > zone.getSpeedMax()) {
            createViolation(vessel, zone, "Speed", "Exceeded maximum speed limit");
        }
        if (vessel.getSpeedOverGround() < zone.getSpeedMin()) {
            createViolation(vessel, zone, "Speed", "Below minimum speed limit");
        }

        // Check for vessel type violations
        if (!zone.getTypes().isEmpty() && !zone.getTypes().contains(vessel.getVesselType())) {
            createViolation(vessel, zone, "Type", "Vessel type not allowed in zone");
        }

        // Check for navigational status violations
        if (!zone.getStatus().isEmpty() && !zone.getStatus().contains(vessel.getNavigationalStatus())) {
            createViolation(vessel, zone, "Status", "Navigational status not allowed in zone");
        }
    }

    private void createViolation(Vessel vessel, Zone zone, String type, String description) {
        Violation violation = new Violation(
                vessel.getMmsi(),
                vessel.getName(),
                type,
                description,
                LocalDateTime.now(),
                zone
        );
        violationRepository.save(violation);

        if (zone.getUser() != null) {
            Long userId = zone.getUser().getId();
            messagingTemplate.convertAndSend("/topic/violations/" + userId, violation);
        }
    }

}
