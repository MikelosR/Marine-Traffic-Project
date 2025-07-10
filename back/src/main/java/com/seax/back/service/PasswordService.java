package com.seax.back.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    //Hash a plain text password
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }

    //Check if plain password matches hashed password
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
}