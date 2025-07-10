package com.seax.back.model;

public class RegisterResponse {
    private final String message;
    private final String token;

    public RegisterResponse(String message, String token) {
        this.message = message;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }
}
