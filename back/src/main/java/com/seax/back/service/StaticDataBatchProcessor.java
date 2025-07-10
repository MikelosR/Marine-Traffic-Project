package com.seax.back.service;

import com.opencsv.CSVReader;
import com.seax.back.model.Vessel;
import com.seax.back.repository.VesselRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.*;

@Service
public class StaticDataBatchProcessor {

    @Autowired
    private VesselRepository vesselRepository;

    @Transactional
    public void loadAllStaticData() {
        //Check if vessels already loaded
        long existingVessels = vesselRepository.count();
        if (existingVessels > 0) {
            System.out.println("✅ Vessels already initialized. Count: " + existingVessels);
            return;
        }
        System.out.println("🔧 Starting batch processing of static vessel data...");

        try {
            //Load vessel types, country file, static data file
            Map<Long, String> vesselTypesMap = loadVesselTypes();
            Map<Integer, String> countryCodesMap = loadCountryCodesMap();
            Map<Long, Vessel> staticInfoMap = loadStaticInfo();

            System.out.println("📊 Data loaded and consolidated:");
            System.out.println("   - Unique vessel MMSIs: " + vesselTypesMap.size());
            System.out.println("   - Country codes: " + countryCodesMap.size());
            System.out.println("   - Consolidated static info: " + staticInfoMap.size());

            //Merge all maps into final vessel set, convert in arraylist and save to repository
            Set<Vessel> finalVesselSet = mergeAllDataIntoVesselSet(vesselTypesMap, countryCodesMap, staticInfoMap);
            List<Vessel> vesselsList = new ArrayList<>(finalVesselSet);
            vesselRepository.saveAll(vesselsList); //.saveAll() comes from extends JpaRepository<Vessel, Long>

            System.out.println("✅ Static vessel database initialization complete!");
            System.out.println("📊 Final vessel count: " + finalVesselSet.size() + " unique MMSIs");

        } catch (Exception e) {
            System.err.println("❌ CRITICAL ERROR during static data batch processing: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize vessel database", e);
        }
    }

    //Take type from vessel_types.csv
    //Returns Map<MMSI, VesselType> with duplicate validation
    private Map<Long, String> loadVesselTypes() {
        Map<Long, String> vesselTypesMap = new HashMap<>();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("vessel_types.csv");
             CSVReader reader = new CSVReader(new InputStreamReader(is))) {

            if (is == null) {
                throw new RuntimeException("❌ CRITICAL: vessel_types.csv not found in resources folder");
            }

            reader.readNext(); //Skip header
            String[] nextLine;
            int lineNumber = 1; //Start from 1 after header

            while ((nextLine = reader.readNext()) != null) {
                lineNumber++;

                if (nextLine.length >= 2) {
                    try {
                        Long mmsi = Long.parseLong(nextLine[0].trim());
                        String vesselType = nextLine[1].trim();

                        //Check for duplicate MMSI
                        if (!vesselTypesMap.containsKey(mmsi)) {
                            //Save both MMSI and type
                            vesselTypesMap.put(mmsi, vesselType);
                        } else System.err.println("❌ Dublicate mmsi vessel_types");

                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ Invalid MMSI at line " + lineNumber + ": " + nextLine[0]);
                    }
                } else {
                    System.err.println("⚠️ Insufficient columns at line " + lineNumber + ": " + String.join(",", nextLine));
                }
            }

            System.out.println("✅ vessel_types.csv validation complete:");
            System.out.println("   - Unique MMSIs with types: " + vesselTypesMap.size());

        } catch (Exception e) {
            System.err.println("❌ Error loading vessel_types.csv: " + e.getMessage());
            throw new RuntimeException("Failed to load vessel types", e);
        }
        return vesselTypesMap;
    }

    //Take from MMSI_Country_Codes.csv the country flag according to the first 3 digits of mmsi
    public Map<Integer, String> loadCountryCodesMap() {
        Map<Integer, String> countryCodes = new HashMap<>();

        try (InputStream is = getClass().getClassLoader().getResourceAsStream("MMSI_Country_Codes.csv");
             CSVReader reader = new CSVReader(new InputStreamReader(is))) {

            if (is == null) {
                throw new RuntimeException("❌ CRITICAL: MMSI_Country_Codes.csv not found in resources folder");
            }

            String[] nextLine;

            while ((nextLine = reader.readNext()) != null) {
                if (nextLine.length >= 2) {
                    try {
                        Integer countryCode = Integer.parseInt(nextLine[0].trim());
                        String countryName = nextLine[1].trim();
                        countryCodes.put(countryCode, countryName);
                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ Invalid country code line: " + String.join(",", nextLine));
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("❌ Error loading MMSI_Country_Codes.csv: " + e.getMessage());
            System.exit(1); //Terminate program
        }
        return countryCodes;
    }

    //Take from nari_static.csv the shipname, imo, callsign
    private Map<Long, Vessel> loadStaticInfo() {
        Map<Long, Vessel> consolidatedInfo = new HashMap<>();

        try (InputStream input_stream = getClass().getClassLoader().getResourceAsStream("nari_static.csv");
             CSVReader reader = new CSVReader(new InputStreamReader(input_stream))) {

            if (input_stream == null) {
                throw new RuntimeException("❌ CRITICAL: nari_static.csv not found in resources folder");
            }

            reader.readNext(); //Skip header
            String[] nextLine;
            int recordsProcessed = 0;

            while ((nextLine = reader.readNext()) != null) {
                if (nextLine.length >= 4) { //Need at least mmsi, imo, callsign, shipname
                    try {
                        Long mmsi = Long.parseLong(nextLine[0].trim());

                        //Parse only the fields we need: IMO, callsign, shipname
                        Long imo = parseLongOrNull(nextLine[1]);
                        String callsign = parseStringOrNull(nextLine[2]);
                        String shipname = parseStringOrNull(nextLine[3]);

                        //If the MMSI already exists in the map: return the existing ConsolidatedStaticInfo object
                        //otherwise create a new ConsolidatedStaticInfo() object,
                        Vessel vessel = consolidatedInfo.computeIfAbsent(mmsi, k -> {
                            Vessel v = new Vessel();
                            v.setMmsi(k);
                            return v;
                        });

                        //Update with better data if available
                        if (vessel.getName() == null && shipname != null && !shipname.trim().isEmpty()) {
                            vessel.setName(shipname.trim());
                        }
                        if (vessel.getImo() == null && imo != null) {
                            vessel.setImo(imo);
                        }
                        if (vessel.getCallsign() == null && callsign != null && !callsign.trim().isEmpty()) {
                            vessel.setCallsign(callsign.trim());
                        }
                        recordsProcessed++;

                    } catch (NumberFormatException e) {
                        System.err.println("⚠️ Invalid MMSI in static data: " + nextLine[0]);
                    }
                }
            }

            System.out.println("📄 Processed " + recordsProcessed + " static records into " + consolidatedInfo.size() +
                    " consolidated vessel profiles");

        } catch (Exception e) {
            System.err.println("❌ Error loading nari_static.csv: " + e.getMessage());
            //Continue without static info - vessels will use default names
        }
        return consolidatedInfo;
    }

    //Merge all loaded data into final vessel set
    //Final fields: mmsi, imo, callsign, shipname, country, vesselType
    private Set<Vessel> mergeAllDataIntoVesselSet(Map<Long, String> vesselTypesMap,
                                                  Map<Integer, String> countryCodesMap,
                                                  Map<Long, Vessel> staticInfoMap) {

        Set<Vessel> finalVesselSet = new HashSet<>();

        // STEP 1: Get ALL unique MMSIs from both sources
        Set<Long> allDistinctMmsis = new HashSet<>();
        allDistinctMmsis.addAll(vesselTypesMap.keySet());        // From vessel_types.csv
        allDistinctMmsis.addAll(staticInfoMap.keySet());         // From nari_static.csv

        //STEP 2: Process ALL distinct MMSIs
        for (Long mmsi : allDistinctMmsis) {

            //Create vessel with MMSI
            Vessel vessel = new Vessel();
            vessel.setMmsi(mmsi);

            //Determine which data sources contain this MMSI
            boolean inVesselTypes = vesselTypesMap.containsKey(mmsi);
            boolean inStaticInfo = staticInfoMap.containsKey(mmsi);


            //RULE 1: Set vessel type
            if (inVesselTypes) {
                String vesselType = vesselTypesMap.get(mmsi);
                vessel.setVesselType(vesselType);
            } else {
                //Vessel is ONLY in staticInfoMap, NOT in vesselTypesMap
                vessel.setVesselType("Unknown Vessel Type");
                System.out.println("   ➡️ Type: 'Unknown' (Not in vessel_types.csv)");
            }

            //RULE 2: Set static info (name, IMO, callsign)
            if (inStaticInfo) {
                Vessel staticInfo = staticInfoMap.get(mmsi);
                String name = staticInfo.getName() != null ? staticInfo.getName() : "Unknown Vessel Name";
                String callsign = staticInfo.getCallsign() != null ? staticInfo.getCallsign() : "Unknown Callsign";

                vessel.setName(name);
                vessel.setImo(staticInfo.getImo());  //Can be null
                vessel.setCallsign(callsign);
            } else {
                //Vessel is ONLY in vesselTypesMap, NOT in staticInfoMap
                vessel.setName("Unknown Vessel Name");
                vessel.setImo(null);
                vessel.setCallsign("Unknown Callsign");
            }

            //RULE 3: Set country based on MMSI prefix
            String mmsiStr = mmsi.toString();
            String country = "Unknown country";

            if (mmsiStr.length() >= 3) {
                Integer countryCode = Integer.parseInt(mmsiStr.substring(0, 3));
                if (countryCodesMap.containsKey(countryCode)) {
                    country = countryCodesMap.get(countryCode);
                } else {
                    //3-digit prefix not found in country codes map
                    System.out.println("   ⚠️ Country code " + countryCode + " not found in countryCodesMap");
                }
                vessel.setCountry(country);
            } else {
                //MMSI has 2 or fewer digits
                vessel.setCountry(country);
                System.out.println("   ⚠️ MMSI " + mmsi + " has only " + mmsiStr.length() + " digits - cannot extract country");
            }

            finalVesselSet.add(vessel);
        }

        /*if (finalVesselSet.size() > 0) {
            System.out.println("\n🔍 Sample of created vessels:");
            int sampleCount = 0;
            for (Vessel v : finalVesselSet) {
                if (sampleCount++ >= 3) break;
                System.out.println("   " + sampleCount + ". MMSI: " + v.getMmsi() +
                        ", Type: '" + v.getVesselType() +
                        "', Name: '" + v.getName() +
                        "', Country: '" + v.getCountry() + "'");
            }
        }*/

        return finalVesselSet;
    }

    //Helper methods for parsing CSV data safely
    private Long parseLongOrNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String parseStringOrNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}