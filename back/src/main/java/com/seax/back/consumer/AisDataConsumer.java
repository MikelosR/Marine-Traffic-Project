package com.seax.back.consumer;

//Jackson utility (from com.fasterxml.jackson.databind) knows how to map JSON to Java classes.

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seax.back.controller.AisWebSocketController;
import com.seax.back.model.AisData;
import com.seax.back.model.Vessel;
import com.seax.back.repository.VesselRepository;
import com.seax.back.service.StaticDataBatchProcessor;
import com.seax.back.service.VesselService;
import jakarta.annotation.PostConstruct;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AisDataConsumer {

    private final AisWebSocketController webSocketController;
    private final ObjectMapper objectMapper;
    private final VesselService vesselService;
    private final StaticDataBatchProcessor staticDataBatchProcessor;
    private final VesselRepository vesselRepository;


    //Cache country codes for performance (load once, use many times)
    private final Map<Integer, String> countryCodesCache = new HashMap<>();


    public AisDataConsumer(AisWebSocketController webSocketController,
                           ObjectMapper objectMapper, VesselService vesselService, StaticDataBatchProcessor staticDataBatchProcessor, VesselRepository vesselRepository) {

        this.webSocketController = webSocketController;
        this.objectMapper = objectMapper;
        this.vesselService = vesselService;
        this.staticDataBatchProcessor = staticDataBatchProcessor;
        this.vesselRepository = vesselRepository;
    }

    @PostConstruct
    public void init() {

        System.out.println(":) AisDataConsumer initialized and listening. :)");
        //Load country codes from StaticDataBatchProcessor
        try {
            Map<Integer, String> loadedCodes = staticDataBatchProcessor.loadCountryCodesMap();
            //modifying contents, not reassigning reference
            countryCodesCache.putAll(loadedCodes);
            System.out.println("...Loaded " + countryCodesCache.size() + " country codes into cache");
        } catch (Exception e) {
            System.err.println("XXX Failed to load country codes: " + e.getMessage());
            //Continue with empty cache
        }
    }


    //Whenever a message is published to topic ais-data, call this method and pass the message
    @KafkaListener(topics = "ais-data", groupId = "seax-group")
    public void consume(String message) {

        System.out.println("🔍 RAW MESSAGE RECEIVED: " + message);
        try {
            //converts a JSON string into a Java object
            AisData data = objectMapper.readValue(message, AisData.class);
            System.out.println(":) Received AisData:");
            System.out.println("MMSI: " + data.getSourcemmsi());
            System.out.println("Lat: " + data.getLat() + ", Lon: " + data.getLon());
            System.out.println("Speed: " + data.getSpeedoverground() + " knots");
            System.out.println("Course: " + data.getCourseoverground());
            System.out.println("Timestamp: " + data.getTimestamp());
            System.out.println("Trueheading: " + data.getTrueheading());
            System.out.println("Navigationalstatus: " + data.getNavigationalstatus());
            System.out.println("Rateofturn: " + data.getRateofturn());

            //Check if vessel belongs to table "vessels"
            Optional<Vessel> vesselOpt = vesselService.getVesselByMmsi(data.getSourcemmsi());
            Vessel vessel;
            if (!vesselOpt.isPresent()) {
                //Vessel not found - make one, with default static data
                System.out.println("XXX Vessel NOT FOUND in database!" + data.getSourcemmsi());
                vessel = createUnknownVessel(data.getSourcemmsi());
                //Save the new vessel.
                try {
                    vesselRepository.save(vessel);
                    System.out.println(":) Created new vessel with MMSI: " + data.getSourcemmsi());
                } catch (Exception e) {
                    System.err.println("XXX Failed to save new vessel: " + e.getMessage());
                }
            } else {
                //VESSEL EXISTS - GET IT FROM THE OPTIONAL!
                vessel = vesselOpt.get();
            }

            //Update vessel position (for both existing and new vessels)
            try {
                //Update vessel position if exists or not
                vesselService.updateVesselPosition(data);
                data.setName(vessel.getName());
                data.setType(vessel.getType());
                data.setCountry(vessel.getCountry());
                data.setImo(vessel.getImo());
                data.setCallsign(vessel.getCallsign());
                System.out.println("📍 Updated position for MMSI: " + data.getSourcemmsi());
            } catch (Exception e) {
                System.err.println("XXX FAILED to update position for MMSI: " + data.getSourcemmsi());
            }
            //Send to WebSocket clients
            webSocketController.sendAisUpdate(data);

        } catch (Exception e) {
            System.err.println("XXX FAILED to parse Kafka message: " + message);
            e.printStackTrace();
        }
    }

    private String extractCountryFromMmsi(Long mmsi) {
        try {
            String mmsiStr = mmsi.toString();
            Integer countryCode;

            if (mmsiStr.length() >= 3) {
                countryCode = Integer.parseInt(mmsiStr.substring(0, 3));
                //Use cached country codes for performance
                return countryCodesCache.getOrDefault(countryCode, "Unknown");
            }
            return "Unknown country";

        } catch (Exception e) {
            System.err.println("XXX ERROR extracting country for MMSI " + mmsi + ": " + e.getMessage());
            return "Unknown country";
        }
    }

    private Vessel createUnknownVessel(Long mmsi) {
        Vessel vessel = new Vessel(mmsi, "Unknown Vessel Type");

        //Extract country from MMSI
        String country = extractCountryFromMmsi(mmsi);
        vessel.setCountry(country);

        //Set unknown static data
        vessel.setName("Unknown Vessel Name");
        vessel.setCallsign("Unknown Callsign");
        vessel.setImo(null);

        return vessel;
    }
}