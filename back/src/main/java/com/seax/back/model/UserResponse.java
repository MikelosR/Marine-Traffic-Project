package com.seax.back.model;

import lombok.Value;

@Value
public class UserResponse {
    Long id;
    String firstName;
    String lastName;
    String email;
    String role;
}
