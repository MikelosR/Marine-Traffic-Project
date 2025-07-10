package com.seax.back.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Point {

    private long lat;
    private long lon;

    public Point() {
    }

    public Point(long lat, long lon) {
        this.lat = lat;
        this.lon = lon;
    }

    public long getLat() {
        return lat;
    }

    public void setLat(long lat) {
        this.lat = lat;
    }

    public long getLon() {
        return lon;
    }

    public void setLon(long lon) {
        this.lon = lon;
    }
}
