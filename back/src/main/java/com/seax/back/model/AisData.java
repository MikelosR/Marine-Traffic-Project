package com.seax.back.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AisData {
    private long sourcemmsi;
    private int navigationalstatus;
    private int rateofturn;
    private double speedoverground;
    private double courseoverground;
    private int trueheading;
    private double lon;
    private double lat;
    private long timestamp;

    //Static fields (from Vessel entity)
    private String name;
    private String type;
    private String country;
    private Long imo;
    private String callsign;

    //Custom constructor for dynamic fields only
    public AisData(long sourcemmsi, int navigationalstatus, int rateofturn,
                   double speedoverground, double courseoverground, int trueheading,
                   double lon, double lat, long timestamp) {
        this.sourcemmsi = sourcemmsi;
        this.navigationalstatus = navigationalstatus;
        this.rateofturn = rateofturn;
        this.speedoverground = speedoverground;
        this.courseoverground = courseoverground;
        this.trueheading = trueheading;
        this.lon = lon;
        this.lat = lat;
        this.timestamp = timestamp;
        //Static fields remain null by default
    }
}