package com.seax.back.model;

import lombok.Value;

@Value //Getter methods for all fields (no setters, since it's immutable)
public class LoginResponse {
    //All fields become private final (@Value)
    String message;
    String role;
    String token;
}
