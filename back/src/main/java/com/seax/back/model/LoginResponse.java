package com.seax.back.model;

public class LoginResponse{
    private final String message; //final - set once, never changes
    private final String role;
    private final String token;

    public LoginResponse(String message, String role, String token) {
        this.message = message;
        this.role = role;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}
