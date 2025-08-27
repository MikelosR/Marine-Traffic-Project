package com.seax.back.model;

import lombok.Value;

@Value
public class RegisterResponse {
    String message;
    String token;
}
