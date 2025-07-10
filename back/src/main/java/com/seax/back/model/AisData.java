package com.seax.back.model;

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

    public AisData() {
    }

    public AisData(long sourcemmsi, int navigationalstatus, int rateofturn,
                   double speedoverground, double courseoverground, int trueheading,
                   double lon, double lat, long timestamp) {
        //Copy dynamic fields
        this.sourcemmsi = sourcemmsi;
        this.navigationalstatus = navigationalstatus;
        this.rateofturn = rateofturn;
        this.speedoverground = speedoverground;
        this.courseoverground = courseoverground;
        this.trueheading = trueheading;
        this.lon = lon;
        this.lat = lat;
        this.timestamp = timestamp;

        //Copy static fields
        this.name = null;
        this.type = null;
        this.country = null;
        this.imo = null;
        this.callsign = null;
    }

    //Dynamic field getters and setters
    public long getSourcemmsi() {
        return sourcemmsi;
    }

    public void setSourcemmsi(long sourcemmsi) {
        this.sourcemmsi = sourcemmsi;
    }

    public int getNavigationalstatus() {
        return navigationalstatus;
    }

    public void setNavigationalstatus(int navigationalstatus) {
        this.navigationalstatus = navigationalstatus;
    }

    public int getRateofturn() {
        return rateofturn;
    }

    public void setRateofturn(int rateofturn) {
        this.rateofturn = rateofturn;
    }

    public double getSpeedoverground() {
        return speedoverground;
    }

    public void setSpeedoverground(double speedoverground) {
        this.speedoverground = speedoverground;
    }

    public double getCourseoverground() {
        return courseoverground;
    }

    public void setCourseoverground(double courseoverground) {
        this.courseoverground = courseoverground;
    }

    public int getTrueheading() {
        return trueheading;
    }

    public void setTrueheading(int trueheading) {
        this.trueheading = trueheading;
    }

    public double getLon() {
        return lon;
    }

    public void setLon(double lon) {
        this.lon = lon;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    //Static field getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Long getImo() {
        return imo;
    }

    public void setImo(Long imo) {
        this.imo = imo;
    }

    public String getCallsign() {
        return callsign;
    }

    public void setCallsign(String callsign) {
        this.callsign = callsign;
    }

}


