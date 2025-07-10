package com.seax.back.controller;

import com.seax.back.model.Vessel;
import com.seax.back.model.VesselPositionHistory;
import com.seax.back.service.JwtService;
import com.seax.back.service.VesselService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class VesselController {

    private final VesselService vesselService;

    private final JwtService jwtService;

    public VesselController(VesselService vesselService, JwtService jwtService) {
        this.vesselService = vesselService;
        this.jwtService = jwtService;
    }

    //Helper method to reduce duplication
    private Long extractUserIdFromAuth(String authHeader) {
        if (authHeader != null && jwtService.isTokenValid(authHeader)) {
            return jwtService.getUserIdFromToken(authHeader);
        }
        return null;
    }

    //Helper method for authentication validation
    private ResponseEntity<?> validateAuthAndGetUserId(String authHeader) {
        if (!jwtService.isTokenValid(authHeader)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        Long userId = jwtService.getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Could not extract user from token"));
        }
        return null; //No error
    }

    //Helper method to check if user is admin
    private boolean isAdminUser(String authHeader) {
        if (authHeader == null || !jwtService.isTokenValid(authHeader)) {
            return false;
        }

        String role = jwtService.getRoleFromToken(authHeader);
        return "ADMIN".equals(role);
    }

    /*CHECK LON LAT*/
    //PUBLIC - Get vessels within rectangular area
    //GET /api/vessels/positions?start={x,y}&end={x,y}
    @GetMapping("/vessels/positions")
    public ResponseEntity<?> getVesselsInArea(
            @RequestParam String start, //Get value from URL parameter
            @RequestParam String end,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            //Parse start and end coordinates
            String[] startCoords = start.split(",");
            String[] endCoords = end.split(",");

            if (startCoords.length != 2 || endCoords.length != 2) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid coordinate format. Use: x,y"));
            }

            double startX = Double.parseDouble(startCoords[0]);
            double startY = Double.parseDouble(startCoords[1]);
            double endX = Double.parseDouble(endCoords[0]);
            double endY = Double.parseDouble(endCoords[1]);

            //Get user ID if token provided
            Long userId = extractUserIdFromAuth(authHeader);
            //Take the vessels in this area
            List<Vessel> vessels = vesselService.getVesselsInArea(startX, startY, endX, endY);

            //Create response with required fields
            List<Map<String, Object>> response = new ArrayList<>();
            for (Vessel vessel : vessels) {
                Map<String, Object> vesselData = new HashMap<>();
                vesselData.put("mmsi", vessel.getMmsi());
                vesselData.put("name", vessel.getName());
                vesselData.put("latitude", vessel.getLatitude());
                vesselData.put("longitude", vessel.getLongitude());
                vesselData.put("heading", vessel.getHeading());
                vesselData.put("type", vessel.getType());
                vesselData.put("country", vessel.getCountry());
                vesselData.put("status", vessel.getStatus());
                vesselData.put("speed", vessel.getSpeedOverGround());

                //Add isInFleet if user is logged in
                if (userId != null) {
                    boolean inFleet = vesselService.isVesselInUserFleet(vessel.getMmsi(), userId);
                    vesselData.put("isInFleet", inFleet);
                }
                response.add(vesselData);
            }

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid coordinate format. Use numeric values."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }

    //PUBLIC - Get vessel by MMSI
    //GET /api/vessels?id={mmsi}
    @GetMapping("/vessels/{id}")
    public ResponseEntity<Map<String, Object>> getVesselById(
            @PathVariable Long id,
            //Get value from HTTP header
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long mmsi = id;
        Optional<Vessel> vesselOpt = vesselService.getVesselByMmsi(mmsi);

        if (vesselOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Vessel vessel = vesselOpt.get();

        //Get user ID if token provided
        Long userId = null;
        if (authHeader != null && jwtService.isTokenValid(authHeader)) {
            userId = jwtService.getUserIdFromToken(authHeader);
        }

        //Create detailed response - only user-friendly fields
        Map<String, Object> response = new HashMap<>();
        response.put("mmsi", vessel.getMmsi());
        response.put("name", vessel.getName());
        response.put("type", vessel.getType());
        response.put("country", vessel.getCountry());
        response.put("latitude", vessel.getLatitude());
        response.put("longitude", vessel.getLongitude());
        response.put("heading", vessel.getHeading());
        response.put("speed", vessel.getSpeedOverGround());
        response.put("status", vessel.getStatus());
        response.put("courseOverGround", vessel.getCourseOverGround());
        response.put("rateOfTurn", vessel.getRateOfTurn());
        response.put("timestamp", vessel.getTimestamp());

        //Add isInFleet if user is logged in
        if (userId != null) {
            boolean isInFleet = vesselService.isVesselInUserFleet(mmsi, userId);
            response.put("isInFleet", isInFleet);
        }

        return ResponseEntity.ok(response);
    }

    /*Check RETURN name*/
    //PUBLIC - Get all vessels (basic info) (all vessels SORTED!)
    //GET /api/vessels (when no id parameter)
    @GetMapping("/vessels")
    public ResponseEntity<?> getAllVessels(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        //Get user ID if token provided
        Long userId = null;
        if (authHeader != null && jwtService.isTokenValid(authHeader)) {
            userId = jwtService.getUserIdFromToken(authHeader);
        }

        List<Vessel> vessels = vesselService.getAllVessels();

        //Create response with basic fields
        List<Map<String, Object>> response = new ArrayList<>();
        for (Vessel vessel : vessels) {
            Map<String, Object> vesselData = new HashMap<>();
            vesselData.put("mmsi", vessel.getMmsi());
            vesselData.put("name", vessel.getName());
            vesselData.put("type", vessel.getType());
            vesselData.put("country", vessel.getCountry());

            //Add position if available
            if (vessel.getLatitude() != null && vessel.getLongitude() != null) {
                vesselData.put("latitude", vessel.getLatitude());
                vesselData.put("longitude", vessel.getLongitude());
            }

            //Add isInFleet if user is logged in
            if (userId != null) {
                vesselData.put("isInFleet", vesselService.isVesselInUserFleet(vessel.getMmsi(), userId));
            }

            response.add(vesselData);
        }

        return ResponseEntity.ok(response);
    }

    //PRIVATE - Get user's fleet
    //GET /api/fleet
    @GetMapping("/fleet")
    public ResponseEntity<?> getUserFleet(
            @RequestHeader("Authorization") String authHeader) {

        if (!jwtService.isTokenValid(authHeader)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        Long userId = jwtService.getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Could not extract user from token"));
        }

        List<Vessel> fleetVessels = vesselService.getUserFleetVessels(userId);

        //Create response
        List<Map<String, Object>> response = new ArrayList<>();
        for (Vessel vessel : fleetVessels) {
            Map<String, Object> vesselData = new HashMap<>();
            vesselData.put("mmsi", vessel.getMmsi());
            vesselData.put("name", vessel.getName());
            vesselData.put("type", vessel.getType());
            vesselData.put("country", vessel.getCountry());

            //Add position if available
            if (vessel.getLatitude() != null && vessel.getLongitude() != null) {
                vesselData.put("latitude", vessel.getLatitude());
                vesselData.put("longitude", vessel.getLongitude());
            }

            response.add(vesselData);
        }

        return ResponseEntity.ok(response);
    }


    //ADMIN
    //PUT /api/vessels/{mmsi}  PRIVATE
    @PutMapping("/vessels/{mmsi}")
    public ResponseEntity<?> updateVesselStaticData(
            @PathVariable Long mmsi,
            @RequestBody Map<String, String> request,  // Simple Map instead of custom class
            @RequestHeader("Authorization") String authHeader) {

        //Check if user is admin
        if (!isAdminUser(authHeader)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Admin access required"));
        }

        try {
            Optional<Vessel> vesselOpt = vesselService.getVesselByMmsi(mmsi);

            if (vesselOpt.isPresent()) {
                Vessel vessel = vesselOpt.get();

                //Update only provided fields
                if (request.containsKey("name") && request.get("name") != null) {
                    vessel.setName(request.get("name").trim());
                }

                if (request.containsKey("type") && request.get("type") != null) {
                    vessel.setVesselType(request.get("type").trim());
                }

                if (request.containsKey("country") && request.get("country") != null) {
                    vessel.setCountry(request.get("country").trim());
                }

                //Save using service
                vesselService.updateVesselStaticData(vessel);

                return ResponseEntity.ok(Map.of(
                        "message", "Vessel static data updated successfully",
                        "mmsi", mmsi
                ));
            } else {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "Vessel not found with MMSI: " + mmsi));
            }

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to update vessel: " + e.getMessage()));
        }

    }

    //PRIVATE - Add vessel to user's fleet
    //PUT /api/vessel/fleet?id={mmsi}
    @PutMapping("/vessel/fleet")
    public ResponseEntity<?> addVesselToFleet(
            @RequestParam Long id,
            @RequestHeader("Authorization") String authHeader) {

        ResponseEntity<?> authError = validateAuthAndGetUserId(authHeader);
        //Null here means ok authorization
        if (authError != null) return authError;

        Long userId = jwtService.getUserIdFromToken(authHeader);
        boolean success = vesselService.addVesselToFleet(id, userId);

        return success ?
                ResponseEntity.ok(Map.of("message", "Vessel added to fleet successfully")) :
                ResponseEntity.badRequest().body(Map.of("error", "Could not add vessel to fleet"));
    }

    //PRIVATE - Remove vessel from user's fleet
    //DELETE /api/vessel/fleet?id={mmsi}
    @DeleteMapping("/vessel/fleet")
    public ResponseEntity<?> removeVesselFromFleet(
            @RequestParam Long id,
            @RequestHeader("Authorization") String authHeader) {

        ResponseEntity<?> authError = validateAuthAndGetUserId(authHeader);
        //Null here means ok authorization
        if (authError != null) return authError;

        Long userId = jwtService.getUserIdFromToken(authHeader);
        boolean success = vesselService.removeVesselFromFleet(id, userId);

        return success ?
                ResponseEntity.ok(Map.of("message", "Vessel removed from fleet successfully")) :
                ResponseEntity.badRequest().body(Map.of("error", "Could not remove vessel from fleet"));
    }

    //PUBLIC - Get vessel's 12-hour track
    //GET /api/vessels/{mmsi}/track
    @GetMapping("/vessels/{mmsi}/track")
    public ResponseEntity<?> getVesselTrack(@PathVariable Long mmsi) {
        try {
            List<VesselPositionHistory> track = vesselService.getVesselTrack(mmsi);

            //Convert to frontend-friendly format
            List<Map<String, Object>> trackData = new ArrayList<>();
            for (VesselPositionHistory position : track) {
                Map<String, Object> point = new HashMap<>();
                point.put("latitude", position.getLatitude());
                point.put("longitude", position.getLongitude());
                point.put("timestamp", position.getHistoryTimestamp().toString());
                trackData.add(point);
            }

            return ResponseEntity.ok(Map.of(
                    "mmsi", mmsi,
                    "trackPoints", trackData,
                    "pointCount", trackData.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get vessel track: " + e.getMessage()));
        }
    }

    //PUBLIC - Search vessels by name or MMSI
    //GET /api/vessels/search?query={searchTerm}
    @GetMapping("/vessels/search")
    public ResponseEntity<?> searchVessels(
            @RequestParam String query,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Search query cannot be empty"));
        }

        try {
            Long userId = extractUserIdFromAuth(authHeader);
            List<Vessel> vessels = vesselService.searchVessels(query.trim());

            //Create response with basic vessel info
            List<Map<String, Object>> response = new ArrayList<>();
            for (Vessel vessel : vessels) {
                Map<String, Object> vesselData = new HashMap<>();
                vesselData.put("mmsi", vessel.getMmsi());
                vesselData.put("name", vessel.getName());
                vesselData.put("type", vessel.getType());
                vesselData.put("country", vessel.getCountry());

                if (vessel.getLatitude() != null && vessel.getLongitude() != null) {
                    vesselData.put("latitude", vessel.getLatitude());
                    vesselData.put("longitude", vessel.getLongitude());
                }

                //Add isInFleet if user is logged in
                if (userId != null) {
                    vesselData.put("isInFleet", vesselService.isVesselInUserFleet(vessel.getMmsi(), userId));
                }

                response.add(vesselData);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Search failed: " + e.getMessage()));
        }
    }
}