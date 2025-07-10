package com.seax.back.controller;

import com.seax.back.model.Point;
import com.seax.back.model.Zone;
import com.seax.back.service.ZoneService;
import com.seax.back.util.AuthHelper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/zone")
public class ZoneController {

    private final ZoneService zoneService;
    private final AuthHelper authHelper;

    public ZoneController(ZoneService zoneService, AuthHelper authHelper) {
        this.zoneService = zoneService;
        this.authHelper = authHelper;
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateZone(@RequestBody Zone zone, @RequestHeader("Authorization") String authHeader) {

        try {

            Long userId = authHelper.getUserIdFromAuth(authHeader);

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            Zone userZone = zoneService.createOrUpdateZone(zone, userId);

            // Create response without circular reference
            ZoneResponse response = new ZoneResponse(
                    userZone.getId(),
                    userZone.getStartPoint(),
                    userZone.getEndPoint(),
                    userZone.getTypes(),
                    userZone.getStatus(),
                    userZone.getSpeedMax(),
                    userZone.getSpeedMin()
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ ERROR in createOrUpdateZone: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create/update zone: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getZoneByUser(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = authHelper.getUserIdFromAuth(authHeader);
            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            Optional<Zone> zoneOpt = zoneService.getZoneByUserId(userId);

            if (zoneOpt.isPresent()) {
                Zone zone = zoneOpt.get();
                // Create response without circular reference
                ZoneResponse response = new ZoneResponse(
                        zone.getId(),
                        zone.getStartPoint(),
                        zone.getEndPoint(),
                        zone.getTypes(),
                        zone.getStatus(),
                        zone.getSpeedMax(),
                        zone.getSpeedMin()
                );
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "No zone found for user."));
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR in getZoneByUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get zone: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteZone(@RequestHeader("Authorization") String authHeader) {

        Long userId = authHelper.getUserIdFromAuth(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));
        }


        try {
            boolean deleted = zoneService.deleteZoneByUserId(userId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Zone deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No zone found for user"));
            }
        } catch (Exception e) {
            System.err.println("❌ DEBUG: Exception in delete zone: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete zone: " + e.getMessage()));
        }
    }

    // Response class to prevent circular reference
    static class ZoneResponse {
        private final Long id;
        private final Point startPoint;
        private final Point endPoint;
        private final Set<String> types;
        private final Set<Integer> status;
        private final int speedMax;
        private final int speedMin;

        public ZoneResponse(Long id, Point startPoint, Point endPoint, Set<String> types, Set<Integer> status, int speedMax, int speedMin) {
            this.id = id;
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.types = types;
            this.status = status;
            this.speedMax = speedMax;
            this.speedMin = speedMin;
        }

        public Long getId() {
            return id;
        }

        public Point getStartPoint() {
            return startPoint;
        }

        public Point getEndPoint() {
            return endPoint;
        }

        public Set<String> getTypes() {
            return types;
        }

        public Set<Integer> getStatus() {
            return status;
        }

        public int getSpeedMax() {
            return speedMax;
        }

        public int getSpeedMin() {
            return speedMin;
        }
    }
}