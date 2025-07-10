package com.seax.back.service;

import com.seax.back.model.User;
import com.seax.back.model.Zone;
import com.seax.back.repository.UserRepository;
import com.seax.back.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

@Service
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ZoneService(ZoneRepository zoneRepository, UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.zoneRepository = zoneRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Zone createOrUpdateZone(Zone newZoneData, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found with id: " + userId));

        return zoneRepository.findByUserId(userId)
            .map(existingZone -> {
                // Update existing zone
                existingZone.setStartPoint(newZoneData.getStartPoint());
                existingZone.setEndPoint(newZoneData.getEndPoint());
                existingZone.setTypes(newZoneData.getTypes());
                existingZone.setStatus(newZoneData.getStatus());
                existingZone.setSpeedMax(newZoneData.getSpeedMax());
                existingZone.setSpeedMin(newZoneData.getSpeedMin());
                return zoneRepository.save(existingZone);
            })
            .orElseGet(() -> {
                // Create new zone
                newZoneData.setUser(user);
                return zoneRepository.save(newZoneData);
            });
    }

    public Optional<Zone> getZoneByUserId(Long userId) {
        return zoneRepository.findByUserId(userId);
    }

    @Transactional
    public boolean deleteZoneByUserId(Long userId) {
        System.out.println("🔍 DEBUG: Attempting to delete zone for userId: " + userId);
        
        try {
            Optional<Zone> zoneOpt = zoneRepository.findByUserId(userId);
            
            if (zoneOpt.isPresent()) {
                Zone zone = zoneOpt.get();
                System.out.println("✅ DEBUG: Found zone with ID: " + zone.getId());
                
                User user = zone.getUser();
                
                if (user != null) {
                    System.out.println("✅ DEBUG: Found associated user with ID: " + user.getId());
                    // Sever the link from the User side
                    user.setZone(null);
                    userRepository.save(user);
                    System.out.println("✅ DEBUG: Updated user, removed zone reference");
                } else {
                    System.out.println("⚠️ DEBUG: Zone exists but has no associated user");
                }
                
                // Also explicitly delete the zone to be sure
                zoneRepository.delete(zone);
                System.out.println("✅ DEBUG: Zone deleted successfully");
                return true;
            } else {
                System.out.println("ℹ️ DEBUG: No zone found for userId: " + userId);
                return false; // No zone found for this user
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR: Failed to delete zone for userId " + userId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete zone", e);
        }
    }
}