package com.seax.back.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity //This class represents a database table
@Table(name = "vessels") //Spring would create vessels table
@Data
@NoArgsConstructor
public class Vessel {

    @Id //Primary Key for the vessels database table
    private Long mmsi; //MMSI as primary key (from vessels_types.csv)

    //Static vessel data (loaded once at startup)
    private String vesselType;     //From vessel_types.csv (cargo, fishing, etc.)
    private String country;        //Derived from MMSI prefix + MMSI_Country_Codes.csv
    private String name;           //From nari_ais_static.csv (consolidated ship name) or default
    private Long imo;              //From nari_ais_static.csv (consolidated IMO)
    private String callsign;       //From nari_ais_static.csv (consolidated call sign)

    //Dynamic vessel data (from nari_dynamic.csv streaming)
    private Integer navigationalStatus;
    private Integer rateOfTurn;
    private Double speedOverGround;
    private Double courseOverGround;
    private Integer trueHeading;
    private Double longitude;
    private Double latitude;
    private Long timestamp;

    public Vessel(Long mmsi, String vesselType) {
        this.mmsi = mmsi;
        this.vesselType = vesselType;
    }

    //API-friendly getters (computed fields)
    public String getType() {
        return vesselType != null ? vesselType : "unknown";
    }

    //heading 511 = "not available" or "heading not available"
    public Double getHeading() {
        return trueHeading != null && trueHeading != 511 ? trueHeading.doubleValue() : null;
    }

    public String getStatus() {
        if (navigationalStatus == null) return "Unknown";
        switch (navigationalStatus) {
            case 0: return "Under way using engine";
            case 1: return "At anchor";
            case 2: return "Not under command";
            case 3: return "Restricted manoeuvrability";
            case 4: return "Constrained by her draught";
            case 5: return "Moored";
            case 6: return "Aground";
            case 7: return "Engaged in fishing";
            case 8: return "Under way sailing";
            case 9: return "reserved for future amendment of navigational status for ships carrying DG";
            case 10: return "reserved for future amendment of navigational status for ships carrying dangerous goods (DG)";
            case 11, 12, 13: return "reserved for future use";
            case 14: return "AIS-SART (active)";
            case 15: return "Not defined";
            default: return "Unknown";
        }
    }
}